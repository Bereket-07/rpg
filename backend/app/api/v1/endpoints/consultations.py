from datetime import datetime
from typing import List, Optional, Tuple
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_

from app.api import deps
from app.models.author_category import Author
from app.models.consultations import ContactInquiry, BookingRequest, ConsultationEvent
from app.models.user import User, Role
from app.schemas.consultations import (
    ContactInquiryCreate, ContactInquiryUpdate, ContactInquiryResponse,
    BookingRequestCreate, BookingRequestUpdate, BookingRequestResponse,
    ConsultationEventResponse
)
from app.core import email as email_module

router = APIRouter()


def _user_label(user: Optional[User]) -> str:
    if not user:
        return "Client"
    return user.email or f"User #{user.id}"


def _enum_value(value):
    return value.value if hasattr(value, "value") else value


def _log_event(
    db: AsyncSession,
    target_type: str,
    target_id: int,
    event_type: str,
    message: str,
    actor: Optional[User] = None,
    metadata: Optional[dict] = None,
) -> None:
    db.add(
        ConsultationEvent(
            target_type=target_type,
            target_id=target_id,
            event_type=event_type,
            actor_id=actor.id if actor else None,
            actor_label=_user_label(actor),
            message=message,
            event_metadata=metadata or {},
        )
    )


async def _find_booking_clinician(
    db: AsyncSession,
    booking: BookingRequest,
) -> Tuple[Optional[Author], Optional[User]]:
    author = None
    if booking.assigned_author_id:
        result = await db.execute(select(Author).where(Author.id == booking.assigned_author_id))
        author = result.scalar_one_or_none()

    if not author and booking.therapist_preference:
        result = await db.execute(
            select(Author).where(Author.name.ilike(f"%{booking.therapist_preference}%"))
        )
        author = result.scalar_one_or_none()

    if not author:
        return None, None

    result = await db.execute(select(User).where(User.author_id == author.id, User.is_active == True))
    return author, result.scalar_one_or_none()

# ─── Contact Inquiries ────────────────────────────────────────────────────────

@router.post("/inquiries", response_model=ContactInquiryResponse)
async def submit_inquiry(
    inquiry_in: ContactInquiryCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(deps.get_db)
):
    """Public endpoint — no auth required. Stores inquiry and emails the practice."""
    db_inquiry = ContactInquiry(**inquiry_in.model_dump())
    db.add(db_inquiry)
    await db.commit()
    await db.refresh(db_inquiry)
    _log_event(
        db,
        "inquiry",
        db_inquiry.id,
        "submitted",
        "Contact inquiry submitted by client.",
        metadata={"subject": db_inquiry.subject or "General Inquiry"},
    )
    await db.commit()
    # Notify practice via email
    background_tasks.add_task(
        email_module.send_inquiry_notification,
        db_inquiry.first_name,
        db_inquiry.last_name,
        db_inquiry.email,
        db_inquiry.subject or "General Inquiry",
        db_inquiry.message
    )
    # Send receipt to client
    background_tasks.add_task(
        email_module.send_inquiry_received_client_email,
        db_inquiry.email,
        db_inquiry.first_name,
        db_inquiry.last_name,
        db_inquiry.subject or "General Inquiry",
    )
    return db_inquiry

@router.get("/inquiries", response_model=List[ContactInquiryResponse])
async def get_inquiries(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Admin only."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Not permitted")
    result = await db.execute(
        select(ContactInquiry).order_by(ContactInquiry.submitted_at.desc())
    )
    return result.scalars().all()

@router.patch("/inquiries/{inquiry_id}", response_model=ContactInquiryResponse)
async def update_inquiry_status(
    inquiry_id: int,
    inquiry_in: ContactInquiryUpdate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Update status (new → read → responded). Admin only."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Not permitted")
    result = await db.execute(select(ContactInquiry).filter(ContactInquiry.id == inquiry_id))
    inquiry = result.scalar_one_or_none()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    update_data = inquiry_in.model_dump(exclude_unset=True)
    previous_status = _enum_value(inquiry.status)
    previous_notes = inquiry.admin_notes
    for field, value in update_data.items():
        setattr(inquiry, field, value)
    messages = []
    if "status" in update_data and update_data["status"] != previous_status:
        messages.append(f"Status changed from {previous_status} to {update_data['status']}.")
    if "admin_notes" in update_data and update_data["admin_notes"] != previous_notes:
        messages.append("Internal notes updated.")
    if messages:
        _log_event(
            db,
            "inquiry",
            inquiry.id,
            "updated",
            " ".join(messages),
            actor=current_user,
            metadata={"changes": update_data},
        )
    db.add(inquiry)
    await db.commit()
    await db.refresh(inquiry)
    # When admin marks inquiry as responded, notify the client
    if "status" in update_data and update_data["status"] == "responded" and previous_status != "responded":
        background_tasks.add_task(
            email_module.send_inquiry_responded_client_email,
            inquiry.email,
            inquiry.first_name,
            inquiry.last_name,
            inquiry.subject or "General Inquiry",
        )
    return inquiry

@router.delete("/inquiries/{inquiry_id}")
async def delete_inquiry(
    inquiry_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if current_user.role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Not permitted")
    result = await db.execute(select(ContactInquiry).filter(ContactInquiry.id == inquiry_id))
    inquiry = result.scalar_one_or_none()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    await db.delete(inquiry)
    await db.commit()
    return {"ok": True}

@router.get("/inquiries/{inquiry_id}/events", response_model=List[ConsultationEventResponse])
async def get_inquiry_events(
    inquiry_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if current_user.role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Not permitted")
    result = await db.execute(
        select(ConsultationEvent)
        .where(ConsultationEvent.target_type == "inquiry", ConsultationEvent.target_id == inquiry_id)
        .order_by(ConsultationEvent.created_at.desc())
    )
    return result.scalars().all()

# ─── Booking Requests ─────────────────────────────────────────────────────────

@router.post("/bookings", response_model=BookingRequestResponse)
async def submit_booking(
    booking_in: BookingRequestCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(deps.get_db)
):
    """Public endpoint — no auth required. Stores booking and emails the practice."""
    db_booking = BookingRequest(**booking_in.model_dump())
    db.add(db_booking)
    await db.commit()
    await db.refresh(db_booking)
    _log_event(
        db,
        "booking",
        db_booking.id,
        "submitted",
        "Booking request submitted by client.",
        metadata={
            "requested_date": db_booking.requested_date,
            "requested_time": db_booking.requested_time,
            "therapist_preference": db_booking.therapist_preference,
            "presenting_concern": db_booking.presenting_concern,
            "urgency": db_booking.urgency,
        },
    )
    _log_event(
        db,
        "booking",
        db_booking.id,
        "notification_queued",
        "Client receipt and practice notification queued.",
        metadata={"channels": ["client_email", "practice_email"]},
    )
    await db.commit()
    background_tasks.add_task(
        email_module.send_booking_notification,
        db_booking.first_name,
        db_booking.last_name,
        db_booking.email,
        db_booking.requested_date,
        db_booking.requested_time,
        db_booking.therapist_preference or "No preference",
        db_booking.notes or "",
        db_booking.presenting_concern,
        db_booking.urgency,
        db_booking.preferred_contact_method,
    )
    background_tasks.add_task(
        email_module.send_booking_received_client_email,
        db_booking.email,
        db_booking.first_name,
        db_booking.last_name,
        db_booking.requested_date,
        db_booking.requested_time,
        db_booking.therapist_preference or "No preference",
        db_booking.presenting_concern,
        db_booking.urgency,
        db_booking.preferred_contact_method,
    )
    return db_booking

@router.get("/bookings", response_model=List[BookingRequestResponse])
async def get_bookings(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Admin only."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Not permitted")
    result = await db.execute(
        select(BookingRequest).order_by(BookingRequest.submitted_at.desc())
    )
    return result.scalars().all()

@router.get("/bookings/my", response_model=List[BookingRequestResponse])
async def get_my_bookings(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Clinician view for requests assigned to or naming their author profile."""
    if current_user.role == Role.ADMIN:
        result = await db.execute(
            select(BookingRequest).order_by(BookingRequest.submitted_at.desc())
        )
        return result.scalars().all()

    if not current_user.author_id:
        return []

    author_result = await db.execute(select(Author).where(Author.id == current_user.author_id))
    author = author_result.scalar_one_or_none()
    conditions = [BookingRequest.assigned_author_id == current_user.author_id]
    if author and author.name:
        conditions.append(BookingRequest.therapist_preference.ilike(f"%{author.name}%"))

    result = await db.execute(
        select(BookingRequest)
        .where(or_(*conditions))
        .order_by(BookingRequest.submitted_at.desc())
    )
    return result.scalars().all()

@router.patch("/bookings/{booking_id}", response_model=BookingRequestResponse)
async def update_booking_status(
    booking_id: int,
    booking_in: BookingRequestUpdate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Update status (new → confirmed / declined). Admin only."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Not permitted")
    result = await db.execute(select(BookingRequest).filter(BookingRequest.id == booking_id))
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    previous_status = _enum_value(booking.status)
    previous_assigned_author_id = booking.assigned_author_id
    previous_notes = booking.admin_notes
    previous_video_link = booking.video_link
    update_data = booking_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(booking, field, value)
    next_status = update_data.get("status", previous_status)
    now = datetime.utcnow()
    if next_status == "confirmed" and previous_status != "confirmed":
        booking.confirmed_at = now
        booking.last_notified_at = now
    elif next_status == "declined" and previous_status != "declined":
        booking.declined_at = now
        booking.last_notified_at = now
    elif next_status == "assigned_to_clinician" and previous_status != "assigned_to_clinician":
        booking.last_notified_at = now
    messages = []
    if "status" in update_data and next_status != previous_status:
        messages.append(f"Status changed from {previous_status} to {next_status}.")
    if "assigned_author_id" in update_data and booking.assigned_author_id != previous_assigned_author_id:
        messages.append("Assigned clinician updated.")
    if "admin_notes" in update_data and booking.admin_notes != previous_notes:
        messages.append("Internal notes updated.")
    if "video_link" in update_data and booking.video_link != previous_video_link:
        messages.append("Session link updated.")
    if messages:
        _log_event(
            db,
            "booking",
            booking.id,
            "updated",
            " ".join(messages),
            actor=current_user,
            metadata={"changes": update_data},
        )
    if next_status == "confirmed" and previous_status != "confirmed":
        _log_event(
            db,
            "booking",
            booking.id,
            "notification_queued",
            "Confirmation email queued for client.",
            actor=current_user,
            metadata={"recipient": "client"},
        )
    elif next_status == "declined" and previous_status != "declined":
        _log_event(
            db,
            "booking",
            booking.id,
            "notification_queued",
            "Decline email queued for client.",
            actor=current_user,
            metadata={"recipient": "client"},
        )
    elif next_status == "assigned_to_clinician" and previous_status != "assigned_to_clinician":
        _log_event(
            db,
            "booking",
            booking.id,
            "notification_queued",
            "Clinician assignment notification queued.",
            actor=current_user,
            metadata={"recipient": "clinician"},
        )
    db.add(booking)
    await db.commit()
    await db.refresh(booking)
    clinician, clinician_user = await _find_booking_clinician(db, booking)
    clinician_name = clinician.name if clinician else (booking.therapist_preference or "No preference")
    client_name = f"{booking.first_name} {booking.last_name}"

    if next_status == "confirmed" and previous_status != "confirmed":
        background_tasks.add_task(
            email_module.send_booking_confirmed_client_email,
            booking.email,
            booking.first_name,
            booking.last_name,
            booking.requested_date,
            booking.requested_time,
            clinician_name,
            booking.video_link,
            booking.presenting_concern,
            booking.urgency,
            booking.preferred_contact_method,
        )
        if clinician_user and clinician_user.email:
            background_tasks.add_task(
                email_module.send_booking_clinician_notification,
                clinician_user.email,
                clinician_name,
                client_name,
                booking.requested_date,
                booking.requested_time,
                booking.id,
                "confirmed",
            )
    elif next_status == "declined" and previous_status != "declined":
        background_tasks.add_task(
            email_module.send_booking_declined_client_email,
            booking.email,
            booking.first_name,
            booking.last_name,
            booking.requested_date,
            booking.requested_time,
            clinician_name,
            booking.presenting_concern,
            booking.urgency,
            booking.preferred_contact_method,
        )
    elif next_status == "assigned_to_clinician" and previous_status != "assigned_to_clinician":
        if clinician_user and clinician_user.email:
            background_tasks.add_task(
                email_module.send_booking_clinician_notification,
                clinician_user.email,
                clinician_name,
                client_name,
                booking.requested_date,
                booking.requested_time,
                booking.id,
                "assigned to you",
            )
    return booking

@router.delete("/bookings/{booking_id}")
async def delete_booking(
    booking_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if current_user.role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Not permitted")
    result = await db.execute(select(BookingRequest).filter(BookingRequest.id == booking_id))
    booking = result.scalar_one_or_none()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    await db.delete(booking)
    await db.commit()
    return {"ok": True}

@router.get("/bookings/{booking_id}/events", response_model=List[ConsultationEventResponse])
async def get_booking_events(
    booking_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if current_user.role != Role.ADMIN:
        if not current_user.author_id:
            raise HTTPException(status_code=403, detail="Not permitted")
        booking_result = await db.execute(select(BookingRequest).where(BookingRequest.id == booking_id))
        booking = booking_result.scalar_one_or_none()
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        clinician, _ = await _find_booking_clinician(db, booking)
        if booking.assigned_author_id != current_user.author_id and (not clinician or clinician.id != current_user.author_id):
            raise HTTPException(status_code=403, detail="Not permitted")
    result = await db.execute(
        select(ConsultationEvent)
        .where(ConsultationEvent.target_type == "booking", ConsultationEvent.target_id == booking_id)
        .order_by(ConsultationEvent.created_at.desc())
    )
    return result.scalars().all()

# ─── Counts (for dashboard badge) ────────────────────────────────────────────

@router.get("/counts")
async def get_consultation_counts(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Returns count of new (unread) inquiries and bookings. Admin only."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Not permitted")
    from sqlalchemy import func
    inq_result = await db.execute(
        select(func.count()).select_from(ContactInquiry).where(ContactInquiry.status == "new")
    )
    book_result = await db.execute(
        select(func.count()).select_from(BookingRequest).where(BookingRequest.status == "new")
    )
    return {
        "new_inquiries": inq_result.scalar(),
        "new_bookings": book_result.scalar()
    }


# ─── KPI Stats ────────────────────────────────────────────────────────────────

@router.get("/stats")
async def get_consultation_stats(
    period: str = "month",   # week | month | year
    author_id: Optional[int] = None,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    KPI stats for clinicians and admins.
    - Admin: aggregate or per-clinician (pass author_id)
    - Clinician: own stats only
    """
    from sqlalchemy import func
    from datetime import timedelta

    now = datetime.utcnow()
    if period == "week":
        since = now - timedelta(days=7)
    elif period == "year":
        since = now - timedelta(days=365)
    else:
        since = now - timedelta(days=30)

    is_admin = current_user.role == Role.ADMIN

    # Build base query filters
    def build_query(aid: Optional[int] = None):
        q = select(BookingRequest)
        if aid:
            q = q.where(BookingRequest.assigned_author_id == aid)
        elif not is_admin:
            # Clinician sees only their own
            q = q.where(BookingRequest.assigned_author_id == current_user.author_id)
        return q

    async def compute_stats(aid: Optional[int] = None, name: str = "All"):
        all_q = await db.execute(build_query(aid))
        all_bookings = all_q.scalars().all()

        period_q = await db.execute(
            build_query(aid).where(BookingRequest.submitted_at >= since)
        )
        period_bookings = period_q.scalars().all()

        total = len(all_bookings)
        confirmed = sum(1 for b in all_bookings if _enum_value(b.status) in ("confirmed", "completed"))
        declined = sum(1 for b in all_bookings if _enum_value(b.status) == "declined")
        pending = sum(1 for b in all_bookings if _enum_value(b.status) in ("new", "reviewing"))
        acceptance_rate = round((confirmed / (confirmed + declined) * 100), 1) if (confirmed + declined) > 0 else 0.0

        by_concern: dict = {}
        for b in all_bookings:
            concern = b.presenting_concern or "Other"
            by_concern[concern] = by_concern.get(concern, 0) + 1

        by_status: dict = {}
        for b in all_bookings:
            s = _enum_value(b.status)
            by_status[s] = by_status.get(s, 0) + 1

        return {
            "clinician_name": name,
            "author_id": aid,
            "total_bookings": total,
            "confirmed": confirmed,
            "declined": declined,
            "pending": pending,
            "acceptance_rate": acceptance_rate,
            "this_period_bookings": len(period_bookings),
            "period": period,
            "by_concern": dict(sorted(by_concern.items(), key=lambda x: -x[1])[:6]),
            "by_status": by_status,
        }

    # Admin: all clinicians breakdown
    if is_admin and not author_id:
        authors_result = await db.execute(select(Author).where(Author.is_team_member == True))
        authors = authors_result.scalars().all()
        clinician_stats = []
        for a in authors:
            stats = await compute_stats(a.id, a.name)
            clinician_stats.append(stats)
        aggregate = await compute_stats(None, "All Clinicians")
        return {"aggregate": aggregate, "clinicians": clinician_stats}

    # Admin querying specific clinician
    if is_admin and author_id:
        author_result = await db.execute(select(Author).where(Author.id == author_id))
        author = author_result.scalar_one_or_none()
        name = author.name if author else f"Clinician #{author_id}"
        return await compute_stats(author_id, name)

    # Clinician: their own stats
    return await compute_stats(current_user.author_id, current_user.email or "Me")

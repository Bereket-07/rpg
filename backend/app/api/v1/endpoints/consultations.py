from datetime import datetime
from typing import List, Optional, Tuple
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_

from app.api import deps
from app.models.author_category import Author
from app.models.consultations import ContactInquiry, BookingRequest
from app.models.user import User, Role
from app.schemas.consultations import (
    ContactInquiryCreate, ContactInquiryUpdate, ContactInquiryResponse,
    BookingRequestCreate, BookingRequestUpdate, BookingRequestResponse
)
from app.core import email as email_module

router = APIRouter()


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
    # Notify practice via email
    background_tasks.add_task(
        email_module.send_inquiry_notification,
        db_inquiry.first_name,
        db_inquiry.last_name,
        db_inquiry.email,
        db_inquiry.subject or "General Inquiry",
        db_inquiry.message
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
    for field, value in update_data.items():
        setattr(inquiry, field, value)
    db.add(inquiry)
    await db.commit()
    await db.refresh(inquiry)
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
    background_tasks.add_task(
        email_module.send_booking_notification,
        db_booking.first_name,
        db_booking.last_name,
        db_booking.email,
        db_booking.requested_date,
        db_booking.requested_time,
        db_booking.therapist_preference or "No preference",
        db_booking.notes or ""
    )
    background_tasks.add_task(
        email_module.send_booking_received_client_email,
        db_booking.email,
        db_booking.first_name,
        db_booking.last_name,
        db_booking.requested_date,
        db_booking.requested_time,
        db_booking.therapist_preference or "No preference",
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
    previous_status = booking.status.value if hasattr(booking.status, "value") else booking.status
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

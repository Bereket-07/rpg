from typing import List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api import deps
from app.models.consultations import ContactInquiry, BookingRequest
from app.models.user import User, Role
from app.schemas.consultations import (
    ContactInquiryCreate, ContactInquiryUpdate, ContactInquiryResponse,
    BookingRequestCreate, BookingRequestUpdate, BookingRequestResponse
)
from app.core import email as email_module

router = APIRouter()

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

@router.patch("/bookings/{booking_id}", response_model=BookingRequestResponse)
async def update_booking_status(
    booking_id: int,
    booking_in: BookingRequestUpdate,
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
    update_data = booking_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(booking, field, value)
    db.add(booking)
    await db.commit()
    await db.refresh(booking)
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

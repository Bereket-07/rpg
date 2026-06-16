"""
Clinician Availability API
- Blocked slots management (CRUD)
- Real-time available time slots per date
"""
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel

from app.api import deps
from app.models.author_category import Author, ClinicianBlockedSlot
from app.models.consultations import BookingRequest
from app.models.user import User, Role

router = APIRouter()

# All possible time slots during a day (9AM–6PM, hourly)
ALL_SLOTS = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
    "05:00 PM", "06:00 PM",
]


class BlockedSlotCreate(BaseModel):
    blocked_date: str       # YYYY-MM-DD
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    is_full_day: bool = False
    reason: Optional[str] = None


class BlockedSlotResponse(BaseModel):
    id: int
    author_id: int
    blocked_date: str
    start_time: Optional[str]
    end_time: Optional[str]
    is_full_day: bool
    reason: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


def _parse_hour(time_str: str) -> int:
    """Convert '09:00 AM' / '01:00 PM' to 24-hour int for comparison."""
    try:
        dt = datetime.strptime(time_str.strip(), "%I:%M %p")
        return dt.hour
    except Exception:
        return -1


def _slot_blocked(slot: str, blocks: List[ClinicianBlockedSlot]) -> bool:
    slot_hour = _parse_hour(slot)
    for b in blocks:
        if b.is_full_day:
            return True
        if b.start_time and b.end_time:
            start_h = _parse_hour(b.start_time)
            end_h = _parse_hour(b.end_time)
            if start_h <= slot_hour < end_h:
                return True
    return False


@router.get("/{author_id}/blocked-slots", response_model=List[BlockedSlotResponse])
async def get_blocked_slots(
    author_id: int,
    month: Optional[str] = None,   # YYYY-MM
    db: AsyncSession = Depends(deps.get_db),
):
    """Public — returns blocked slots for a clinician, optionally filtered by month."""
    q = select(ClinicianBlockedSlot).where(ClinicianBlockedSlot.author_id == author_id)
    if month:
        q = q.where(ClinicianBlockedSlot.blocked_date.startswith(month))
    result = await db.execute(q.order_by(ClinicianBlockedSlot.blocked_date))
    return result.scalars().all()


@router.post("/{author_id}/blocked-slots", response_model=BlockedSlotResponse)
async def create_blocked_slot(
    author_id: int,
    payload: BlockedSlotCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Clinician can block their own slots; admin can block any."""
    is_admin = current_user.role == Role.ADMIN
    is_own = current_user.author_id == author_id

    if not is_admin and not is_own:
        raise HTTPException(status_code=403, detail="You can only manage your own availability")

    # Verify author exists
    author_result = await db.execute(select(Author).where(Author.id == author_id))
    if not author_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Clinician not found")

    slot = ClinicianBlockedSlot(
        author_id=author_id,
        blocked_date=payload.blocked_date,
        start_time=payload.start_time,
        end_time=payload.end_time,
        is_full_day=payload.is_full_day,
        reason=payload.reason,
    )
    db.add(slot)
    await db.commit()
    await db.refresh(slot)
    return slot


@router.delete("/{author_id}/blocked-slots/{slot_id}")
async def delete_blocked_slot(
    author_id: int,
    slot_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Clinician removes own block; admin removes any."""
    is_admin = current_user.role == Role.ADMIN
    is_own = current_user.author_id == author_id

    if not is_admin and not is_own:
        raise HTTPException(status_code=403, detail="Not permitted")

    result = await db.execute(
        select(ClinicianBlockedSlot).where(
            ClinicianBlockedSlot.id == slot_id,
            ClinicianBlockedSlot.author_id == author_id,
        )
    )
    slot = result.scalar_one_or_none()
    if not slot:
        raise HTTPException(status_code=404, detail="Blocked slot not found")

    await db.delete(slot)
    await db.commit()
    return {"ok": True}


@router.get("/{author_id}/available-slots")
async def get_available_slots(
    author_id: int,
    date: str,   # YYYY-MM-DD
    db: AsyncSession = Depends(deps.get_db),
):
    """
    Public — returns list of time slots for a given date with availability status.
    Filters out: full-day blocks, time-range blocks, and dates with existing confirmed bookings.
    """
    # Get clinician
    author_result = await db.execute(select(Author).where(Author.id == author_id))
    author = author_result.scalar_one_or_none()
    if not author:
        raise HTTPException(status_code=404, detail="Clinician not found")

    # Check weekday availability (available_weekdays uses Mon=1 ... Sun=7)
    try:
        dt = datetime.strptime(date, "%Y-%m-%d")
        weekday = dt.isoweekday()   # 1=Mon, 7=Sun
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    available_weekdays = author.available_weekdays or [1, 2, 3, 4, 5]
    if weekday not in available_weekdays:
        return [{"time": s, "available": False, "reason": "Not a working day"} for s in ALL_SLOTS]

    # Get blocked slots for this date
    blocks_result = await db.execute(
        select(ClinicianBlockedSlot).where(
            ClinicianBlockedSlot.author_id == author_id,
            ClinicianBlockedSlot.blocked_date == date,
        )
    )
    blocks = blocks_result.scalars().all()

    # Check full-day block first
    if any(b.is_full_day for b in blocks):
        return [{"time": s, "available": False, "reason": "Clinician unavailable"} for s in ALL_SLOTS]

    # Get confirmed bookings on this date
    bookings_result = await db.execute(
        select(BookingRequest).where(
            BookingRequest.assigned_author_id == author_id,
            BookingRequest.requested_date == date,
            BookingRequest.status.in_(["confirmed", "completed"]),
        )
    )
    confirmed_bookings = bookings_result.scalars().all()
    booked_times = {b.requested_time for b in confirmed_bookings}

    # Build slot list
    slots = []
    for slot in ALL_SLOTS:
        if slot in booked_times:
            slots.append({"time": slot, "available": False, "reason": "Already booked"})
        elif _slot_blocked(slot, blocks):
            slots.append({"time": slot, "available": False, "reason": "Clinician unavailable"})
        else:
            slots.append({"time": slot, "available": True, "reason": None})

    return slots

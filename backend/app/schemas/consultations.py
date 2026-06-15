from typing import Any, Dict, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict

# --- Contact Inquiry Schemas ---
class ContactInquiryCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    subject: Optional[str] = None
    message: str

class ContactInquiryUpdate(BaseModel):
    status: Optional[str] = None
    admin_notes: Optional[str] = None

class ContactInquiryResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    subject: Optional[str] = None
    message: str
    admin_notes: Optional[str] = None
    status: str
    submitted_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Booking Request Schemas ---
class BookingRequestCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    requested_date: str
    requested_time: str
    therapist_preference: Optional[str] = None
    presenting_concern: Optional[str] = None
    urgency: Optional[str] = None
    preferred_contact_method: Optional[str] = None
    notes: Optional[str] = None

class BookingRequestUpdate(BaseModel):
    status: Optional[str] = None
    assigned_author_id: Optional[int] = None
    admin_notes: Optional[str] = None
    video_link: Optional[str] = None
    presenting_concern: Optional[str] = None
    urgency: Optional[str] = None
    preferred_contact_method: Optional[str] = None

class BookingRequestResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    requested_date: str
    requested_time: str
    therapist_preference: Optional[str] = None
    presenting_concern: Optional[str] = None
    urgency: Optional[str] = None
    preferred_contact_method: Optional[str] = None
    notes: Optional[str] = None
    assigned_author_id: Optional[int] = None
    admin_notes: Optional[str] = None
    video_link: Optional[str] = None
    status: str
    submitted_at: datetime
    confirmed_at: Optional[datetime] = None
    declined_at: Optional[datetime] = None
    last_notified_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ConsultationEventResponse(BaseModel):
    id: int
    target_type: str
    target_id: int
    event_type: str
    actor_id: Optional[int] = None
    actor_label: Optional[str] = None
    message: str
    event_metadata: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

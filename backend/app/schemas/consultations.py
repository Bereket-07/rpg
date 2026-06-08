from typing import Optional
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

class ContactInquiryResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    subject: Optional[str] = None
    message: str
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
    notes: Optional[str] = None

class BookingRequestUpdate(BaseModel):
    status: Optional[str] = None

class BookingRequestResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    requested_date: str
    requested_time: str
    therapist_preference: Optional[str] = None
    notes: Optional[str] = None
    status: str
    submitted_at: datetime

    model_config = ConfigDict(from_attributes=True)

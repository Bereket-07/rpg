from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Enum as SAEnum, ForeignKey
from app.db.session import Base
import enum

class InquiryStatus(str, enum.Enum):
    new = "new"
    read = "read"
    responded = "responded"

class BookingStatus(str, enum.Enum):
    new = "new"
    reviewing = "reviewing"
    assigned_to_clinician = "assigned_to_clinician"
    awaiting_client = "awaiting_client"
    confirmed = "confirmed"
    declined = "declined"
    waitlisted = "waitlisted"
    completed = "completed"

class ContactInquiry(Base):
    __tablename__ = "contact_inquiries"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, nullable=False, index=True)
    subject = Column(String, nullable=True)
    message = Column(Text, nullable=False)
    admin_notes = Column(Text, nullable=True)
    status = Column(SAEnum(InquiryStatus), default=InquiryStatus.new, nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow)

class BookingRequest(Base):
    __tablename__ = "booking_requests"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, nullable=False, index=True)
    phone = Column(String, nullable=True)
    requested_date = Column(String, nullable=False)   # stored as ISO string e.g. "2026-06-10"
    requested_time = Column(String, nullable=False)   # e.g. "10:30 AM"
    therapist_preference = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    assigned_author_id = Column(Integer, ForeignKey("authors.id"), nullable=True)
    admin_notes = Column(Text, nullable=True)
    video_link = Column(String, nullable=True)
    status = Column(SAEnum(BookingStatus), default=BookingStatus.new, nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    confirmed_at = Column(DateTime, nullable=True)
    declined_at = Column(DateTime, nullable=True)
    last_notified_at = Column(DateTime, nullable=True)

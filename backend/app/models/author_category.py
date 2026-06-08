from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.session import Base

class Author(Base):
    __tablename__ = "authors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    bio = Column(Text, nullable=True)
    credentials = Column(String, nullable=True)
    profile_image_url = Column(String, nullable=True)
    role = Column(String, nullable=True)
    beyond_therapy = Column(Text, nullable=True)
    approach_paragraphs = Column(JSON, nullable=True) # JSON list of paragraphs
    background_paragraphs = Column(JSON, nullable=True) # JSON list of background education
    specialties_list = Column(JSON, nullable=True) # JSON list of {title, desc} objects
    is_team_member = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Calendar / Booking integration
    calendar_type = Column(String, nullable=True)  # 'calendly' | 'cal_com' | 'google_calendar' | 'other'
    booking_link = Column(String, nullable=True)   # URL for Calendly/Cal.com/custom
    google_calendar_token = Column(JSON, nullable=True)  # Encrypted OAuth token for Google Calendar
    google_calendar_id = Column(String, nullable=True)   # e.g. 'primary' or specific calendar ID

    # Relationship to articles
    articles = relationship("Article", back_populates="author")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, unique=True, nullable=False)
    slug = Column(String, index=True, unique=True, nullable=False)
    description = Column(Text, nullable=True)

    # Relationship to articles
    articles = relationship("Article", back_populates="category")

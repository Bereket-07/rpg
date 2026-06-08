from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum
from sqlalchemy import Enum
from app.db.session import Base

class Role(str, PyEnum):
    ADMIN = "ADMIN"
    AUTHOR = "AUTHOR"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(Role), default=Role.AUTHOR, nullable=False)
    is_active = Column(Boolean, default=True)
    must_change_password = Column(Boolean, default=False)
    
    # Optional mapping to an Author profile so the system knows what Author data to use when a user writes an article
    author_id = Column(Integer, ForeignKey("authors.id"), nullable=True)
    author_profile = relationship("Author")

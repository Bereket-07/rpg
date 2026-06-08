from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.author_category import Author, Category # Ensure imports for relationships

class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    slug = Column(String, index=True, unique=True, nullable=False)
    content = Column(Text, nullable=False)
    excerpt = Column(Text, nullable=True)
    cover_image_url = Column(String, nullable=True)
    published = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    published_at = Column(DateTime, nullable=True)

    # Foreign Keys
    author_id = Column(Integer, ForeignKey("authors.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)

    # Relationships
    author = relationship("Author", back_populates="articles")
    category = relationship("Category", back_populates="articles")
    seo_meta = relationship("SEOMeta", back_populates="article", uselist=False, cascade="all, delete-orphan")


class SEOMeta(Base):
    __tablename__ = "seo_meta"

    id = Column(Integer, primary_key=True, index=True)
    article_id = Column(Integer, ForeignKey("articles.id"), unique=True, nullable=False)
    
    meta_title = Column(String(100), nullable=True)
    meta_description = Column(String(160), nullable=True)
    focus_keyword = Column(String(100), nullable=True)

    # Relationships
    article = relationship("Article", back_populates="seo_meta")

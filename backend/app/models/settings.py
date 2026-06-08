from sqlalchemy import Column, Integer, String, Text, JSON
from app.db.session import Base

class SiteSetting(Base):
    __tablename__ = "site_settings"

    id = Column(Integer, primary_key=True, index=True)
    font_sans = Column(String(100), default="Raleway", nullable=False)
    font_serif = Column(String(100), default="Merriweather", nullable=False)
    primary_color = Column(String(20), default="#7ebac8", nullable=False)
    background_color = Column(String(20), default="#FDF8F5", nullable=False)
    secondary_color = Column(String(20), default="#4a535e", nullable=False)
    text_color = Column(String(20), default="#4a535e", nullable=False)
    logo_url = Column(String(500), default="/assets/RPG Logo_Main Landscape.png", nullable=True)
    header_button_text = Column(String(100), default="Contact Us", nullable=True)
    footer_ready_text = Column(String(200), default="Ready to start?", nullable=True)
    footer_button_text = Column(String(100), default="Schedule a Consultation", nullable=True)


class PageContent(Base):
    __tablename__ = "page_contents"

    slug = Column(String(100), primary_key=True, index=True)
    title = Column(String(200), nullable=True)
    hero_title = Column(Text, nullable=True)
    hero_description = Column(Text, nullable=True)
    hero_image_url = Column(Text, nullable=True)
    content = Column(JSON, default=dict, nullable=False)

from typing import Optional, Any, Dict
from pydantic import BaseModel, ConfigDict

class SiteSettingBase(BaseModel):
    font_sans: str
    font_serif: str
    primary_color: str
    background_color: str
    secondary_color: str
    text_color: str
    logo_url: Optional[str] = None
    header_button_text: Optional[str] = None
    footer_ready_text: Optional[str] = None
    footer_button_text: Optional[str] = None

class SiteSettingUpdate(BaseModel):
    font_sans: Optional[str] = None
    font_serif: Optional[str] = None
    primary_color: Optional[str] = None
    background_color: Optional[str] = None
    secondary_color: Optional[str] = None
    text_color: Optional[str] = None
    logo_url: Optional[str] = None
    header_button_text: Optional[str] = None
    footer_ready_text: Optional[str] = None
    footer_button_text: Optional[str] = None

class SiteSettingResponse(SiteSettingBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class PageContentBase(BaseModel):
    slug: str
    title: Optional[str] = None
    hero_title: Optional[str] = None
    hero_description: Optional[str] = None
    hero_image_url: Optional[str] = None
    content: Dict[str, Any] = {}

class PageContentCreate(PageContentBase):
    pass

class PageContentUpdate(BaseModel):
    title: Optional[str] = None
    hero_title: Optional[str] = None
    hero_description: Optional[str] = None
    hero_image_url: Optional[str] = None
    content: Optional[Dict[str, Any]] = None

class PageContentResponse(PageContentBase):
    model_config = ConfigDict(from_attributes=True)

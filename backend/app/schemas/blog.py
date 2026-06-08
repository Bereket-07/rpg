from typing import Optional, List, Dict
from datetime import datetime
from pydantic import BaseModel, ConfigDict

# --- Category Schemas ---
class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None

class CategoryResponse(CategoryBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

# --- Author Schemas ---
class AuthorBase(BaseModel):
    name: str
    bio: Optional[str] = None
    credentials: Optional[str] = None
    profile_image_url: Optional[str] = None
    role: Optional[str] = None
    beyond_therapy: Optional[str] = None
    approach_paragraphs: Optional[List[str]] = None
    background_paragraphs: Optional[List[str]] = None
    specialties_list: Optional[List[Dict[str, str]]] = None
    is_team_member: bool = False

class AuthorCreate(AuthorBase):
    pass

class AuthorUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    credentials: Optional[str] = None
    profile_image_url: Optional[str] = None
    role: Optional[str] = None
    beyond_therapy: Optional[str] = None
    approach_paragraphs: Optional[List[str]] = None
    background_paragraphs: Optional[List[str]] = None
    specialties_list: Optional[List[Dict[str, str]]] = None
    is_team_member: Optional[bool] = None

class AuthorResponse(AuthorBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- SEOMeta Schemas ---
class SEOMetaBase(BaseModel):
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    focus_keyword: Optional[str] = None

class SEOMetaCreate(SEOMetaBase):
    pass

class SEOMetaUpdate(BaseModel):
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    focus_keyword: Optional[str] = None

class SEOMetaResponse(SEOMetaBase):
    id: int
    article_id: int

    model_config = ConfigDict(from_attributes=True)

# --- Article Schemas ---
class ArticleBase(BaseModel):
    title: str
    slug: str
    content: str
    excerpt: Optional[str] = None
    cover_image_url: Optional[str] = None
    published: bool = False
    author_id: int
    category_id: int

class ArticleCreate(ArticleBase):
    seo_meta: Optional[SEOMetaCreate] = None

class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    cover_image_url: Optional[str] = None
    published: Optional[bool] = None
    author_id: Optional[int] = None
    category_id: Optional[int] = None
    seo_meta: Optional[SEOMetaUpdate] = None

class ArticleResponse(ArticleBase):
    id: int
    created_at: datetime
    published_at: Optional[datetime] = None
    author: AuthorResponse
    category: CategoryResponse
    seo_meta: Optional[SEOMetaResponse] = None

    model_config = ConfigDict(from_attributes=True)

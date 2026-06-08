import asyncio
from typing import List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.future import select

from app.api import deps
from app.models.article import Article, SEOMeta
from app.models.newsletter import NewsletterSubscriber
from app.schemas.blog import ArticleCreate, ArticleUpdate, ArticleResponse
from app.core import email
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/", response_model=List[ArticleResponse])
async def read_articles(db: AsyncSession = Depends(deps.get_db), skip: int = 0, limit: int = 100):
    # We use selectinload to eagerly load the relationship data (Author, Category, SEOMeta)
    query = select(Article)\
        .options(selectinload(Article.author), \
                 selectinload(Article.category), \
                 selectinload(Article.seo_meta))\
        .offset(skip).limit(limit)
        
    result = await db.execute(query)
    articles = result.scalars().all()
    return articles

@router.get("/{slug}", response_model=ArticleResponse)
async def read_article_by_slug(slug: str, db: AsyncSession = Depends(deps.get_db)):
    query = select(Article)\
        .filter(Article.slug == slug)\
        .options(selectinload(Article.author), \
                 selectinload(Article.category), \
                 selectinload(Article.seo_meta))
                 
    result = await db.execute(query)
    article = result.scalar_one_or_none()
    
    if article is None:
        raise HTTPException(status_code=404, detail="Article not found")
    return article

@router.post("/", response_model=ArticleResponse)
async def create_article(
    article_in: ArticleCreate, 
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(deps.get_db)
):
    # Extract the nested seo_meta dictionary
    seo_data = article_in.seo_meta
    
    # Create the article dump, excluding the nested pydantic BaseModel piece
    article_dict = article_in.model_dump(exclude={"seo_meta"})
    db_article = Article(**article_dict)
    
    if seo_data:
        db_seo = SEOMeta(**seo_data.model_dump())
        db_article.seo_meta = db_seo

    db.add(db_article)
    await db.commit()
    await db.refresh(db_article)
    
    # Broadcast if published during creation and hasn't been broadcasted before
    if db_article.published and not db_article.published_at:
        db_article.published_at = datetime.utcnow()
        await db.commit()
        
        # Dispatch Broadcast
        subscribers_result = await db.execute(select(NewsletterSubscriber.email).filter(NewsletterSubscriber.is_active == True))
        emails = subscribers_result.scalars().all()
        if emails:
            background_tasks.add_task(email.send_article_broadcast, emails, db_article.title, db_article.excerpt, db_article.slug)
            logger.info(f"Article creation triggered broadcast for '{db_article.slug}'")

    # We must explicitly query the relationships back out for the Pydantic response model to fulfill Author/Category
    query = select(Article)\
        .filter(Article.id == db_article.id)\
        .options(selectinload(Article.author), \
                 selectinload(Article.category), \
                 selectinload(Article.seo_meta))
                 
    result = await db.execute(query)
    populated_article = result.scalar_one()

    return populated_article

@router.put("/{slug}", response_model=ArticleResponse)
async def update_article(
    slug: str, 
    article_in: ArticleUpdate, 
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(deps.get_db),
    current_user: dict = Depends(deps.get_current_user)
):
    query = select(Article)\
        .filter(Article.slug == slug)\
        .options(selectinload(Article.author), \
                 selectinload(Article.category), \
                 selectinload(Article.seo_meta))
                 
    result = await db.execute(query)
    article = result.scalar_one_or_none()
    
    if article is None:
        raise HTTPException(status_code=404, detail="Article not found")
        
    update_data = article_in.model_dump(exclude_unset=True, exclude={"seo_meta"})
    for field, value in update_data.items():
        setattr(article, field, value)
        
    if article_in.seo_meta and article.seo_meta:
        seo_update_data = article_in.seo_meta.model_dump(exclude_unset=True)
        for field, value in seo_update_data.items():
            setattr(article.seo_meta, field, value)
            
    db.add(article)
    await db.commit()
    await db.refresh(article)
    
    # Broadcast if transitioned to published and hasn't been broadcasted before
    if article.published and not article.published_at:
        article.published_at = datetime.utcnow()
        await db.commit()
        
        # Dispatch Broadcast
        subscribers_result = await db.execute(select(NewsletterSubscriber.email).filter(NewsletterSubscriber.is_active == True))
        emails = subscribers_result.scalars().all()
        if emails:
            background_tasks.add_task(email.send_article_broadcast, emails, article.title, article.excerpt, article.slug)
            logger.info(f"Article update triggered broadcast for '{article.slug}'")

    return article

@router.delete("/{slug}")
async def delete_article(
    slug: str, 
    db: AsyncSession = Depends(deps.get_db),
    current_user: dict = Depends(deps.get_current_user)
):
    result = await db.execute(select(Article).filter(Article.slug == slug).options(selectinload(Article.seo_meta)))
    article = result.scalar_one_or_none()
    
    if article is None:
        raise HTTPException(status_code=404, detail="Article not found")
        
    # Delete associated SEO Meta first to avoid foreign key constraints
    if article.seo_meta:
        await db.delete(article.seo_meta)
        
    await db.delete(article)
    await db.commit()
    return {"ok": True}

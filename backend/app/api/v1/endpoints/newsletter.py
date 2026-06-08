from typing import List
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel, EmailStr
import logging

from app.api import deps
from app.models.newsletter import NewsletterSubscriber
from app.models.user import User, Role
from app.core import email

logger = logging.getLogger(__name__)

router = APIRouter()

class NewsletterSubscription(BaseModel):
    email: EmailStr

class SubscriberResponse(BaseModel):
    id: int
    email: EmailStr
    is_active: bool
    
    class Config:
        from_attributes = True

@router.post("/")
async def subscribe_to_newsletter(
    subscription: NewsletterSubscription,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(deps.get_db)
):
    # Check if this email already exists
    result = await db.execute(select(NewsletterSubscriber).filter(NewsletterSubscriber.email == subscription.email))
    existing_sub = result.scalars().first()
    
    # If they are already subscribed, silently return success as per standard security specs
    if existing_sub:
        logger.info(f"Existing subscription ignored for {subscription.email}")
        return {"status": "success", "message": "Successfully subscribed."}

    # Save to PostgreSQL
    new_sub = NewsletterSubscriber(email=subscription.email)
    db.add(new_sub)
    await db.commit()
    await db.refresh(new_sub)
    
    logger.info(f"Successfully saved new subscriber to DB: {subscription.email}")
    
    # Dispatch an asynchronous Welcome Email
    background_tasks.add_task(email.send_welcome_email, subscription.email)
    
    return {
        "status": "success",
        "message": f"Successfully subscribed {subscription.email} to the newsletter.",
    }

@router.get("/", response_model=List[SubscriberResponse])
async def get_all_subscribers(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    # Strictly for Admins
    if current_user.role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Not permitted")
        
    result = await db.execute(select(NewsletterSubscriber).order_by(NewsletterSubscriber.subscribed_at.desc()))
    return result.scalars().all()

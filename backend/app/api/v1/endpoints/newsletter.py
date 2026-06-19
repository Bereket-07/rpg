import hashlib
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Response
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
    subscribed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BroadcastRequest(BaseModel):
    subject: str
    message: str  # plain text or simple HTML


@router.post("/")
async def subscribe_to_newsletter(
    subscription: NewsletterSubscription,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(deps.get_db)
):
    result = await db.execute(select(NewsletterSubscriber).filter(NewsletterSubscriber.email == subscription.email))
    existing_sub = result.scalars().first()

    if existing_sub:
        # Re-activate if unsubscribed
        if not existing_sub.is_active:
            existing_sub.is_active = True
            db.add(existing_sub)
            await db.commit()
            background_tasks.add_task(email.send_welcome_email, subscription.email)
        return {"status": "success", "message": "Successfully subscribed."}

    new_sub = NewsletterSubscriber(email=subscription.email)
    db.add(new_sub)
    await db.commit()
    await db.refresh(new_sub)
    logger.info(f"New subscriber: {subscription.email}")
    background_tasks.add_task(email.send_welcome_email, subscription.email)
    return {"status": "success", "message": f"Successfully subscribed {subscription.email}."}


@router.get("/", response_model=List[SubscriberResponse])
async def get_all_subscribers(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if current_user.role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Not permitted")
    result = await db.execute(select(NewsletterSubscriber).order_by(NewsletterSubscriber.subscribed_at.desc()))
    return result.scalars().all()


@router.post("/broadcast")
async def send_broadcast(
    payload: BroadcastRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Admin-only: send a custom broadcast email to all active subscribers."""
    if current_user.role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can send broadcasts")

    result = await db.execute(
        select(NewsletterSubscriber).filter(NewsletterSubscriber.is_active == True)
    )
    active_subs = result.scalars().all()
    if not active_subs:
        return {"sent": 0, "message": "No active subscribers."}

    emails_list = [s.email for s in active_subs]
    # Convert line breaks to HTML paragraphs
    message_html = "".join(
        f"<p style='margin:0 0 14px;'>{line}</p>"
        for line in payload.message.split("\n") if line.strip()
    )

    background_tasks.add_task(
        email.send_custom_broadcast,
        emails_list,
        payload.subject,
        message_html,
    )
    logger.info(f"Broadcast queued for {len(emails_list)} subscribers: '{payload.subject}'")
    return {"sent": len(emails_list), "message": f"Broadcast queued for {len(emails_list)} subscribers."}


@router.get("/unsubscribe")
async def unsubscribe(
    token: str,
    db: AsyncSession = Depends(deps.get_db)
):
    """Public endpoint — unsubscribe via token in email footer."""
    result = await db.execute(
        select(NewsletterSubscriber).filter(NewsletterSubscriber.is_active == True)
    )
    subscribers = result.scalars().all()

    target = None
    for sub in subscribers:
        expected_token = hashlib.sha256(sub.email.encode()).hexdigest()[:16]
        if expected_token == token:
            target = sub
            break

    if not target:
        return Response(
            content="""<!DOCTYPE html><html><body style="font-family:sans-serif;text-align:center;padding:60px 20px;">
            <h2 style="color:#e11d48;">Link expired or already unsubscribed</h2>
            <p>This unsubscribe link is no longer valid.</p>
            </body></html>""",
            media_type="text/html",
            status_code=404,
        )

    target.is_active = False
    db.add(target)
    await db.commit()
    logger.info(f"Unsubscribed: {target.email}")

    return Response(
        content=f"""<!DOCTYPE html><html>
        <head><meta charset="utf-8"/></head>
        <body style="font-family:'Helvetica Neue',sans-serif;background:#f4f1ed;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;">
          <div style="background:#fff;padding:48px;border-radius:16px;text-align:center;max-width:440px;">
            <div style="width:56px;height:56px;background:#f0fdf4;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">
              <span style="font-size:24px;">✅</span>
            </div>
            <h2 style="margin:0 0 12px;color:#1e2328;">You've been unsubscribed</h2>
            <p style="color:#6b7280;font-size:14px;margin:0 0 24px;line-height:1.6;">
              You've been successfully removed from the Reframe Psychology newsletter.
              You won't receive any more emails from us.
            </p>
            <a href="{email.SITE_URL}" style="display:inline-block;background:#7ebac8;color:#fff;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;">
              Visit Our Site
            </a>
          </div>
        </body></html>""",
        media_type="text/html",
    )

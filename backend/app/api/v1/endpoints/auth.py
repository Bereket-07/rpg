from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api import deps
from app.core.config import settings
from app.core import security
from app.models.user import User

router = APIRouter()

@router.post("/login")
async def login_access_token(
    db: AsyncSession = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    # Find user by email (OAuth2 uses 'username' field, which we map to email)
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalars().first()
    
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # We embed the role and ID into the JWT so the frontend can read it
    token_data = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role.value
    }

    return {
        "access_token": security.create_access_token(
            token_data, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
        "user_info": {
            "id": user.id,
            "email": user.email,
            "role": user.role.value,
            "must_change_password": user.must_change_password
        }
    }

from pydantic import BaseModel

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

@router.put("/change-password")
async def change_password(
    password_data: PasswordChange,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if not security.verify_password(password_data.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect old password")
        
    current_user.hashed_password = security.get_password_hash(password_data.new_password)
    current_user.must_change_password = False
    
    db.add(current_user)
    await db.commit()
    
    return {"message": "Password successfully changed"}

import os
from pydantic import BaseModel as PydanticBase

class GoogleLoginRequest(PydanticBase):
    email: str
    name: str | None = None

SUPER_ADMIN_EMAILS = [e.strip().lower() for e in os.getenv("SUPER_ADMIN_EMAILS", "").split(",") if e.strip()]
AUTHORIZED_EMAILS  = [e.strip().lower() for e in os.getenv("AUTHORIZED_EMAILS",  "").split(",") if e.strip()]

@router.post("/google-login")
async def google_login(payload: GoogleLoginRequest, db: AsyncSession = Depends(deps.get_db)):
    """
    Called by NextAuth after a successful Google sign-in.
    Finds or creates the DB user and returns a backend JWT.
    """
    email = payload.email.lower()

    # Determine role
    from app.models.user import Role
    role = Role.ADMIN if email in SUPER_ADMIN_EMAILS else Role.AUTHOR

    # Find or create user
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()

    if not user:
        user = User(
            email=email,
            hashed_password=security.get_password_hash(os.urandom(32).hex()),
            role=role,
            is_active=True,
            must_change_password=False,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    else:
        # Update role if they've been promoted/demoted
        if user.role != role:
            user.role = role
            await db.commit()

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token_data = {"sub": str(user.id), "email": user.email, "role": user.role.value}
    return {
        "access_token": security.create_access_token(token_data, expires_delta=access_token_expires),
        "token_type": "bearer",
        "user_info": {"id": user.id, "email": user.email, "role": user.role.value, "must_change_password": False},
    }

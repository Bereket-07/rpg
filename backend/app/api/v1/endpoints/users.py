from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.api import deps
from app.core.security import get_password_hash
from app.models.user import User, Role
from app.models.author_category import Author
from app.schemas.user import UserResponse, AuthorAccountCreate

router = APIRouter()

@router.post("/author", response_model=UserResponse)
async def create_author_account(
    account_in: AuthorAccountCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if current_user.role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can create authors")

    # Check if user exists
    result = await db.execute(select(User).filter(User.email == account_in.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="User with this email already exists")

    # 1. Create the blank Author profile mapped only by name
    db_author = Author(name=account_in.name)
    db.add(db_author)
    await db.commit()
    await db.refresh(db_author)

    # 2. Create the User mapping
    db_user = User(
        email=account_in.email,
        hashed_password=get_password_hash(account_in.password),
        role=Role.AUTHOR,
        must_change_password=True,  # Force reset on next login
        author_id=db_author.id
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)

    return db_user

@router.get("/authors")
async def get_all_author_accounts(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    # Returns joined User + Author profiles for Admin view
    if current_user.role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # We want a combined representation for the data table
    result = await db.execute(select(User).filter(User.role == Role.AUTHOR))
    users = result.scalars().all()
    
    # We will manually load the author_profile since it might be lazy
    # Note: For production large sets, use joinedload
    
    response_data = []
    for u in users:
        author_result = await db.execute(select(Author).filter(Author.id == u.author_id))
        author_profile = author_result.scalar_one_or_none()
        
        response_data.append({
            "id": u.id,
            "email": u.email,
            "is_active": u.is_active,
            "must_change_password": u.must_change_password,
            "author_id": u.author_id,
            "name": author_profile.name if author_profile else "Unknown",
        })
    return response_data

@router.put("/{user_id}/toggle-active")
async def toggle_user_active(
    user_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if current_user.role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Toggle boolean
    user.is_active = not user.is_active
    db.add(user)
    await db.commit()
    return {"message": "User status updated", "is_active": user.is_active}

@router.put("/{user_id}/reset-password")
async def admin_reset_password(
    user_id: int,
    password_data: dict,  # {"new_password": "..."}
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if current_user.role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    new_password = password_data.get("new_password")
    if not new_password:
        raise HTTPException(status_code=400, detail="Missing new_password")
        
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.hashed_password = get_password_hash(new_password)
    user.must_change_password = True  # Force reset again
    
    db.add(user)
    await db.commit()
    return {"message": "Password successfully reset for user"}

@router.delete("/{user_id}")
async def delete_user_and_author(
    user_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if current_user.role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    author_id = user.author_id
    
    # Cascade delete logic
    await db.delete(user)
    
    if author_id:
        author_result = await db.execute(select(Author).filter(Author.id == author_id))
        author = author_result.scalar_one_or_none()
        if author:
            await db.delete(author)
            
    await db.commit()
    return {"ok": True}

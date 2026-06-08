import asyncio
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api import deps
from app.core.default_authors import DEFAULT_AUTHOR_NAMES, ensure_default_authors
from app.models.author_category import Author
from app.schemas.blog import AuthorCreate, AuthorUpdate, AuthorResponse

router = APIRouter()

from app.models.user import User


def author_sort_key(author: Author):
    default_order = {name.lower(): index for index, name in enumerate(DEFAULT_AUTHOR_NAMES)}
    return (
        default_order.get(author.name.lower(), len(default_order)),
        author.created_at,
        author.id,
    )


@router.get("/me", response_model=AuthorResponse)
async def read_my_author_profile(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if not current_user.author_id:
        raise HTTPException(status_code=400, detail="User is not mapped to an author profile")
    result = await db.execute(select(Author).filter(Author.id == current_user.author_id))
    author = result.scalar_one_or_none()
    if not author:
        raise HTTPException(status_code=404, detail="Author profile not found")
    return author

@router.put("/me", response_model=AuthorResponse)
async def update_my_author_profile(
    author_in: AuthorUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    if not current_user.author_id:
        raise HTTPException(status_code=400, detail="User is not mapped to an author profile")
    result = await db.execute(select(Author).filter(Author.id == current_user.author_id))
    author = result.scalar_one_or_none()
    if not author:
        raise HTTPException(status_code=404, detail="Author profile not found")
        
    update_data = author_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(author, field, value)
        
    db.add(author)
    await db.commit()
    await db.refresh(author)
    return author

@router.get("/", response_model=List[AuthorResponse])
async def read_authors(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    team_only: bool = False,
):
    await ensure_default_authors(db)
    statement = select(Author)
    if team_only:
        statement = statement.filter(Author.is_team_member == True)
    result = await db.execute(statement.offset(skip).limit(limit))
    authors = result.scalars().all()
    return sorted(authors, key=author_sort_key)

@router.post("/", response_model=AuthorResponse)
async def create_author(
    author_in: AuthorCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: dict = Depends(deps.get_current_user),
):
    db_author = Author(**author_in.model_dump())
    db.add(db_author)
    await db.commit()
    await db.refresh(db_author)
    return db_author

@router.get("/{author_id}", response_model=AuthorResponse)
async def read_author(author_id: int, db: AsyncSession = Depends(deps.get_db)):
    result = await db.execute(select(Author).filter(Author.id == author_id))
    author = result.scalar_one_or_none()
    if author is None:
        raise HTTPException(status_code=404, detail="Author not found")
    return author

@router.put("/{author_id}", response_model=AuthorResponse)
async def update_author(
    author_id: int, 
    author_in: AuthorUpdate, 
    db: AsyncSession = Depends(deps.get_db),
    current_user: dict = Depends(deps.get_current_user)
):
    result = await db.execute(select(Author).filter(Author.id == author_id))
    author = result.scalar_one_or_none()
    if author is None:
        raise HTTPException(status_code=404, detail="Author not found")
        
    update_data = author_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(author, field, value)
        
    db.add(author)
    await db.commit()
    await db.refresh(author)
    return author

@router.delete("/{author_id}")
async def delete_author(
    author_id: int, 
    db: AsyncSession = Depends(deps.get_db),
    current_user: dict = Depends(deps.get_current_user)
):
    result = await db.execute(select(Author).filter(Author.id == author_id))
    author = result.scalar_one_or_none()
    if author is None:
        raise HTTPException(status_code=404, detail="Author not found")
        
    try:
        await db.delete(author)
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=409,
            detail="This team member is connected to blog posts. Reassign or delete those posts before removing the team member.",
        )
    return {"ok": True}

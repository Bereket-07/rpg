from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api import deps
from app.models.author_category import Category
from app.schemas.blog import CategoryCreate, CategoryUpdate, CategoryResponse

router = APIRouter()

@router.get("/", response_model=List[CategoryResponse])
async def read_categories(db: AsyncSession = Depends(deps.get_db), skip: int = 0, limit: int = 100):
    result = await db.execute(select(Category).offset(skip).limit(limit))
    categories = result.scalars().all()
    return categories

@router.post("/", response_model=CategoryResponse)
async def create_category(category_in: CategoryCreate, db: AsyncSession = Depends(deps.get_db)):
    db_category = Category(**category_in.model_dump())
    db.add(db_category)
    await db.commit()
    await db.refresh(db_category)
    return db_category

@router.get("/{slug}", response_model=CategoryResponse)
async def read_category(slug: str, db: AsyncSession = Depends(deps.get_db)):
    result = await db.execute(select(Category).filter(Category.slug == slug))
    category = result.scalar_one_or_none()
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.put("/{slug}", response_model=CategoryResponse)
async def update_category(
    slug: str, 
    category_in: CategoryUpdate, 
    db: AsyncSession = Depends(deps.get_db),
    current_user: dict = Depends(deps.get_current_user)
):
    result = await db.execute(select(Category).filter(Category.slug == slug))
    category = result.scalar_one_or_none()
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
        
    update_data = category_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)
        
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category

@router.delete("/{slug}")
async def delete_category(
    slug: str, 
    db: AsyncSession = Depends(deps.get_db),
    current_user: dict = Depends(deps.get_current_user)
):
    result = await db.execute(select(Category).filter(Category.slug == slug))
    category = result.scalar_one_or_none()
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
        
    await db.delete(category)
    await db.commit()
    return {"ok": True}

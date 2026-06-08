import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select
from app.models.user import User, Role
from app.core.security import get_password_hash
from app.core.config import settings

# Override config parsing if necessary or setup async engine
DATABASE_URL = settings.DATABASE_URL
engine = create_async_engine(DATABASE_URL, echo=settings.DEBUG_SQL)
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

async def seed_data():
    # Automatically initialize DB tables
    from app.db.session import Base
    import app.models
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Check if Admin exists
        result = await session.execute(select(User).where(User.email == "admin@reframe.com"))
        admin = result.scalars().first()
        
        if not admin:
            print("Creating Admin user...")
            admin = User(
                email="admin@reframe.com",
                hashed_password=get_password_hash("password123"),
                role=Role.ADMIN,
                is_active=True
            )
            session.add(admin)
            await session.commit()
            print("Admin user created successfully!")
            print("Email: admin@reframe.com | Password: password123")
        else:
            print("Admin user already exists!")

if __name__ == "__main__":
    asyncio.run(seed_data())

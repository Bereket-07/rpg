from fastapi import APIRouter

from app.api.v1.endpoints import articles, categories, authors, auth, upload, newsletter, users, settings, consultations

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(upload.router, prefix="/upload", tags=["upload"])
api_router.include_router(articles.router, prefix="/articles", tags=["articles"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(authors.router, prefix="/authors", tags=["authors"])
api_router.include_router(newsletter.router, prefix="/newsletter", tags=["newsletter"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
api_router.include_router(consultations.router, prefix="/consultations", tags=["consultations"])

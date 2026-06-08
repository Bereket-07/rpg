import os
import uuid
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Request
from app.api import deps
from app.models.user import User

router = APIRouter()

UPLOAD_DIRECTORY = "static/uploads"
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

ALLOWED_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
}

@router.post("/")
async def upload_file(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Upload an image file to the server and return its public URL.
    Only authenticated admin users can upload files.
    """
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{file.content_type}'. Allowed: {', '.join(ALLOWED_TYPES.keys())}"
        )

    # Use UUID so filenames never collide, preserve extension
    ext = ALLOWED_TYPES[file.content_type]
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIRECTORY, unique_filename)

    contents = await file.read()
    with open(file_path, "wb") as buffer:
        buffer.write(contents)

    base_url = str(request.base_url).rstrip("/")
    return {
        "url": f"{base_url}/static/uploads/{unique_filename}",
        "filename": unique_filename,
        "original_name": file.filename,
        "size": len(contents),
    }

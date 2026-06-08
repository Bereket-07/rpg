from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from enum import Enum

class Role(str, Enum):
    ADMIN = "ADMIN"
    AUTHOR = "AUTHOR"

class UserBase(BaseModel):
    email: EmailStr
    role: Role = Role.AUTHOR
    is_active: bool = True
    must_change_password: bool = False

class UserCreate(UserBase):
    password: str
    author_id: Optional[int] = None

class UserResponse(UserBase):
    id: int
    author_id: Optional[int] = None
    
    model_config = ConfigDict(from_attributes=True)

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

class PasswordReset(BaseModel):
    new_password: str
    
class AuthorAccountCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

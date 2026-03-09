from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    profile_image: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None

class JobOut(BaseModel):
    id: int
    title: str
    company: str
    location: str
    platform: str
    job_link: str

    class Config:
        from_attributes = True

class ApplicationCreate(BaseModel):
    title: str = "" # Fallback or keep it job_title
    job_title: str
    company: str
    platform: str
    job_link: str

class ApplicationOut(BaseModel):
    id: int
    user_id: int
    job_title: str
    company: str
    platform: str
    job_link: str
    applied_date: datetime
    status: str

    class Config:
        from_attributes = True

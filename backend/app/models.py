from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    email = Column(String(100), unique=True, index=True)
    password_hash = Column(String(200))
    profile_image = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    applications = relationship("Application", back_populates="user")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), index=True)
    company = Column(String(200), index=True)
    location = Column(String(100), index=True)
    platform = Column(String(50))
    job_link = Column(Text, unique=True)


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    job_title = Column(String(200))
    company = Column(String(200))
    platform = Column(String(50))
    job_link = Column(Text)
    applied_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), default="Applied")

    user = relationship("User", back_populates="applications")

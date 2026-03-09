from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import os
from .. import schemas, models, dependencies, database

router = APIRouter(tags=["Profile"])

@router.get("/profile", response_model=schemas.UserOut)
def get_profile(current_user: models.User = Depends(dependencies.get_current_user)):
    return current_user

@router.put("/profile", response_model=schemas.UserOut)
def update_profile(user_update: schemas.UserUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    if user_update.name:
        current_user.name = user_update.name
    if user_update.email:
        if current_user.email != user_update.email:
            existing = db.query(models.User).filter(models.User.email == user_update.email).first()
            if existing:
                raise HTTPException(status_code=400, detail="Email already taken")
        current_user.email = user_update.email
    db.commit()
    db.refresh(current_user)
    return current_user

@router.delete("/profile/image")
def delete_profile_image(db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    if current_user.profile_image:
        if os.path.exists(current_user.profile_image):
            os.remove(current_user.profile_image)
        current_user.profile_image = None
        db.commit()
    return {"status": "Image deleted"}

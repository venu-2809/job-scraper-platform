from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import os
import shutil
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

@router.post("/profile/image")
def upload_profile_image(file: UploadFile = File(...), db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Create uploads directory if it doesn't exist
    upload_dir = "uploads"
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
    
    # Delete old image if exists
    if current_user.profile_image and os.path.exists(current_user.profile_image):
        os.remove(current_user.profile_image)
    
    # Save new image
    file_extension = os.path.splitext(file.filename)[1]
    filename = f"user_{current_user.id}_profile{file_extension}"
    file_path = os.path.join(upload_dir, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    current_user.profile_image = file_path
    db.commit()
    
    return {"status": "Image uploaded", "image_path": file_path}

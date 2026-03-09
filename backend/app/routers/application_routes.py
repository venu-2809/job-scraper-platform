from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session
from .. import schemas, models, dependencies, database

router = APIRouter(tags=["Applications"])

@router.post("/apply-job", response_model=schemas.ApplicationOut)
def apply_job(application: schemas.ApplicationCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    new_app = models.Application(
        user_id=current_user.id,
        job_title=application.job_title if application.job_title else application.title,
        company=application.company,
        platform=application.platform,
        job_link=application.job_link
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return new_app

@router.get("/applications", response_model=List[schemas.ApplicationOut])
def get_applications(db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    apps = db.query(models.Application).filter(models.Application.user_id == current_user.id).all()
    return apps

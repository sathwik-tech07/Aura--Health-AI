from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import get_db

router = APIRouter(tags=["Doctors"])


@router.get("/doctors", response_model=list[schemas.DoctorResponse])
def get_doctors(db: Session = Depends(get_db)):
    return crud.get_available_doctors(db)

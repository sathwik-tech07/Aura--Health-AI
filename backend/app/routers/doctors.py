from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import get_db

router = APIRouter(tags=["Doctors"])


@router.get("/doctors", response_model=list[schemas.DoctorResponse])
def get_doctors(
    department: Optional[str] = Query(None, description="Filter by department"),
    db: Session = Depends(get_db),
):
    return crud.get_available_doctors(db, department=department)

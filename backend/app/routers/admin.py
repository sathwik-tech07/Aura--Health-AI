from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, schemas, models
from app.database import get_db
from app.security import require_employer

router = APIRouter(prefix="/employer", tags=["Employer"])


@router.get("/stats", response_model=schemas.AdminStatsResponse)
def get_employer_stats(
    db: Session = Depends(get_db),
    employer: models.User = Depends(require_employer),
):
    """
    Employer / Admin Clinic Operations Analytics.
    Requires role: employer. Returns 403 Forbidden for patients.
    """
    return crud.get_admin_stats(db)


@router.get("/patients", response_model=List[schemas.UserResponse])
def get_employer_patients(
    db: Session = Depends(get_db),
    employer: models.User = Depends(require_employer),
):
    """
    Employer / Admin Patient Directory.
    Requires role: employer. Returns 403 Forbidden for patients.
    """
    return crud.get_all_patients(db)


@router.post("/doctors", response_model=schemas.DoctorResponse, status_code=status.HTTP_201_CREATED)
def add_doctor(
    doctor: schemas.DoctorCreate,
    db: Session = Depends(get_db),
    employer: models.User = Depends(require_employer),
):
    """
    Employer: Add a new specialist to clinic roster.
    """
    return crud.create_doctor(db, doctor)


@router.delete("/doctors/{doctor_id}")
def remove_doctor(
    doctor_id: int,
    db: Session = Depends(get_db),
    employer: models.User = Depends(require_employer),
):
    """
    Employer: Remove a doctor from clinic roster.
    """
    deleted = crud.delete_doctor(db, doctor_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    return {"message": "Doctor removed successfully", "id": doctor_id}

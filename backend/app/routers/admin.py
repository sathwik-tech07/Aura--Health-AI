from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, schemas, models
from app.database import get_db
from app.security import require_role

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/stats", response_model=schemas.AdminStatsResponse)
def get_stats(
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(require_role(["admin", "staff", "employer"])),
):
    """
    Administrative Clinic Analytics (Active appointments, doctor capacity, patient count, revenue).
    """
    return crud.get_admin_stats(db)


@router.get("/patients", response_model=List[schemas.UserResponse])
def get_patients(
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(require_role(["admin", "staff", "employer"])),
):
    """
    Returns registered patient directory for clinic management.
    """
    return crud.get_all_patients(db)


@router.post("/doctors", response_model=schemas.DoctorResponse, status_code=status.HTTP_201_CREATED)
def add_doctor(
    doctor: schemas.DoctorCreate,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(require_role(["admin", "staff"])),
):
    """
    Admin: Add a new specialist to clinic roster.
    """
    return crud.create_doctor(db, doctor)


@router.delete("/doctors/{doctor_id}")
def remove_doctor(
    doctor_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(require_role(["admin", "staff"])),
):
    """
    Admin: Remove a doctor from clinic roster.
    """
    deleted = crud.delete_doctor(db, doctor_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    return {"message": "Doctor removed successfully", "id": doctor_id}

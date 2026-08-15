from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, schemas, models
from app.database import get_db
from app.security import (
    get_current_user_optional,
    get_current_user,
    require_patient,
    require_employer,
)

router = APIRouter(tags=["Appointments"])


@router.post(
    "/book-appointment",
    response_model=schemas.AppointmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def book_appointment(
    appointment: schemas.AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional),
):
    try:
        user_id = current_user.id if current_user else appointment.user_id
        return crud.create_appointment(db, appointment, user_id=user_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.get("/appointments/my", response_model=List[schemas.AppointmentResponse])
def get_my_appointments(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_patient),
):
    """
    Patient-only / self appointment view: returns strictly the logged-in patient's appointments.
    """
    return crud.get_user_appointments(db, user_id=current_user.id, email=current_user.email)


@router.get("/appointments", response_model=List[schemas.AppointmentResponse])
def get_all_appointments(
    db: Session = Depends(get_db),
    employer: models.User = Depends(require_employer),
):
    """
    Employer-only: returns all appointments across the entire clinic.
    Raises 403 Forbidden if called by a normal patient.
    """
    return crud.get_appointments(db)


@router.get("/appointments/{appointment_id}", response_model=schemas.AppointmentResponse)
def get_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    appointment = crud.get_appointment_by_id(db, appointment_id)
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

    user_role = getattr(current_user, "role", "patient")

    # If user is a patient, verify strict ownership
    if user_role == "patient":
        if appointment.user_id is not None and appointment.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. You cannot view another patient's appointment.",
            )

    return appointment


@router.patch("/appointments/{appointment_id}", response_model=schemas.AppointmentResponse)
def update_appointment(
    appointment_id: int,
    patch: schemas.AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    appointment = crud.get_appointment_by_id(db, appointment_id)
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

    user_role = getattr(current_user, "role", "patient")

    # If patient, verify ownership
    if user_role == "patient":
        if appointment.user_id is not None and appointment.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. You cannot modify another patient's appointment.",
            )

    update_data = patch.model_dump(exclude_unset=True)
    updated = crud.update_appointment(db, appointment_id, update_data)
    return updated


@router.delete("/appointments/{appointment_id}")
def cancel_or_delete_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    appointment = crud.get_appointment_by_id(db, appointment_id)
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

    user_role = getattr(current_user, "role", "patient")

    # If patient, verify ownership
    if user_role == "patient":
        if appointment.user_id is not None and appointment.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. You cannot delete another patient's appointment.",
            )

    crud.delete_appointment(db, appointment_id)
    return {"message": "Appointment deleted successfully", "id": appointment_id}

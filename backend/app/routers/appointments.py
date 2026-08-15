from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import get_db

router = APIRouter(tags=["Appointments"])


@router.post(
    "/book-appointment",
    response_model=schemas.AppointmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def book_appointment(
    appointment: schemas.AppointmentCreate,
    db: Session = Depends(get_db),
):
    try:
        return crud.create_appointment(db, appointment)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.get("/appointments", response_model=list[schemas.AppointmentResponse])
def get_appointments(db: Session = Depends(get_db)):
    return crud.get_appointments(db)


@router.get("/appointments/{appointment_id}", response_model=schemas.AppointmentResponse)
def get_appointment(appointment_id: int, db: Session = Depends(get_db)):
    appointment = crud.get_appointment_by_id(db, appointment_id)
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    return appointment


@router.patch("/appointments/{appointment_id}", response_model=schemas.AppointmentResponse)
def update_appointment(
    appointment_id: int,
    patch: schemas.AppointmentUpdate,
    db: Session = Depends(get_db),
):
    update_data = patch.model_dump(exclude_unset=True)
    updated = crud.update_appointment(db, appointment_id, update_data)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    return updated


@router.delete("/appointments/{appointment_id}")
def cancel_or_delete_appointment(appointment_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_appointment(db, appointment_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    return {"message": "Appointment deleted successfully", "id": appointment_id}

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

from datetime import date, datetime, time
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class ChatRequest(BaseModel):
    session_id: str
    message: str
    language: str = "en"


class DoctorResponse(BaseModel):
    id: int
    name: str
    department: str
    experience: int
    consultation_fee: float
    available: bool

    model_config = ConfigDict(from_attributes=True)


class AppointmentCreate(BaseModel):
    patient_name: str = Field(..., min_length=2, max_length=120)
    phone: str = Field(..., min_length=7, max_length=20)
    doctor_id: int
    appointment_date: date
    appointment_time: time
    symptoms: str = Field(..., min_length=3)
    status: str = Field(default="booked", max_length=40)


class AppointmentUpdate(BaseModel):
    patient_name: Optional[str] = None
    phone: Optional[str] = None
    appointment_date: Optional[date] = None
    appointment_time: Optional[time] = None
    symptoms: Optional[str] = None
    status: Optional[str] = None


class AppointmentResponse(BaseModel):
    id: int
    patient_name: str
    phone: str
    doctor_id: int
    appointment_date: date
    appointment_time: time
    symptoms: str
    status: str
    doctor: Optional[DoctorResponse] = None

    model_config = ConfigDict(from_attributes=True)


class ConversationCreate(BaseModel):
    session_id: str = Field(..., min_length=1, max_length=120)
    user_message: str = Field(..., min_length=1)
    ai_response: str = Field(..., min_length=1)


class ConversationResponse(BaseModel):
    id: int
    session_id: str
    user_message: str
    ai_response: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

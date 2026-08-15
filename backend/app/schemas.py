from datetime import date, datetime, time
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ChatRequest(BaseModel):
    session_id: str
    message: str
    language: str = "en"


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str

    model_config = ConfigDict(from_attributes=True)


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=6)
    # Optional role field is ignored by backend logic to enforce patient role
    role: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    token: str
    user: UserResponse


class DoctorResponse(BaseModel):
    id: int
    name: str
    department: str
    experience: int
    consultation_fee: float
    available: bool

    model_config = ConfigDict(from_attributes=True)


class DoctorCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    department: str = Field(..., min_length=2, max_length=120)
    experience: int = Field(..., ge=0)
    consultation_fee: float = Field(..., ge=0)
    available: bool = True


class AppointmentCreate(BaseModel):
    patient_name: str = Field(..., min_length=2, max_length=120)
    phone: str = Field(..., min_length=7, max_length=20)
    doctor_id: int
    appointment_date: date
    appointment_time: time
    symptoms: str = Field(..., min_length=3)
    status: str = Field(default="booked", max_length=40)
    user_id: Optional[int] = None


class AppointmentUpdate(BaseModel):
    patient_name: Optional[str] = None
    phone: Optional[str] = None
    appointment_date: Optional[date] = None
    appointment_time: Optional[time] = None
    symptoms: Optional[str] = None
    status: Optional[str] = None
    doctor_id: Optional[int] = None


class AppointmentResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
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
    user_id: Optional[int] = None


class ConversationResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    session_id: str
    user_message: str
    ai_response: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminStatsResponse(BaseModel):
    total_appointments: int
    active_appointments: int
    cancelled_appointments: int
    total_patients: int
    total_doctors: int
    estimated_revenue: float


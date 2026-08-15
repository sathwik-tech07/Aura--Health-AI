from typing import Optional, Dict, Any, List
from datetime import date, time
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import func

from app import models, schemas
from app.security import hash_password


DOCTOR_SEED_DATA = [
    {
        "name": "Dr. Ananya Rao",
        "department": "Cardiology",
        "experience": 12,
        "consultation_fee": 900.0,
        "available": True,
    },
    {
        "name": "Dr. Vikram Sethi",
        "department": "Orthopedics",
        "experience": 15,
        "consultation_fee": 850.0,
        "available": True,
    },
    {
        "name": "Dr. Meera Iyer",
        "department": "Pediatrics",
        "experience": 10,
        "consultation_fee": 700.0,
        "available": True,
    },
    {
        "name": "Dr. Arjun Menon",
        "department": "Dermatology",
        "experience": 8,
        "consultation_fee": 650.0,
        "available": True,
    },
    {
        "name": "Dr. Nisha Kapoor",
        "department": "Gynecology",
        "experience": 14,
        "consultation_fee": 800.0,
        "available": True,
    },
    {
        "name": "Dr. Sameer Kulkarni",
        "department": "Neurology",
        "experience": 16,
        "consultation_fee": 1100.0,
        "available": True,
    },
    {
        "name": "Dr. Kavita Deshmukh",
        "department": "ENT",
        "experience": 11,
        "consultation_fee": 600.0,
        "available": True,
    },
    {
        "name": "Dr. Rahul Bansal",
        "department": "Gastroenterology",
        "experience": 13,
        "consultation_fee": 950.0,
        "available": True,
    },
    {
        "name": "Dr. Sneha Pillai",
        "department": "Pulmonology",
        "experience": 9,
        "consultation_fee": 750.0,
        "available": True,
    },
    {
        "name": "Dr. Aditya Narang",
        "department": "General Medicine",
        "experience": 18,
        "consultation_fee": 500.0,
        "available": True,
    },
]


def seed_doctors(db: Session) -> None:
    if db.query(models.Doctor).count() == 0:
        db.add_all(models.Doctor(**doctor_data) for doctor_data in DOCTOR_SEED_DATA)
        db.commit()

    # Seed or ensure default clinic admin staff user
    admin_user = db.query(models.User).filter(models.User.email == "admin@aurahealthai.com").first()
    if not admin_user:
        admin_user = models.User(
            name="Clinic Chief Administrator",
            email="admin@aurahealthai.com",
            password=hash_password("Admin@Aura2026!"),
            role="admin",
        )
        db.add(admin_user)
        db.commit()
        print("[Auth Seed] Seeded default clinic admin: admin@aurahealthai.com")
    elif admin_user.role != "admin":
        admin_user.role = "admin"
        admin_user.password = hash_password("Admin@Aura2026!")
        db.commit()


def get_available_doctors(db: Session, department: Optional[str] = None):
    query = db.query(models.Doctor)
    if department:
        query = query.filter(models.Doctor.department.ilike(f"%{department}%"))
    return query.order_by(models.Doctor.department, models.Doctor.name).all()


def create_doctor(db: Session, doctor: schemas.DoctorCreate):
    db_doctor = models.Doctor(**doctor.model_dump())
    db.add(db_doctor)
    db.commit()
    db.refresh(db_doctor)
    return db_doctor


def delete_doctor(db: Session, doctor_id: int) -> bool:
    doc = db.query(models.Doctor).filter(models.Doctor.id == doctor_id).first()
    if not doc:
        return False
    db.delete(doc)
    db.commit()
    return True


def create_appointment(db: Session, appointment: schemas.AppointmentCreate, user_id: Optional[int] = None):
    doctor = (
        db.query(models.Doctor)
        .filter(
            models.Doctor.id == appointment.doctor_id,
            models.Doctor.available.is_(True),
        )
        .first()
    )
    if doctor is None:
        raise ValueError("Selected doctor is not available for appointments.")

    existing_appointment = (
        db.query(models.Appointment)
        .filter(
            models.Appointment.doctor_id == appointment.doctor_id,
            models.Appointment.appointment_date == appointment.appointment_date,
            models.Appointment.appointment_time == appointment.appointment_time,
            models.Appointment.status != "cancelled",
        )
        .first()
    )
    if existing_appointment is not None:
        raise ValueError("This time slot is already booked for the selected doctor.")

    appt_data = appointment.model_dump()
    if user_id:
        appt_data["user_id"] = user_id

    db_appointment = models.Appointment(**appt_data)
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment


def get_appointments(db: Session):
    """
    Returns all appointments for clinic admins.
    """
    return (
        db.query(models.Appointment)
        .options(selectinload(models.Appointment.doctor))
        .order_by(models.Appointment.appointment_date.desc(), models.Appointment.appointment_time.desc())
        .all()
    )


def get_user_appointments(db: Session, user_id: Optional[int] = None, email: Optional[str] = None):
    """
    Returns only appointments belonging to a specific patient.
    """
    query = db.query(models.Appointment).options(selectinload(models.Appointment.doctor))
    if user_id:
        query = query.filter(models.Appointment.user_id == user_id)
    return query.order_by(models.Appointment.appointment_date.desc(), models.Appointment.appointment_time.desc()).all()


def get_appointment_by_id(db: Session, appointment_id: int):
    return (
        db.query(models.Appointment)
        .options(selectinload(models.Appointment.doctor))
        .filter(models.Appointment.id == appointment_id)
        .first()
    )


def update_appointment(db: Session, appointment_id: int, update_data: Dict[str, Any]):
    appointment = (
        db.query(models.Appointment)
        .options(selectinload(models.Appointment.doctor))
        .filter(models.Appointment.id == appointment_id)
        .first()
    )
    if not appointment:
        return None

    for key, value in update_data.items():
        if value is not None and hasattr(appointment, key):
            if key == "appointment_time" and isinstance(value, str):
                parts = value.split(":")
                val_time = time(int(parts[0]), int(parts[1]))
                setattr(appointment, key, val_time)
            elif key == "appointment_date" and isinstance(value, str):
                parts = value.split("-")
                val_date = date(int(parts[0]), int(parts[1]), int(parts[2]))
                setattr(appointment, key, val_date)
            else:
                setattr(appointment, key, value)

    db.commit()
    db.refresh(appointment)
    return appointment


def delete_appointment(db: Session, appointment_id: int) -> bool:
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        return False
    db.delete(appointment)
    db.commit()
    return True


def create_conversation(db: Session, conversation: schemas.ConversationCreate, user_id: Optional[int] = None):
    conv_data = conversation.model_dump()
    if user_id:
        conv_data["user_id"] = user_id
    db_conversation = models.Conversation(**conv_data)
    db.add(db_conversation)
    db.commit()
    db.refresh(db_conversation)
    return db_conversation


def get_conversations_by_session(db: Session, session_id: str):
    return (
        db.query(models.Conversation)
        .filter(models.Conversation.session_id == session_id)
        .order_by(models.Conversation.timestamp.asc())
        .all()
    )


def get_all_patients(db: Session):
    return db.query(models.User).order_by(models.User.id.desc()).all()


def get_admin_stats(db: Session) -> Dict[str, Any]:
    total_appts = db.query(models.Appointment).count()
    active_appts = db.query(models.Appointment).filter(models.Appointment.status != "cancelled").count()
    cancelled_appts = db.query(models.Appointment).filter(models.Appointment.status == "cancelled").count()
    total_patients = db.query(models.User).filter(models.User.role == "patient").count()
    total_doctors = db.query(models.Doctor).count()

    # Estimate revenue from active appointments
    active_with_docs = (
        db.query(models.Doctor.consultation_fee)
        .join(models.Appointment, models.Appointment.doctor_id == models.Doctor.id)
        .filter(models.Appointment.status != "cancelled")
        .all()
    )
    est_revenue = sum(row[0] for row in active_with_docs) if active_with_docs else 0.0

    return {
        "total_appointments": total_appts,
        "active_appointments": active_appts,
        "cancelled_appointments": cancelled_appts,
        "total_patients": max(total_patients, 1),
        "total_doctors": total_doctors,
        "estimated_revenue": float(est_revenue),
    }

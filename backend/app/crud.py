from sqlalchemy.orm import Session, selectinload

from app import models, schemas


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
    if db.query(models.Doctor).count():
        return

    db.add_all(models.Doctor(**doctor_data) for doctor_data in DOCTOR_SEED_DATA)
    db.commit()


def get_available_doctors(db: Session):
    return (
        db.query(models.Doctor)
        .filter(models.Doctor.available.is_(True))
        .order_by(models.Doctor.department, models.Doctor.name)
        .all()
    )


def create_appointment(db: Session, appointment: schemas.AppointmentCreate):
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

    db_appointment = models.Appointment(**appointment.model_dump())
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment


def get_appointments(db: Session):
    return (
        db.query(models.Appointment)
        .options(selectinload(models.Appointment.doctor))
        .order_by(models.Appointment.appointment_date, models.Appointment.appointment_time)
        .all()
    )


def create_conversation(db: Session, conversation: schemas.ConversationCreate):
    db_conversation = models.Conversation(**conversation.model_dump())
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

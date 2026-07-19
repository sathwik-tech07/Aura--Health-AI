from app.routers.appointments import router as appointments_router
from app.routers.conversations import router as conversations_router
from app.routers.doctors import router as doctors_router

__all__ = [
    "appointments_router",
    "conversations_router",
    "doctors_router",
]

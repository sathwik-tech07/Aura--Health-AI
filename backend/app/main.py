import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv

from fastapi import FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware

from app.crud import seed_doctors
from app.database import SessionLocal, init_db

# Import routers
from app.routers.auth_router import router as auth_router
from app.routers.doctors import router as doctors_router
from app.routers.appointments import router as appointments_router
from app.routers.conversations import router as conversations_router

from app.schemas import ChatRequest
from app.services.ai_service import generate_response
from app.services.dashboard_service import generate_dashboard
from voice import text_to_speech

load_dotenv()


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()

    db = SessionLocal()
    try:
        seed_doctors(db)
    finally:
        db.close()

    yield


app = FastAPI(
    title="AuraHealth AI V2",
    description="Production-grade AI Healthcare Platform with Multi-Agent Triage, Voice AI, and Clinical Scheduling",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS Configuration
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
if allowed_origins_env == "*":
    origins = ["*"]
else:
    origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth_router)
app.include_router(doctors_router)
app.include_router(appointments_router)
app.include_router(conversations_router)


@app.get("/")
def root():
    return {
        "status": "online",
        "version": "2.0.0",
        "project": "AuraHealth AI V2",
        "message": "AI Healthcare Multi-Agent & Voice Assistant Running",
    }


@app.post("/chat")
def chat(request: ChatRequest):
    response = generate_response(
        request.session_id,
        request.message,
        request.language,
    )

    return {
        "response": response,
        "language": request.language,
        "session_id": request.session_id,
    }


@app.post("/dashboard")
def dashboard(request: ChatRequest):
    dashboard_data = generate_dashboard(request.message)
    return dashboard_data


@app.post("/voice")
def voice(request: ChatRequest):
    response = generate_response(
        request.session_id,
        request.message,
        request.language,
    )

    audio = text_to_speech(
        response,
        request.language,
    )

    if audio is None:
        return {
            "error": "Voice generation unavailable",
            "response": response,
            "language": request.language,
        }

    return Response(
        content=audio,
        media_type="audio/mpeg",
        headers={
            "X-Aura-Response": response[:200].encode("ascii", "ignore").decode("ascii"),
            "X-Aura-Language": request.language,
        },
    )
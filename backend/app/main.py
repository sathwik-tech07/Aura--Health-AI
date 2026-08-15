import os
import base64
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
    description="Production-grade AI Healthcare Platform with Multi-Agent Triage, Complete Voice AI, and Clinical Scheduling",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Aura-Response-Base64", "X-Aura-Language", "X-Aura-Session-Id"],
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
        "message": "AI Healthcare Multi-Agent & Complete Voice Assistant Running",
    }


@app.post("/chat")
def chat(request: ChatRequest):
    print(f"[FastAPI /chat] Received request: language={request.language}, session={request.session_id}")
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
    print(f"[FastAPI /voice] Received voice request: language={request.language}, session={request.session_id}")

    # 1. Generate COMPLETE clinical AI response
    response = generate_response(
        request.session_id,
        request.message,
        request.language,
    )

    # 2. Convert COMPLETE response to speech using ElevenLabs (no truncation)
    audio = text_to_speech(
        response,
        request.language,
    )

    # Base64 encode the complete response text
    response_b64 = base64.b64encode(response.encode("utf-8")).decode("ascii")

    if audio is None:
        # Return complete response in JSON with error flag for client-side SpeechSynthesis
        return {
            "error": "ElevenLabs voice generation unavailable",
            "response": response,
            "language": request.language,
            "session_id": request.session_id,
        }

    # Return complete audio stream with complete text encoded in header
    return Response(
        content=audio,
        media_type="audio/mpeg",
        headers={
            "X-Aura-Response-Base64": response_b64,
            "X-Aura-Language": request.language,
            "X-Aura-Session-Id": request.session_id,
        },
    )
from contextlib import asynccontextmanager

from fastapi import FastAPI, Response
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
    title="AuraHealth AI",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
        "status": "running",
        "project": "AuraHealth AI",
        "message": "AI Healthcare Assistant Running",
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
    }


@app.post("/dashboard")
def dashboard(request: ChatRequest):
    dashboard = generate_dashboard(request.message)
    return dashboard


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
            "error": "Voice generation failed"
        }

    return Response(
        content=audio,
        media_type="audio/mpeg",
    )
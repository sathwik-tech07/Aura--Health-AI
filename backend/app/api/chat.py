from fastapi import APIRouter

from app.schemas import ChatRequest
from app.services.ai_service import generate_response

router = APIRouter()


@router.post("/chat")
def chat(request: ChatRequest):
    try:
        reply = generate_response(
            request.session_id,
            request.message,
            request.language,
        )
        return {"response": reply}

    except Exception as e:
        return {
            "error": str(e),
            "type": str(type(e))
        }

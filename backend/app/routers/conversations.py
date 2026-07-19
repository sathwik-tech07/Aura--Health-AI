from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import get_db

router = APIRouter(tags=["Conversations"])


@router.post(
    "/conversation",
    response_model=schemas.ConversationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_conversation(
    conversation: schemas.ConversationCreate,
    db: Session = Depends(get_db),
):
    return crud.create_conversation(db, conversation)


@router.get("/history/{session_id}", response_model=list[schemas.ConversationResponse])
def get_history(session_id: str, db: Session = Depends(get_db)):
    return crud.get_conversations_by_session(db, session_id)

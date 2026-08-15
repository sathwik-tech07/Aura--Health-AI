from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import RegisterRequest, LoginRequest, UserResponse, LoginResponse
from app.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    get_current_employer,
    get_current_patient,
)

router = APIRouter(tags=["Authentication"])


@router.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    email_clean = request.email.lower().strip()
    existing_user = db.query(User).filter(User.email == email_clean).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # CRITICAL SECURITY RULE: Public registration ALWAYS creates role="patient".
    # Any role sent by client is strictly ignored and forced to "patient".
    user = User(
        name=request.name.strip(),
        email=email_clean,
        password=hash_password(request.password),
        role="patient",
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "User registered successfully",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
        },
    }


@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    email_clean = request.email.lower().strip()
    user = db.query(User).filter(User.email == email_clean).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(request.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    user_role = getattr(user, "role", "patient") or "patient"

    token = create_access_token(
        {
            "sub": user.email,
            "user_id": user.id,
            "name": user.name,
            "role": user_role,
        }
    )

    return {
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user_role,
        },
    }


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns the authenticated user's profile and active role.
    """
    return current_user


@router.get("/employer-test")
def employer_test(current_user: User = Depends(get_current_employer)):
    """
    Endpoint protected by get_current_employer dependency.
    Returns 403 Forbidden for patients and 401 for unauthenticated requests.
    """
    return {
        "status": "authorized",
        "message": f"Welcome Employer {current_user.name}",
        "role": current_user.role,
    }
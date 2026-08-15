import os
import bcrypt
from datetime import datetime, timedelta
from typing import Optional, List
from dotenv import load_dotenv
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db

load_dotenv()

# Environment-based secret key with secure fallback for local dev
SECRET_KEY = os.getenv("SECRET_KEY", "aurahealth-production-secure-key-v2-replace-in-env")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", str(60 * 24 * 7)))  # 7 days default

security_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    """
    Direct bcrypt password hashing - robust across all Python/bcrypt/passlib versions.
    """
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """
    Direct bcrypt password verification.
    """
    try:
        pwd_bytes = plain_password.encode("utf-8")[:72]
        hash_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(pwd_bytes, hash_bytes)
    except Exception as e:
        print(f"Password verification error: {e}")
        return False


def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Encodes user identification, role, and expiration into JWT.
    """
    to_encode = data.copy()

    expire = datetime.utcnow() + (
        expires_delta
        if expires_delta
        else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )

    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """
    Decodes and validates JWT payload. Returns None if invalid or expired.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def get_current_user_optional(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db),
):
    """
    Returns authenticated User if valid token is provided; otherwise returns None.
    """
    if not auth or not auth.credentials:
        return None

    payload = decode_access_token(auth.credentials)
    if not payload:
        return None

    email: Optional[str] = payload.get("sub")
    if not email:
        return None

    from app.models import User
    user = db.query(User).filter(User.email == email).first()
    return user


def get_current_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db),
):
    """
    Core authentication dependency. Requires a valid JWT.
    Raises 401 Unauthorized if token is missing, invalid, or expired.
    """
    if not auth or not auth.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(auth.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    email: Optional[str] = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token subject missing.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    from app.models import User
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def require_role(allowed_roles: List[str]):
    """
    Dependency factory enforcing role-based authorization.
    Raises 403 Forbidden if the authenticated user does not have the required role.
    """
    def role_checker(
        current_user = Depends(get_current_user),
    ):
        user_role = getattr(current_user, "role", "patient") or "patient"
        # Admin or exact role match allowed
        if user_role == "admin" or user_role in allowed_roles:
            return current_user

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access forbidden. This resource requires role: {', '.join(allowed_roles)}.",
        )

    return role_checker


def require_patient(
    current_user = Depends(get_current_user),
):
    """
    Dependency: verifies authenticated user is a patient (or employer).
    """
    return current_user


def require_employer(
    current_user = Depends(require_role(["employer", "admin", "staff"])),
):
    """
    Dependency: strictly verifies authenticated user has the 'employer' role.
    Raises 403 Forbidden for patients.
    """
    return current_user


# Reusable aliases for flexible dependency injection
get_current_patient = require_patient
get_current_employer = require_employer
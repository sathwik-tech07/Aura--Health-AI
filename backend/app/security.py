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
    Returns authenticated user if a valid token is present, else returns None.
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
    Requires any authenticated user (Patient, Admin, Staff).
    """
    user = get_current_user_optional(auth, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def require_role(allowed_roles: List[str]):
    """
    Dependency factory that enforces specific roles (e.g. ['admin', 'staff']).
    Raises HTTP 403 Forbidden if user's role is not authorized.
    """
    def role_checker(
        current_user = Depends(get_current_user),
    ):
        user_role = getattr(current_user, "role", "patient")
        # Admin has superuser access to all roles
        if user_role == "admin" or user_role in allowed_roles:
            return current_user

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access forbidden. This resource requires one of the following roles: {', '.join(allowed_roles)}.",
        )

    return role_checker


def require_admin_user(
    current_user = Depends(require_role(["admin", "staff", "employer"])),
):
    """
    Requires Admin / Clinic Staff role.
    """
    return current_user


def require_patient_user(
    current_user = Depends(get_current_user),
):
    """
    Requires authenticated Patient (or Admin).
    """
    return current_user
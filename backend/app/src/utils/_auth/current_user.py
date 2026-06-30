from typing import Optional

from fastapi import Cookie, HTTPException

from app.src.utils._auth.jwt import verify_token


def get_current_user_id(access_token: Optional[str] = Cookie(None)) -> str:
    """FastAPI dependency: resolve the authenticated user's id from the cookie.

    Mirrors the verification done in the /me endpoint so that interview and
    attempt endpoints can require auth without repeating the boilerplate.
    """
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated - no cookie")

    payload = verify_token(access_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = payload.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    return user_id

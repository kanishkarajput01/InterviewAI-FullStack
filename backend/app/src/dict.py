from pydantic import BaseModel
from datetime import datetime

class SignupRequest(BaseModel):
    email: str
    password: str
    username: str

class UserDict(BaseModel):
    id: str
    username: str
    email: str
    created_at: datetime
    updated_at: datetime

class LoginRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    user: UserDict
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


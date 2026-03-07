from fastapi import FastAPI
from pydantic import BaseModel, field_validator, Field
import uuid
from typing import Dict


class Session(BaseModel):
    job_role: str = Field(..., example="Frontend Engineer")
    experience: int = Field(..., example=1)

    @field_validator("job_role")
    # @classmethod
    def validate_job_role(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Job role is required")
        return v


class SessionState(BaseModel):
    job_role: str
    experience: int

class SessionResponse(BaseModel):
    session_id: str
    job_role: str
    experience: int
# in memory storage
sessions: Dict[str, SessionResponse] = {}
app = FastAPI(title="AI Interview Assistant Backend", description="Backend for AI Interview Assistant")


@app.post("/sessions")
async def create_session(payload: Session):
    sid = uuid.uuid4().hex
    state = SessionState(job_role=payload.job_role, experience=payload.experience)
    sessions[sid] = state

    return SessionResponse(session_id=sid, job_role=state.job_role, experience=state.experience)
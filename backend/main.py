from io import BytesIO
import os
from typing import List, Optional

from fastapi import Depends, FastAPI, File, HTTPException, Response, Cookie, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from openai import OpenAI
from dotenv import load_dotenv

from app.src.dict import (
    SignupRequest,
    LoginRequest,
    UserDict,
    CreateInterviewRequest,
    InterviewDict,
    AttemptDict,
    AttemptWithAnswersDict,
    AnswerDict,
    ReportDict,
    SubmitAnswerRequest,
)
from app.src.api._auth.signup import signup
from app.src.api._auth.login import login
from app.src.api._auth.user import user as get_user
from app.src.api._interview.create import create_interview
from app.src.api._interview.get import get_interview
from app.src.api._interview.list import list_interviews
from app.src.api._attempt.create import create_attempt
from app.src.api._attempt.get import get_attempt, list_answers, list_user_attempts
from app.src.api._attempt.submit_answer import submit_answer
from app.src.api._attempt.report import complete_attempt, get_report
from app.src.utils._auth.jwt import verify_token
from app.src.utils._auth.current_user import get_current_user_id


load_dotenv()

app = FastAPI(title="AI Interviewer Backend", version="0.1.0")
# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Hello from AI Interviewer Backend!"}


# ---------------------------
# LLM Setup (use env var OPENAI_API_KEY)
# ---------------------------
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


# ---------------------------
# Optional auth dependency: resolves the user id from the cookie when present,
# but does not require it (used for public/private visibility checks).
# ---------------------------
def get_optional_user_id(access_token: Optional[str] = Cookie(None)) -> Optional[str]:
    if not access_token:
        return None
    payload = verify_token(access_token)
    if not payload:
        return None
    return payload.get("id")


def _raise_domain_error(e: Exception):
    """Map domain exceptions to HTTP responses."""
    if isinstance(e, PermissionError):
        raise HTTPException(status_code=403, detail=str(e))
    if isinstance(e, ValueError):
        # "does not exist" -> 404, everything else -> 400
        message = str(e)
        if "does not exist" in message or "No report" in message:
            raise HTTPException(status_code=404, detail=message)
        raise HTTPException(status_code=400, detail=message)
    raise HTTPException(status_code=500, detail=str(e))


# ===========================================================================
# Interviews
# ===========================================================================
@app.post("/create-interview", response_model=InterviewDict)
async def post_interview(req: CreateInterviewRequest, user_id: str = Depends(get_current_user_id)):
    try:
        return create_interview(req, user_id)
    except Exception as e:
        _raise_domain_error(e)


@app.get("/interviews", response_model=List[InterviewDict])
async def get_interviews(mine: bool = False, user_id: Optional[str] = Depends(get_optional_user_id)):
    try:
        return list_interviews(requester_id=user_id, mine=mine)
    except Exception as e:
        _raise_domain_error(e)


@app.get("/interviews/{interview_id}", response_model=InterviewDict)
async def get_interview_by_id(interview_id: str, user_id: Optional[str] = Depends(get_optional_user_id)):
    try:
        return get_interview(interview_id, requester_id=user_id)
    except Exception as e:
        _raise_domain_error(e)


# ===========================================================================
# Attempts
# ===========================================================================
@app.post("/interviews/{interview_id}/create-attempt", response_model=AttemptDict)
async def post_attempt(interview_id: str, user_id: str = Depends(get_current_user_id)):
    try:
        return create_attempt(interview_id, user_id)
    except Exception as e:
        _raise_domain_error(e)


@app.get("/interviews/{interview_id}/attempts", response_model=List[AttemptWithAnswersDict])
async def get_interview_attempts(
    interview_id: str,
    status: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
):
    """List the current user's attempts on a single interview.

    Each attempt includes its full answers breakdown. Optional ``status``
    query param filters to attempts in that status
    (not_started | in_progress | completed).
    """
    try:
        return list_user_attempts(interview_id, user_id, status=status)
    except Exception as e:
        _raise_domain_error(e)


@app.get("/attempts/{attempt_id}", response_model=AttemptDict)
async def get_attempt_by_id(attempt_id: str, user_id: str = Depends(get_current_user_id)):
    try:
        return get_attempt(attempt_id, user_id)
    except Exception as e:
        _raise_domain_error(e)


@app.post("/attempts/{attempt_id}/submit-answer", response_model=AnswerDict)
async def post_answer(attempt_id: str, req: SubmitAnswerRequest, user_id: str = Depends(get_current_user_id)):
    try:
        return submit_answer(attempt_id, req, user_id)
    except Exception as e:
        _raise_domain_error(e)


@app.get("/attempts/{attempt_id}/answers", response_model=List[AnswerDict])
async def get_answers(attempt_id: str, user_id: str = Depends(get_current_user_id)):
    try:
        return list_answers(attempt_id, user_id)
    except Exception as e:
        _raise_domain_error(e)


@app.post("/attempts/{attempt_id}/report", response_model=ReportDict)
async def post_report(attempt_id: str, user_id: str = Depends(get_current_user_id)):
    """Generate the aggregate report and mark the attempt completed."""
    try:
        return complete_attempt(attempt_id, user_id)
    except Exception as e:
        _raise_domain_error(e)


@app.get("/attempts/{attempt_id}/report", response_model=ReportDict)
async def get_attempt_report(attempt_id: str, user_id: str = Depends(get_current_user_id)):
    try:
        return get_report(attempt_id, user_id)
    except Exception as e:
        _raise_domain_error(e)


# ===========================================================================
# Auth
# ===========================================================================
@app.post("/signup", response_model=UserDict)
async def user_signup(req: SignupRequest, response: Response):
    try:
        auth = signup(req)
        response.set_cookie(
            key="access_token",
            value=auth.access_token,
            httponly=True,
            samesite="lax",
            max_age=30 * 60,  # 30 minutes, matches ACCESS_TOKEN_EXPIRE_MINUTES
        )
        return auth.user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Signup failed")


@app.post("/login", response_model=UserDict)
async def user_login(req: LoginRequest, response: Response):
    try:
        auth = login(req)
        response.set_cookie(
            key="access_token",
            value=auth.access_token,
            httponly=True,
            samesite="lax",
            max_age=30 * 60,
        )
        return auth.user
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Login failed")


@app.post("/logout")
async def logout(response: Response):
    """Clear auth cookie so the browser stops sending it."""
    response.delete_cookie(
        key="access_token",
        path="/",
        httponly=True,
        samesite="lax",
    )
    return {"message": "Logged out"}


@app.get('/me')
async def get_me(response: Response, access_token: Optional[str] = Cookie(None)):
    """Get current logged-in user details from cookie"""

    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated - no cookie")

    # Verify token
    payload = verify_token(access_token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = payload.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    try:
        user_details = get_user(user_id)
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            samesite="lax",
            path="/",
            max_age=30 * 60,
        )

        return user_details
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user details: {str(e)}")


@app.get("/user/{id}")
async def user_get(id: str):
    try:
        user_data = get_user(id)
        return user_data
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to get user")


@app.post("/stt")
async def speech_to_text(audio: UploadFile = File(...)):
    """
    🎤 SPEECH-TO-TEXT ENDPOINT

    Convert speech to text using OpenAI's Whisper API.
    Accepts audio file and returns transcribed text.

    Request: Multipart form data with audio file

    Response example:
    {
        "text": "This is my answer to your question...",
        "language": "en",
        "duration": 5.2
    }
    """
    try:
        # ========================================
        # STEP A: Validate Audio File
        # ========================================
        if not audio.filename:
            raise HTTPException(
                status_code=400,
                detail="No audio file provided"
            )

        # Check file format (Whisper supports: mp3, mp4, mpeg, mpga, m4a, wav, webm)
        allowed_extensions = ['.mp3', '.mp4', '.mpeg', '.mpga', '.m4a', '.wav', '.webm']
        file_extension = os.path.splitext(audio.filename)[1].lower()

        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported audio format: {file_extension}. Supported: {', '.join(allowed_extensions)}"
            )

        # ========================================
        # STEP B: Read Audio Data
        # ========================================
        audio_data = await audio.read()

        if len(audio_data) == 0:
            raise HTTPException(
                status_code=400,
                detail="Uploaded audio file is empty"
            )

        # ========================================
        # STEP C: Connect to OpenAI
        # ========================================
        client = OpenAI(api_key=OPENAI_API_KEY)

        # ========================================
        # STEP D: Transcribe Audio
        # ========================================
        # Create file-like object for OpenAI
        audio_file = BytesIO(audio_data)
        audio_file.name = audio.filename

        # Call Whisper API
        transcript = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            language="en",
            response_format="verbose_json"
        )

        # ========================================
        # STEP E: Return Transcription
        # ========================================
        return {
            "text": transcript.text,
            "language": transcript.language,
            "duration": transcript.duration
        }

    except HTTPException:
        # Re-raise HTTP exceptions (validation errors)
        raise

    except Exception as e:
        # Log error for debugging
        print(f"STT Error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"STT Error: {str(e)}"
        )

    finally:
        # Cleanup - close the uploaded file
        await audio.close()

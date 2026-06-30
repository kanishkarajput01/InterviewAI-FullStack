from typing import Optional

from app.src.utils._auth.initialize import db
from app.src.dict import InterviewDict


def get_interview(interview_id: str, requester_id: Optional[str] = None) -> InterviewDict:
    """Fetch a single interview.

    Private interviews are only visible to their owner.
    """
    try:
        snap = db.collection("interviews").document(interview_id).get()
        if not snap.exists:
            raise ValueError(f"Interview {interview_id} does not exist")

        data = snap.to_dict()
        if data.get("visibility") == "private" and data.get("user_id") != requester_id:
            raise PermissionError("This interview is private")

        return InterviewDict(**data)
    except (ValueError, PermissionError):
        raise
    except Exception as e:
        raise ValueError(f"Interview fetch failed: {str(e)}")

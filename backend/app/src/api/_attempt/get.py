from typing import List, Optional, get_args

from google.cloud.firestore import FieldFilter

from app.src.utils._auth.initialize import db
from app.src.dict import (
    AttemptDict,
    AnswerDict,
    AttemptStatus,
)

VALID_STATUSES = set(get_args(AttemptStatus))


def list_user_attempts(
    interview_id: str,
    user_id: str,
    status: Optional[str] = None,
) -> List[AttemptDict]:
    """Return all of ``user_id``'s attempts on ``interview_id``.

    When ``status`` is provided, only attempts in that status are returned
    (one of "not_started" | "in_progress" | "completed"). Results are ordered
    newest-first by creation time.
    """
    try:
        if status is not None and status not in VALID_STATUSES:
            raise ValueError(
                f"Invalid status '{status}'. Expected one of: "
                f"{', '.join(sorted(VALID_STATUSES))}"
            )

        query = (
            db.collection("attempts")
            .where(filter=FieldFilter("interview_id", "==", interview_id))
            .where(filter=FieldFilter("user_id", "==", user_id))
        )
        if status is not None:
            query = query.where(filter=FieldFilter("status", "==", status))

        attempts = [AttemptDict(**snap.to_dict()) for snap in query.get()]
        attempts.sort(key=lambda a: a.created_at, reverse=True)
        return attempts
    except ValueError:
        raise
    except Exception as e:
        raise ValueError(f"Attempt list failed: {str(e)}")


def _load_attempt(attempt_id: str, user_id: str) -> dict:
    snap = db.collection("attempts").document(attempt_id).get()
    if not snap.exists:
        raise ValueError(f"Attempt {attempt_id} does not exist")
    data = snap.to_dict()
    if data.get("user_id") != user_id:
        raise PermissionError("You do not own this attempt")
    return data


def get_attempt(attempt_id: str, user_id: str) -> AttemptDict:
    """Fetch a single attempt owned by ``user_id``."""
    try:
        return AttemptDict(**_load_attempt(attempt_id, user_id))
    except (ValueError, PermissionError):
        raise
    except Exception as e:
        raise ValueError(f"Attempt fetch failed: {str(e)}")


def list_answers(attempt_id: str, user_id: str) -> List[AnswerDict]:
    """List the answers submitted under an attempt, ordered by creation."""
    try:
        _load_attempt(attempt_id, user_id)  # ownership check
        snaps = (
            db.collection("attempts")
            .document(attempt_id)
            .collection("answers")
            .get()
        )
        answers = [AnswerDict(**s.to_dict()) for s in snaps]
        answers.sort(key=lambda a: a.created_at)
        return answers
    except (ValueError, PermissionError):
        raise
    except Exception as e:
        raise ValueError(f"Answer list failed: {str(e)}")

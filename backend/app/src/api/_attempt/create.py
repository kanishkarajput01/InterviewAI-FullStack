from datetime import datetime, timezone

from google.cloud.firestore import FieldFilter, Increment

from app.src.utils._auth.initialize import db
from app.src.dict import AttemptDict, MAX_ATTEMPTS_PER_USER


def create_attempt(interview_id: str, user_id: str) -> AttemptDict:
    """Start a new attempt on an interview for ``user_id``.

    Business rules enforced here:
      - the interview must exist (and be accessible to the user)
      - a single user may not exceed MAX_ATTEMPTS_PER_USER on one interview
      - the interview's global attempt_count is incremented atomically
    """
    try:
        interview_ref = db.collection("interviews").document(interview_id)
        interview_snap = interview_ref.get()
        if not interview_snap.exists:
            raise ValueError(f"Interview {interview_id} does not exist")

        interview = interview_snap.to_dict()
        if interview.get("visibility") == "private" and interview.get("user_id") != user_id:
            raise PermissionError("This interview is private")

        existing = (
            db.collection("attempts")
            .where(filter=FieldFilter("interview_id", "==", interview_id))
            .where(filter=FieldFilter("user_id", "==", user_id))
            .get()
        )

        # Resume an in-progress attempt instead of starting a new one. This
        # also means a resumed attempt does NOT consume the per-user cap again
        # or re-increment the interview's attempt_count.
        in_progress = next(
            (s for s in existing if s.to_dict().get("status") == "in_progress"),
            None,
        )
        if in_progress is not None:
            return AttemptDict(**in_progress.to_dict())

        # Per-user attempt cap (counts all attempts, any status).
        if len(existing) >= MAX_ATTEMPTS_PER_USER:
            raise ValueError(
                f"Attempt limit reached: a user may not exceed "
                f"{MAX_ATTEMPTS_PER_USER} attempts on the same interview"
            )

        now = datetime.now(timezone.utc)
        attempt_ref = db.collection("attempts").document()
        attempt = AttemptDict(
            id=attempt_ref.id,
            user_id=user_id,
            interview_id=interview_id,
            status="in_progress",
            current_q_index=0,
            score=None,
            started_at=now,
            completed_at=None,
            created_at=now,
            updated_at=now,
        )

        attempt_ref.set(attempt.model_dump())
        # Total attempts across ALL users.
        interview_ref.update({"attempt_count": Increment(1), "updated_at": now})

        return attempt
    except (ValueError, PermissionError):
        raise
    except Exception as e:
        raise ValueError(f"Attempt creation failed: {str(e)}")

from typing import List, Optional

from google.cloud.firestore import FieldFilter

from app.src.utils._auth.initialize import db
from app.src.dict import InterviewDict


def list_interviews(requester_id: Optional[str] = None, mine: bool = False) -> List[InterviewDict]:
    """List interviews.

    - ``mine=True``: every interview owned by the requester (requires auth).
    - default: all public interviews, plus the requester's own when authenticated.
    """
    try:
        collection = db.collection("interviews")
        results: dict = {}

        if mine:
            if not requester_id:
                raise ValueError("Authentication required to list your interviews")
            owned = collection.where(
                filter=FieldFilter("user_id", "==", requester_id)
            ).get()
            for snap in owned:
                results[snap.id] = snap.to_dict()
        else:
            public = collection.where(
                filter=FieldFilter("visibility", "==", "public")
            ).get()
            for snap in public:
                results[snap.id] = snap.to_dict()

            if requester_id:
                owned = collection.where(
                    filter=FieldFilter("user_id", "==", requester_id)
                ).get()
                for snap in owned:
                    results[snap.id] = snap.to_dict()

        interviews = [InterviewDict(**data) for data in results.values()]
        interviews.sort(key=lambda i: i.created_at, reverse=True)
        return interviews
    except ValueError:
        raise
    except Exception as e:
        raise ValueError(f"Interview list failed: {str(e)}")

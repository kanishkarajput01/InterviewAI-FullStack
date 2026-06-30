from datetime import datetime, timezone

from app.src.utils._auth.initialize import db
from app.src.utils._ai.interview_ai import generate_report
from app.src.dict import ReportDict

REPORT_DOC_ID = "summary"


def _context_for(interview: dict) -> str:
    if interview.get("type") == "job":
        return f"Job interview for role: {interview.get('role', '')}"
    return f"Skill interview for: {interview.get('skill', '')}"


def complete_attempt(attempt_id: str, user_id: str) -> ReportDict:
    """Finalize an attempt: generate the aggregate report and mark it completed.

    Idempotent-ish: the report doc has a fixed id ("summary"), so re-running
    overwrites it and recomputes the attempt score.
    """
    try:
        attempt_ref = db.collection("attempts").document(attempt_id)
        attempt_snap = attempt_ref.get()
        if not attempt_snap.exists:
            raise ValueError(f"Attempt {attempt_id} does not exist")

        attempt = attempt_snap.to_dict()
        if attempt.get("user_id") != user_id:
            raise PermissionError("You do not own this attempt")

        interview_id = attempt.get("interview_id")
        interview_snap = db.collection("interviews").document(interview_id).get()
        if not interview_snap.exists:
            raise ValueError(f"Interview {interview_id} does not exist")
        interview = interview_snap.to_dict()

        # Map question_id -> text and gather answers in question order.
        q_by_id = {q.get("question_id"): q for q in interview.get("questions", [])}
        answer_snaps = attempt_ref.collection("answers").get()
        answers = [s.to_dict() for s in answer_snaps]
        if not answers:
            raise ValueError("Cannot generate a report: no answers submitted yet")

        answers.sort(key=lambda a: q_by_id.get(a.get("question_id"), {}).get("order", 0))
        qa_pairs = [
            {
                "question": q_by_id.get(a.get("question_id"), {}).get("text", ""),
                "answer": a.get("answer", ""),
                "score": a.get("score", 0),
                "feedback": a.get("feedback", ""),
            }
            for a in answers
        ]

        report_data = generate_report(_context_for(interview), qa_pairs)

        # Overall score: prefer the model's aggregate, else average of answers.
        overall_score = report_data.get("score")
        if overall_score is None:
            scores = [a.get("score") for a in answers if a.get("score") is not None]
            overall_score = round(sum(scores) / len(scores), 2) if scores else None

        now = datetime.now(timezone.utc)
        report_ref = attempt_ref.collection("report").document(REPORT_DOC_ID)
        existing = report_ref.get()
        created_at = existing.to_dict().get("created_at") if existing.exists else now

        report = ReportDict(
            id=REPORT_DOC_ID,
            report=report_data.get("report", ""),
            summary=report_data.get("summary", ""),
            strengths=report_data.get("strengths", []),
            improvements=report_data.get("improvements", []),
            score=overall_score,
            user_id=user_id,
            attempt_id=attempt_id,
            interview_id=interview_id,
            created_at=created_at,
            updated_at=now,
        )
        report_ref.set(report.model_dump())

        attempt_ref.update({
            "status": "completed",
            "score": overall_score,
            "completed_at": now,
            "updated_at": now,
        })

        return report
    except (ValueError, PermissionError):
        raise
    except Exception as e:
        raise ValueError(f"Attempt completion failed: {str(e)}")


def get_report(attempt_id: str, user_id: str) -> ReportDict:
    """Fetch the report for an attempt owned by ``user_id``."""
    try:
        attempt_snap = db.collection("attempts").document(attempt_id).get()
        if not attempt_snap.exists:
            raise ValueError(f"Attempt {attempt_id} does not exist")
        if attempt_snap.to_dict().get("user_id") != user_id:
            raise PermissionError("You do not own this attempt")

        report_snap = (
            db.collection("attempts")
            .document(attempt_id)
            .collection("report")
            .document(REPORT_DOC_ID)
            .get()
        )
        if not report_snap.exists:
            raise ValueError("No report has been generated for this attempt yet")

        return ReportDict(**report_snap.to_dict())
    except (ValueError, PermissionError):
        raise
    except Exception as e:
        raise ValueError(f"Report fetch failed: {str(e)}")

from datetime import datetime, timezone

from app.src.utils._auth.initialize import db
from app.src.utils._ai.interview_ai import evaluate_answer
from app.src.dict import AnswerDict, SubmitAnswerRequest


def _context_for(interview: dict) -> str:
    if interview.get("type") == "job":
        return f"Job interview for role: {interview.get('role', '')}"
    return f"Skill interview for: {interview.get('skill', '')}"


def submit_answer(attempt_id: str, req: SubmitAnswerRequest, user_id: str) -> AnswerDict:
    """Submit (or resubmit) an answer to a question within an attempt.

    The answer is AI-evaluated for a score and feedback, stored under the
    attempt's ``answers`` subcollection keyed by question_id, and the attempt's
    resume position (current_q_index) is advanced past the answered question.
    """
    try:
        attempt_ref = db.collection("attempts").document(attempt_id)
        attempt_snap = attempt_ref.get()
        if not attempt_snap.exists:
            raise ValueError(f"Attempt {attempt_id} does not exist")

        attempt = attempt_snap.to_dict()
        if attempt.get("user_id") != user_id:
            raise PermissionError("You do not own this attempt")
        if attempt.get("status") == "completed":
            raise ValueError("This attempt is already completed")

        interview_id = attempt.get("interview_id")
        interview_snap = db.collection("interviews").document(interview_id).get()
        if not interview_snap.exists:
            raise ValueError(f"Interview {interview_id} does not exist")
        interview = interview_snap.to_dict()

        question = next(
            (q for q in interview.get("questions", []) if q.get("question_id") == req.question_id),
            None,
        )
        if question is None:
            raise ValueError(f"Question {req.question_id} is not part of this interview")

        score, feedback = evaluate_answer(
            context=_context_for(interview),
            question=question.get("text", ""),
            answer=req.answer,
        )

        now = datetime.now(timezone.utc)
        answers_col = attempt_ref.collection("answers")
        existing = answers_col.document(req.question_id).get()
        created_at = existing.to_dict().get("created_at") if existing.exists else now

        answer = AnswerDict(
            id=req.question_id,
            question_id=req.question_id,
            answer=req.answer,
            score=score,
            feedback=feedback,
            user_id=user_id,
            attempt_id=attempt_id,
            interview_id=interview_id,
            created_at=created_at,
            updated_at=now,
        )
        answers_col.document(req.question_id).set(answer.model_dump())

        # Advance resume position past this question (don't move backwards).
        num_questions = len(interview.get("questions", []))
        next_index = min(int(question.get("order", 0)) + 1, num_questions)
        updates = {"updated_at": now}
        if next_index > attempt.get("current_q_index", 0):
            updates["current_q_index"] = next_index
        attempt_ref.update(updates)

        return answer
    except (ValueError, PermissionError):
        raise
    except Exception as e:
        raise ValueError(f"Answer submission failed: {str(e)}")

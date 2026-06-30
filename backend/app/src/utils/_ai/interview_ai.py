"""AI helpers for the interview flow.

Thin wrappers around the OpenAI chat model used to generate interview
questions, evaluate individual answers, and produce the aggregate report.
Each function returns plain Python data so callers can persist it directly
to Firestore.
"""

import json
import os
import uuid
from typing import List, Optional, Tuple

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv

from app.src.dict import InterviewQuestion, MAX_QUESTIONS

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

_llm = ChatOpenAI(model="gpt-4", temperature=0.7, api_key=OPENAI_API_KEY)
_parser = StrOutputParser()


GENERATE_QUESTIONS_PROMPT = ChatPromptTemplate.from_template("""
You are an expert interviewer. Generate exactly {count} interview questions for the
following context.

Interview type: {interview_type}
Focus ({focus_label}): {focus}
Title: {title}
Description: {description}

The questions should be relevant, progressive in difficulty, and cover different
aspects of the topic.

Return ONLY a JSON array of {count} question strings, no explanations:
["Question 1", "Question 2", ...]
""")


EVALUATE_ANSWER_PROMPT = ChatPromptTemplate.from_template("""
You are an expert interviewer evaluating a candidate's answer.

Context: {context}
Question: {question}
Candidate's Answer: {answer}

Return ONLY a JSON object, no explanations, in this exact shape:
{{"score": <number 0-10>, "feedback": "<2-4 sentences of specific feedback>"}}
""")


FINAL_REPORT_PROMPT = ChatPromptTemplate.from_template("""
You are an expert interviewer writing a final report aggregating a candidate's
performance across all answered questions.

Context: {context}

Per-question results:
{results}

Return ONLY a JSON object, no explanations, in this exact shape:
{{
  "report": "<a few paragraphs of professional prose assessment>",
  "summary": "<2-3 sentence synopsis>",
  "strengths": ["<strength>", ...],
  "improvements": ["<area to improve>", ...],
  "score": <overall number 0-10>
}}
""")


def _coerce_score(value, lo: float = 0.0, hi: float = 10.0) -> float:
    """Best-effort parse of a model-produced score into a clamped float."""
    try:
        score = float(value)
    except (TypeError, ValueError):
        return lo
    return max(lo, min(hi, score))


def _focus_for(interview_type: str, role: Optional[str], skill: Optional[str]) -> Tuple[str, str]:
    if interview_type == "job":
        return "role", role or "the role"
    return "skill", skill or "the skill"


def generate_questions(
    interview_type: str,
    title: str,
    description: str,
    role: Optional[str] = None,
    skill: Optional[str] = None,
    count: int = MAX_QUESTIONS,
) -> List[InterviewQuestion]:
    """Generate up to MAX_QUESTIONS questions for an interview."""
    count = max(1, min(MAX_QUESTIONS, count))
    focus_label, focus = _focus_for(interview_type, role, skill)

    chain = GENERATE_QUESTIONS_PROMPT | _llm | _parser
    raw = chain.invoke({
        "count": count,
        "interview_type": interview_type,
        "focus_label": focus_label,
        "focus": focus,
        "title": title,
        "description": description or "",
    })

    texts = json.loads(raw)
    questions: List[InterviewQuestion] = []
    for order, text in enumerate(texts[:count]):
        questions.append(
            InterviewQuestion(
                question_id=str(uuid.uuid4()),
                text=str(text),
                order=order,
                type="text",
            )
        )
    return questions


def evaluate_answer(context: str, question: str, answer: str) -> Tuple[float, str]:
    """Score a single answer (0-10) and return (score, feedback)."""
    chain = EVALUATE_ANSWER_PROMPT | _llm | _parser
    raw = chain.invoke({
        "context": context,
        "question": question,
        "answer": answer,
    })
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return 0.0, raw.strip()
    return _coerce_score(data.get("score")), str(data.get("feedback", "")).strip()


def generate_report(context: str, qa_pairs: List[dict]) -> dict:
    """Produce the aggregate report payload over all answered questions.

    qa_pairs items: {"question": str, "answer": str, "score": float, "feedback": str}
    Returns a dict with keys: report, summary, strengths, improvements, score.
    """
    results = ""
    for i, qa in enumerate(qa_pairs):
        results += f"\nQ{i + 1}: {qa.get('question', '')}\n"
        results += f"Answer: {qa.get('answer', '')}\n"
        results += f"Score: {qa.get('score', 0)}/10\n"
        results += f"Feedback: {qa.get('feedback', '')}\n"
        results += "-" * 40 + "\n"

    chain = FINAL_REPORT_PROMPT | _llm | _parser
    raw = chain.invoke({"context": context, "results": results})

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        data = {"report": raw.strip()}

    return {
        "report": str(data.get("report", "")).strip(),
        "summary": str(data.get("summary", "")).strip(),
        "strengths": [str(s) for s in (data.get("strengths") or [])],
        "improvements": [str(s) for s in (data.get("improvements") or [])],
        "score": _coerce_score(data.get("score")) if data.get("score") is not None else None,
    }

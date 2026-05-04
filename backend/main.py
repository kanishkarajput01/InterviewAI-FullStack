import os
import json
import uuid
from typing import List, Optional, Literal, TypedDict


from fastapi import FastAPI, HTTPException, Response, Cookie
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv
from app.src.dict import SignupRequest, LoginRequest
from app.src.api._auth.signup import signup
from app.src.api._auth.login import login
from app.src.api._auth.user import user as get_user
from app.src.utils._auth.jwt import verify_token


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


llm = ChatOpenAI(model="gpt-4", temperature=0.7, api_key=OPENAI_API_KEY)
parser = StrOutputParser()


# ---------------------------
# Prompts
# ---------------------------
GENERATE_QUESTIONS_PROMPT = ChatPromptTemplate.from_template("""
You are an expert technical interviewer. Based on the job role and experience level, generate exactly 5 relevant technical questions.


Job Role: {job_role}
Experience Level: {experience} years


Generate 5 questions that are:
1. Appropriate for the experience level
2. Technical and role-specific
3. Progressive in difficulty
4. Cover different aspects of the role


Return ONLY a JSON array of 5 questions, no explanations:
[
    "Question 1",
    "Question 2",
    "Question 3",
    "Question 4",
    "Question 5"
]
""")


EVALUATE_ANSWER_PROMPT = ChatPromptTemplate.from_template("""
You are an expert technical interviewer evaluating a candidate's answer.


Job Role: {job_role}
Experience Level: {experience} years
Question: {question}
Candidate's Answer: {answer}


Provide a detailed evaluation including:
1. Technical accuracy (1-10)
2. Completeness of answer (1-10)
3. Clarity of explanation (1-10)
4. Specific feedback and suggestions
5. Overall score (1-10)


Format your response as:
Score: X/10
Technical Accuracy: X/10
Completeness: X/10
Clarity: X/10
Feedback: [Your detailed feedback here]
""")


FINAL_REPORT_PROMPT = ChatPromptTemplate.from_template("""
You are an expert technical interviewer creating a comprehensive interview report.


Job Role: {job_role}
Experience Level: {experience} years


Interview Results:
{interview_results}


Create a professional final report including:
1. Overall assessment
2. Strengths identified
3. Areas for improvement
4. Technical competency score (average of all scores)
5. Recommendation (Pass/Fail/Consider with conditions)
6. Detailed breakdown of each question


Format as a professional report.
""")


# ---------------------------
# LangGraph State Definition
# ---------------------------
class InterviewQA(TypedDict):
    question: str
    answer: str
    feedback: str


class InterviewState(TypedDict):
    job_role: str
    experience: int
    data: List[InterviewQA]
    current_question_idx: int
    interview_complete: bool
    final_report: str
    last_question: str
    last_answer: Optional[str]  # For API input

class SessionResponse(BaseModel):
    id: str
    data: List[InterviewQA]
    job_role: str
    experience: int
    current_question_idx: int
# ---------------------------
# LangGraph Nodes
# ---------------------------
def get_job_role_and_experience(state: InterviewState) -> InterviewState:
    """Validate job role and experience are provided."""
    if not state.get("job_role") or state.get("experience") is None:
        raise ValueError("job_role and experience must be provided.")
    return state


def generate_questions(state: InterviewState) -> InterviewState:
    """Generate interview questions based on job role and experience."""
    chain = GENERATE_QUESTIONS_PROMPT | llm | parser
    questions_json = chain.invoke({
        "job_role": state["job_role"],
        "experience": state["experience"]
    })
    questions = json.loads(questions_json)
    question_list: List[InterviewQA] = [{"question": q, "answer": "", "feedback": ""} for q in questions]
    
    return {
        **state,
        "data": question_list,
        "current_question_idx": 0,
        "interview_complete": False,
        "final_report": "",
        "last_question": question_list[0]["question"] if question_list else ""
    }


def ask_question(state: InterviewState) -> InterviewState:
    """Get the current question."""
    idx = state.get("current_question_idx", 0)
    if idx >= 5:
        return state
    q_text = state["data"][idx]["question"]
    return {**state, "last_question": q_text}


def evaluate_answer(state: InterviewState) -> InterviewState:
    """Evaluate the candidate's answer and generate feedback."""
    idx = state.get("current_question_idx", 0)
    if idx >= 5:
        return state
    
    # Check if we have an answer to evaluate
    last_answer = state.get("last_answer")
    if not last_answer:
        # No answer provided, just return current state
        return state
    
    question_text = state["data"][idx]["question"]
    answer_text = last_answer.strip()
    
    if not answer_text:
        raise ValueError("No answer provided for current question.")


    chain = EVALUATE_ANSWER_PROMPT | llm | parser
    feedback = chain.invoke({
        "job_role": state["job_role"],
        "experience": state["experience"],
        "question": question_text,
        "answer": answer_text
    })
    
    data_copy = state["data"].copy()
    data_copy[idx]["answer"] = answer_text
    data_copy[idx]["feedback"] = feedback


    new_idx = idx + 1
    next_question = data_copy[new_idx]["question"] if new_idx < 5 else ""
    
    return {
        **state,
        "data": data_copy,
        "current_question_idx": new_idx,
        "last_question": next_question,
        "last_answer": None  # Clear the answer after processing
    }


def generate_final_report(state: InterviewState) -> InterviewState:
    """Generate the final interview report."""
    interview_results = ""
    for i in range(5):
        qd = state["data"][i]
        interview_results += f"\nQuestion {i+1}: {qd['question']}\n"
        interview_results += f"Answer: {qd['answer']}\n"
        interview_results += f"Feedback: {qd['feedback']}\n"
        interview_results += "-" * 40 + "\n"


    chain = FINAL_REPORT_PROMPT | llm | parser
    final_report = chain.invoke({
        "job_role": state["job_role"],
        "experience": state["experience"],
        "interview_results": interview_results
    })
    
    return {
        **state, 
        "final_report": final_report, 
        "interview_complete": True
    }


def should_continue_interview(state: InterviewState) -> Literal["continue", "complete"]:
    """Determine if interview should continue or complete."""
    current_idx = state.get("current_question_idx", 0)
    return "continue" if current_idx < 5 else "complete"


# ---------------------------
# LangGraph Workflow Setup
# ---------------------------
workflow = StateGraph(InterviewState)
workflow.add_node("get_job_role_and_experience", get_job_role_and_experience)
workflow.add_node("generate_questions", generate_questions)
workflow.add_node("ask_question", ask_question)
workflow.add_node("evaluate_answer", evaluate_answer)
workflow.add_node("generate_final_report", generate_final_report)


# Simple workflow: just generate questions and ask first question
workflow.add_edge(START, "get_job_role_and_experience")
workflow.add_edge("get_job_role_and_experience", "generate_questions")
workflow.add_edge("generate_questions", "ask_question")
workflow.add_edge("ask_question", END)


# Compile with memory checkpointer for session persistence
checkpointer = MemorySaver()
compiled_graph = workflow.compile(checkpointer=checkpointer)


class CreateSessionRequest(BaseModel):
    job_role: str = Field(..., example="Research Engineer")
    experience: int = Field(..., example=1)

class CreateSessionResponse(BaseModel):
        id: str
        questions: List[str]
        job_role: str
        experience: int
        current_question_idx: int

class GetSessionRequest(BaseModel):
    session_id: str

class SubmitAnswerRequest(BaseModel):
    answer: str
class SubmitAnswerResponse(BaseModel):
    question: str
    answer: str
    feedback: str
    next_question: Optional[str]=None
    next_question_idx: Optional[int]=None

class ReportResponse(BaseModel):
    job_role: str
    experience: int
    final_report: str
    interview_complete: bool

@app.post("/create-session")
async def create_session(req: CreateSessionRequest):
    session_id = str(uuid.uuid4())
    config = {"configurable": {"thread_id": session_id}}
    initial_state: InterviewState = {
        "job_role": req.job_role,
        "experience": req.experience,
        "data": [],
        "current_question_idx": 0,
        "interview_complete": False,
        "final_report": "",
        "last_question": "",
        "last_answer": None
    }

    compiled_graph.invoke(initial_state, config=config)
    state = compiled_graph.get_state(config)
    values = state.values
    questions = [row["question"] for row in values.get("data", [])]
    return CreateSessionResponse(
        id= session_id,
        questions=questions,
        job_role=values["job_role"],
        experience=values["experience"],
        current_question_idx=values.get("current_question_idx", 0),
    )


@app.get("/session/{session_id}")
async def get_session(session_id: str):
    config = {"configurable": {"thread_id": session_id}}
    state = compiled_graph.get_state(config)
    values = state.values
    return SessionResponse(
        id=session_id,
        data=values["data"],
        job_role=values["job_role"],
        experience=values["experience"],
        current_question_idx=values.get("current_question_idx", 0),
    )

@app.post("/session/{session_id}/answers")
async def post_answers(session_id: str, req: SubmitAnswerRequest):
    config = {"configurable": {"thread_id": session_id}}
    state = compiled_graph.get_state(config)
    
    values = state.values
    idx = values.get("current_question_idx", 0)
    question = values["data"][idx]["question"]
    eval_values = {**values, "last_answer": req.answer.strip()} 

    updated_state = evaluate_answer(eval_values)
    compiled_graph.update_state( config, updated_state)
    feedback = updated_state["data"][idx]["feedback"]
    next_question: Optional[str] = None
    next_question_idx: Optional[int] = None
    if updated_state.get("current_question_idx", 0) < 5:
        next_question_idx = updated_state["current_question_idx"]
        next_question = updated_state["data"][next_question_idx]["question"]
    else:
        # //generate final report
        final_state = generate_final_report(updated_state)
        compiled_graph.update_state(config, final_state)
    return SubmitAnswerResponse(
        question=question,
        answer=req.answer,
        feedback=feedback,
        next_question=next_question,
        next_question_idx=next_question_idx,
    )

@app.get("/session/{session_id}/report")
async def get_report(session_id: str):
    config = {"configurable": {"thread_id": session_id}}
    state = compiled_graph.get_state(config)
    values = state.values
    return ReportResponse(
       job_role=values["job_role"],
       experience=values["experience"],
       final_report=values["final_report"],
       interview_complete=values["interview_complete"],
    )

@app.post("/signup")
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
    except Exception as e:
        raise HTTPException(status_code=500, detail="Signup failed")

@app.post("/login")
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
    except Exception as e:
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
async def get_me(access_token: Optional[str] = Cookie(None)):
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
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to get user")
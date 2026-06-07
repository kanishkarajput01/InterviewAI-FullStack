export interface IUser {
    id: string;
    username: string;
    email?: string;
    created_at?: string;
  }
  
  export interface IAuthCredentials {
    username: string;
    password: string;
    email?: string;
  }
  export enum AuthModeEnum {
    LOGIN = "login",
    SIGNUP = "signup",
  }

  export interface ICreateSessionRequest {
    jobRole: string;
    experience: number;
  }

  export interface IInterviewQA {
    question: string;
    answer: string;
    feedback: string;
  }

  export interface ISession {
    id: string;
    job_role: string;
    experience: number;
    current_question_idx: number;
    data: IInterviewQA[];
  }

  export interface ICreateSessionResponse {
    id: string;
    questions: string[];
    job_role: string;
    experience: number;
    current_question_idx: number;
  }

  export interface ISubmitAnswerResponse {
    question: string;
    answer: string;
    feedback: string;
    next_question: string | null;
    next_question_idx: number | null;
  }

  export interface IReportResponse {
    job_role: string;
    experience: number;
    final_report: string;
    interview_complete: boolean;
  }

  export enum SessionPhaseEnum {
    LOADING = "loading",
    ANSWERING = "answering",
    SUBMITTING = "submitting",
    FEEDBACK = "feedback",
    FETCHING_REPORT = "fetching-report",
    REPORT = "report",
    ERROR = "error",
  }
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

// ---------------------------------------------------------------------------
// Interviews
// ---------------------------------------------------------------------------
export type InterviewType = "job" | "skill";
export type Visibility = "public" | "private";
export type QuestionType = "text" | "mcq";

export const MAX_QUESTIONS = 5;

export interface IInterviewQuestion {
  question_id: string;
  text: string;
  order: number;
  type: QuestionType;
}

export interface ICreateInterviewRequest {
  title: string;
  description?: string;
  type: InterviewType;
  role?: string | null;
  skill?: string | null;
  visibility?: Visibility;
  // Optional client-supplied questions; omitted => AI-generated.
  questions?: IInterviewQuestion[];
}

export interface IInterview {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: InterviewType;
  role?: string | null;
  skill?: string | null;
  visibility: Visibility;
  questions: IInterviewQuestion[];
  attempt_count: number;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Attempts
// ---------------------------------------------------------------------------
export const MAX_ATTEMPTS_PER_USER = 10;

export enum AttemptStatusEnum {
  NOT_STARTED = "not_started",
  COMPLETED = "completed",
  IN_PROGRESS = "in_progress",
}
export interface IAttempt {
  id: string;
  user_id: string;
  interview_id: string;
  status: AttemptStatusEnum;
  current_q_index: number;
  score?: number | null;
  started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Answers
// ---------------------------------------------------------------------------
export interface ISubmitAnswerRequest {
  question_id: string;
  answer: string;
}

export interface IAnswer {
  id: string;
  question_id: string;
  answer: string;
  score?: number | null;
  feedback: string;
  user_id: string;
  attempt_id: string;
  interview_id: string;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
export interface IReport {
  id: string;
  report: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  score?: number | null;
  user_id: string;
  attempt_id: string;
  interview_id: string;
  created_at: string;
  updated_at: string;
}

export enum InterviewPhaseEnum {
  LOADING = "loading",
  ANSWERING = "answering",
  SUBMITTING = "submitting",
  FEEDBACK = "feedback",
  FETCHING_REPORT = "fetching-report",
  REPORT = "report",
  ERROR = "error",
}

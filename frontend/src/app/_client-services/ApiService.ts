import type {
  AttemptStatusEnum,
  IAnswer,
  IAttempt,
  ICreateInterviewRequest,
  IInterview,
  IReport,
  IUser,
} from "@/_shared/types";

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

type Method = "POST" | "GET" | "PUT" | "DELETE";

enum EApiRoute {
  SIGNUP = "SIGNUP",
  LOGIN = "LOGIN",
  REFRESH = "REFRESH",
  ME = "ME",
  LOGOUT = "LOGOUT",
  CREATE_INTERVIEW = "CREATE_INTERVIEW",
  LIST_INTERVIEWS = "LIST_INTERVIEWS",
  GET_INTERVIEW = "GET_INTERVIEW",
  CREATE_ATTEMPT = "CREATE_ATTEMPT",
  LIST_INTERVIEW_ATTEMPTS = "LIST_INTERVIEW_ATTEMPTS",
  GET_ATTEMPT = "GET_ATTEMPT",
  SUBMIT_ANSWER = "SUBMIT_ANSWER",
  LIST_ANSWERS = "LIST_ANSWERS",
  GENERATE_REPORT = "GENERATE_REPORT",
  GET_REPORT = "GET_REPORT",
  STT = "STT",
}

export class ApiClientService {
  private static async getRouteConfig({
    route,
    routeSegments,
    searchParams,
  }: {
    route: EApiRoute;
    routeSegments?: string[];
    searchParams?: Record<string, string>;
  }): Promise<{ url: URL; method: Method }> {
    const baseURL = NEXT_PUBLIC_API_URL;
    let method: Method = "GET";

    let path = "";
    const segments = routeSegments?.length ? `/${routeSegments.join("/")}` : "";

    switch (route) {
      case EApiRoute.SIGNUP:
        path = "/signup";
        method = "POST";
        break;
      case EApiRoute.LOGIN:
        path = "/login";
        method = "POST";
        break;
      case EApiRoute.REFRESH:
        path = "/refresh";
        method = "POST";
        break;
      case EApiRoute.ME:
        path = "/me";
        method = "GET";
        break;
      case EApiRoute.LOGOUT:
        path = "/logout";
        method = "POST";
        break;
      // Interviews
      case EApiRoute.CREATE_INTERVIEW:
        path = "/create-interview";
        method = "POST";
        break;
      case EApiRoute.LIST_INTERVIEWS:
        path = "/interviews";
        method = "GET";
        break;
      case EApiRoute.GET_INTERVIEW:
        // /interviews/{interview_id}
        path = "/interviews";
        method = "GET";
        break;
      case EApiRoute.CREATE_ATTEMPT:
        // /interviews/{interview_id}/attempts
        path = "/interviews";
        method = "POST";
        break;
      case EApiRoute.LIST_INTERVIEW_ATTEMPTS:
        // /interviews/{interview_id}/attempts(?status=)
        path = "/interviews";
        method = "GET";
        break;
      // Attempts
      case EApiRoute.GET_ATTEMPT:
        // /attempts/{attempt_id}
        path = "/attempts";
        method = "GET";
        break;
      case EApiRoute.SUBMIT_ANSWER:
        // /attempts/{attempt_id}/answers
        path = "/attempts";
        method = "POST";
        break;
      case EApiRoute.LIST_ANSWERS:
        // /attempts/{attempt_id}/answers
        path = "/attempts";
        method = "GET";
        break;
      case EApiRoute.GENERATE_REPORT:
        // /attempts/{attempt_id}/report
        path = "/attempts";
        method = "POST";
        break;
      case EApiRoute.GET_REPORT:
        // /attempts/{attempt_id}/report
        path = "/attempts";
        method = "GET";
        break;
      case EApiRoute.STT:
        path = "/stt";
        method = "POST";
        break;
      default:
        throw new Error(`Invalid route: ${route}`);
    }

    const url = new URL(`${baseURL}${path}${segments}`);
    if (searchParams) {
      for (const [key, value] of Object.entries(searchParams)) {
        url.searchParams.set(key, value);
      }
    }
    return { url, method };
  }

  private static async apiClientService<T>({
    url,
    method,
    data,
  }: {
    url: URL;
    method: Method;
    data?: Record<string, unknown>;
  }): Promise<{ error: string | null; data: T | null }> {
    if (!NEXT_PUBLIC_API_URL) {
      return {
        error:
          "API URL is not configured. Please check your environment variables.",
        data: null,
      };
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    try {
      const response = await fetch(url, {
        method,
        body: data ? JSON.stringify(data) : undefined,
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          // If we can't parse the error response, use the status text
        }

        return {
          error: errorMessage,
          data: null,
        };
      }

      const resJSON = await response.json();
      return {
        error: null,
        data: resJSON as T,
      };
    } catch (err) {
      console.error("Network error occurred:", err);

      return {
        error: `Network error: ${err instanceof Error ? err.message : "Unknown error"}`,
        data: null,
      };
    }
  }

  static async signup({
    username,
    password,
    email,
  }: {
    username: string;
    password: string;
    email?: string;
  }) {
    const { url, method } = await this.getRouteConfig({
      route: EApiRoute.SIGNUP,
    });
    return this.apiClientService<IUser>({
      url,
      method,
      data: { username, password, email },
    });
  }

  static async login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    const { url, method } = await this.getRouteConfig({
      route: EApiRoute.LOGIN,
    });
    return this.apiClientService<IUser>({
      url,
      method,
      data: { email, password },
    });
  }

  static async logout() {
    const { url, method } = await this.getRouteConfig({
      route: EApiRoute.LOGOUT,
    });
    return this.apiClientService<{ message: string }>({
      url,
      method,
    });
  }

  static async refreshToken({ refresh_token }: { refresh_token: string }) {
    const { url, method } = await this.getRouteConfig({
      route: EApiRoute.REFRESH,
    });
    return this.apiClientService<IUser>({
      url,
      method,
      data: { refresh_token },
    });
  }

  static async getCurrentUser() {
    const { url, method } = await this.getRouteConfig({ route: EApiRoute.ME });
    return this.apiClientService<IUser>({
      url,
      method,
    });
  }

  static async checkApiHealth() {
    if (!NEXT_PUBLIC_API_URL) {
      return { isHealthy: false, error: "API URL not configured" };
    }

    try {
      const healthUrl = new URL("/health", NEXT_PUBLIC_API_URL);
      const response = await fetch(healthUrl, { method: "GET" });
      return { isHealthy: response.ok, status: response.status };
    } catch (error) {
      return {
        isHealthy: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // -------------------------------------------------------------------------
  // Interviews
  // -------------------------------------------------------------------------
  static async createInterview(payload: ICreateInterviewRequest) {
    const { url, method } = await this.getRouteConfig({
      route: EApiRoute.CREATE_INTERVIEW,
    });
    return this.apiClientService<IInterview>({
      url,
      method,
      data: { ...payload },
    });
  }

  static async listInterviews({ mine = false }: { mine?: boolean } = {}) {
    const { url, method } = await this.getRouteConfig({
      route: EApiRoute.LIST_INTERVIEWS,
      searchParams: mine ? { mine: "true" } : undefined,
    });
    return this.apiClientService<IInterview[]>({ url, method });
  }

  static async getInterview({ interviewId }: { interviewId: string }) {
    const { url, method } = await this.getRouteConfig({
      route: EApiRoute.GET_INTERVIEW,
      routeSegments: [interviewId],
    });
    return this.apiClientService<IInterview>({ url, method });
  }

  // -------------------------------------------------------------------------
  // Attempts
  // -------------------------------------------------------------------------
  static async createAttempt({ interviewId }: { interviewId: string }) {
    const { url, method } = await this.getRouteConfig({
      route: EApiRoute.CREATE_ATTEMPT,
      routeSegments: [interviewId, "create-attempt"],
    });
    return this.apiClientService<IAttempt>({ url, method });
  }

  static async listInterviewAttempts({
    interviewId,
    status,
  }: {
    interviewId: string;
    status?: AttemptStatusEnum;
  }) {
    const { url, method } = await this.getRouteConfig({
      route: EApiRoute.LIST_INTERVIEW_ATTEMPTS,
      routeSegments: [interviewId, "attempts"],
      searchParams: status ? { status } : undefined,
    });
    return this.apiClientService<IAttempt[]>({ url, method });
  }

  static async getAttempt({ attemptId }: { attemptId: string }) {
    const { url, method } = await this.getRouteConfig({
      route: EApiRoute.GET_ATTEMPT,
      routeSegments: [attemptId],
    });
    return this.apiClientService<IAttempt>({ url, method });
  }

  static async submitAnswer({
    attemptId,
    questionId,
    answer,
  }: {
    attemptId: string;
    questionId: string;
    answer: string;
  }) {
    const { url, method } = await this.getRouteConfig({
      route: EApiRoute.SUBMIT_ANSWER,
      routeSegments: [attemptId, 'submit-answer'],
    });
    return this.apiClientService<IAnswer>({
      url,
      method,
      data: { question_id: questionId, answer },
    });
  }

  static async listAnswers({ attemptId }: { attemptId: string }) {
    const { url, method } = await this.getRouteConfig({
      route: EApiRoute.LIST_ANSWERS,
      routeSegments: [attemptId, "answers"],
    });
    return this.apiClientService<IAnswer[]>({ url, method });
  }

  static async generateReport({ attemptId }: { attemptId: string }) {
    const { url, method } = await this.getRouteConfig({
      route: EApiRoute.GENERATE_REPORT,
      routeSegments: [attemptId, "report"],
    });
    return this.apiClientService<IReport>({ url, method });
  }

  static async getReport({ attemptId }: { attemptId: string }) {
    const { url, method } = await this.getRouteConfig({
      route: EApiRoute.GET_REPORT,
      routeSegments: [attemptId, "report"],
    });
    return this.apiClientService<IReport>({ url, method });
  }

  static async transcribeAudio({
    audioBlob,
  }: {
    audioBlob: Blob;
  }): Promise<{ error: string | null; data: { text: string } | null }> {
    if (!NEXT_PUBLIC_API_URL) {
      return { error: "API URL is not configured.", data: null };
    }
    const { url } = await this.getRouteConfig({ route: EApiRoute.STT });
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");
    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          /* ignore parse failure */
        }
        return { error: errorMessage, data: null };
      }
      const data = await response.json();
      return { error: null, data };
    } catch (err) {
      return {
        error: `Network error: ${err instanceof Error ? err.message : "Unknown error"}`,
        data: null,
      };
    }
  }
}

export default ApiClientService;

import type { ICreateSessionRequest, ICreateSessionResponse, IReportResponse, ISession, ISubmitAnswerResponse, IUser } from "@/_shared/types";

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

type Method = "POST" | "GET" | "PUT" | "DELETE";

enum EApiRoute {
  SIGNUP = "SIGNUP",
  LOGIN = "LOGIN",
  REFRESH = "REFRESH",
  ME = "ME",
  LOGOUT = "LOGOUT",
  CREATE_SESSION = "CREATE_SESSION",
  GET_SESSION = "GET_SESSION",
  SUBMIT_ANSWER = "SUBMIT_ANSWER",
  GET_REPORT = "GET_REPORT",
}

export class ApiClientService {
  private static async getRouteConfig({
    route,
    routeSegments,
  }: {
    route: EApiRoute;
    routeSegments?: string[];
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
      case EApiRoute.CREATE_SESSION:
        path = "/create-session";
        method = "POST";
        break;
      case EApiRoute.GET_SESSION:
        path = "/session";
        method = "GET";
        break;
      case EApiRoute.SUBMIT_ANSWER:
        path = "/session";
        method = "POST";
        break;
      case EApiRoute.GET_REPORT:
        path = "/session";
        method = "GET";
        break;
      default:
        throw new Error(`Invalid route: ${route}`);
    }

    const url = new URL(`${baseURL}${path}${segments}`);
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

  static async createSession({ jobRole, experience }: ICreateSessionRequest) {
    const { url, method } = await this.getRouteConfig({ route: EApiRoute.CREATE_SESSION });
    return this.apiClientService<ICreateSessionResponse>({
      url,
      method,
      data: { job_role: jobRole, experience },
    });
  }

  static async getSession({ sessionId }: { sessionId: string }) {
    const { url, method } = await this.getRouteConfig({ route: EApiRoute.GET_SESSION, routeSegments: [sessionId] });
    return this.apiClientService<ISession>({ url, method });
  }

  static async submitAnswer({ sessionId, answer }: { sessionId: string; answer: string }) {
    const { url, method } = await this.getRouteConfig({ route: EApiRoute.SUBMIT_ANSWER, routeSegments: [sessionId, "answers"] });
    return this.apiClientService<ISubmitAnswerResponse>({ url, method, data: { answer } });
  }

  static async getReport({ sessionId }: { sessionId: string }) {
    const { url, method } = await this.getRouteConfig({ route: EApiRoute.GET_REPORT, routeSegments: [sessionId, "report"] });
    return this.apiClientService<IReportResponse>({ url, method });
  }
}

export default ApiClientService;

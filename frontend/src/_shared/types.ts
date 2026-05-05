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
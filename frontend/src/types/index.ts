export interface IUser {
  id: string;
  username: string;
  email?: string;
  created_at?: string;
}

export interface IUserResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: IUser;
}

export interface IAuthCredentials {
  username: string;
  password: string;
  email?: string;
}

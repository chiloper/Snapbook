export interface AuthUser {
  id: string;
  email: string;
  display_name: string;
}

export interface SessionResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number; // unix seconds
  user: AuthUser;
}

export interface RegisterSuccessResponse {
  requires_confirmation?: boolean;
  message?: string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  user?: AuthUser;
}

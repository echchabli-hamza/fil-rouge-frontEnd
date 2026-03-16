export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: string;
  id: number;
  name?: string;
  email?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

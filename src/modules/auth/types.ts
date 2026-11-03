/**
 * Tipos y contratos de datos para la autenticación y gestión de sesiones.
 */

export interface SessionUser {
  id: string;
  username: string;
  name: string;
  roleId?: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthSuccessResult {
  success: true;
  user: SessionUser;
}

export interface AuthFailureResult {
  success: false;
  error: string;
}

export type AuthResult = AuthSuccessResult | AuthFailureResult;

export interface SessionTokenPayload {
  sub: string;
  username: string;
  name: string;
  roleId?: string | null;
  iat?: number;
  exp?: number;
}

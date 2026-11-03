import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { SessionUser, SessionTokenPayload } from './types';

/**
 * Nombre de la cookie donde se almacena el token de sesión.
 */
export const SESSION_COOKIE_NAME = 'darmax_marketing_session';

/**
 * Duración de la sesión en segundos (7 días).
 */
const SESSION_EXPIRATION_SECONDS = 60 * 60 * 24 * 7;

/**
 * Obtiene la clave secreta para firmar los tokens de sesión.
 * En producción se lee de la variable SESSION_SECRET.
 */
function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('La clave de sesión no está definida');
  }
  return new TextEncoder().encode(secret);
}

/**
 * Genera un token JWT firmado con la información básica del usuario autenticado.
 *
 * @param user - Objeto con la información del usuario en sesión.
 * @returns Cadena con el token firmado digitalmente.
 */
export async function createSessionToken(user: SessionUser): Promise<string> {
  const secretKey = getSecretKey();

  return new SignJWT({
    username: user.username,
    name: user.name,
    roleId: user.roleId ?? null,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_EXPIRATION_SECONDS}s`)
    .sign(secretKey);
}

/**
 * Valida un token JWT de sesión y extrae la información contenida en su carga útil.
 *
 * @param token - Cadena del token recibido de la cookie.
 * @returns El usuario decodificado o null si el token es inválido o expiró.
 */
export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    const typedPayload = payload as unknown as SessionTokenPayload;

    if (!typedPayload.sub || !typedPayload.username || !typedPayload.name) {
      return null;
    }

    return {
      id: typedPayload.sub,
      username: typedPayload.username,
      name: typedPayload.name,
      roleId: typedPayload.roleId ?? null,
    };
  } catch {
    return null;
  }
}

/**
 * Almacena el token de sesión en una cookie HTTP-only segura en el navegador del cliente.
 *
 * @param user - Información del usuario autenticado.
 */
export async function setSessionCookie(user: SessionUser): Promise<void> {
  const token = await createSessionToken(user);
  const cookieStore = await cookies();

  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_EXPIRATION_SECONDS,
  });
}

/**
 * Lee la cookie de sesión actual y devuelve el usuario autenticado si es válida.
 *
 * @returns El usuario en sesión actual, o null si no hay sesión activa.
 */
export async function getCurrentSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!tokenCookie?.value) {
    return null;
  }

  return verifySessionToken(tokenCookie.value);
}

/**
 * Elimina la cookie de sesión del navegador para cerrar la sesión del usuario.
 */
export async function removeSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

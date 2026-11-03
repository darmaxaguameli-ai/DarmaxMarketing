import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from './password';
import type { LoginCredentials, AuthResult, SessionUser } from './types';

/**
 * Servicio de autenticación encargado de la validación y gestión de administradores.
 */

/**
 * Valida las credenciales de acceso (nombre de usuario y contraseña).
 *
 * @param credentials - Objeto con el usuario y contraseña enviados desde el formulario.
 * @returns Resultado exitoso con el usuario si las credenciales son válidas, o mensaje de error.
 */
export async function verifyCredentials(
  credentials: LoginCredentials
): Promise<AuthResult> {
  const normalizedUsername = credentials.username.trim().toLowerCase();

  if (!normalizedUsername || !credentials.password) {
    return {
      success: false,
      error: 'El nombre de usuario y la contraseña son requeridos.',
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      username: normalizedUsername,
    },
  });

  if (!user) {
    return {
      success: false,
      error: 'Credenciales inválidas.',
    };
  }

  const isPasswordValid = await verifyPassword(credentials.password, user.password);

  if (!isPasswordValid) {
    return {
      success: false,
      error: 'Credenciales inválidas.',
    };
  }

  return {
    success: true,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      roleId: user.roleId,
    },
  };
}

/**
 * Registra un nuevo administrador en el sistema cifrando su contraseña.
 *
 * @param data - Datos iniciales del administrador (usuario, nombre y contraseña en plano).
 * @returns Información básica del administrador registrado.
 */
export async function createAdminUser(data: {
  username: string;
  name: string;
  password: string;
  roleId?: string | null;
}): Promise<SessionUser> {
  const normalizedUsername = data.username.trim().toLowerCase();
  const hashedPassword = await hashPassword(data.password);

  const newUser = await prisma.user.create({
    data: {
      username: normalizedUsername,
      name: data.name.trim(),
      password: hashedPassword,
      roleId: data.roleId ?? null,
    },
  });

  return {
    id: newUser.id,
    username: newUser.username,
    name: newUser.name,
    roleId: newUser.roleId,
  };
}

/**
 * Busca a un usuario por su identificador único.
 *
 * @param id - Identificador UUID del usuario.
 * @returns El usuario si existe en la base de datos, o null.
 */
export async function findUserById(id: string): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    roleId: user.roleId,
  };
}

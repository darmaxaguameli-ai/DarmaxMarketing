import { NextResponse } from 'next/server';
import { verifyCredentials, setSessionCookie } from '@/modules/auth';
import type { LoginCredentials } from '@/modules/auth';

interface LoginApiResponse {
  success: boolean;
  user?: {
    id: string;
    username: string;
    name: string;
  };
  error?: string;
}

/**
 * Endpoint de inicio de sesión para administradores.
 * Valida usuario y contraseña, y establece una cookie HTTP-only segura en caso de éxito.
 *
 * @param request - Solicitud HTTP entrante con el cuerpo JSON de credenciales.
 * @returns Respuesta JSON con el resultado de la autenticación.
 */
export async function POST(
  request: Request
): Promise<NextResponse<LoginApiResponse>> {
  try {
    const body = (await request.json()) as Partial<LoginCredentials>;

    if (!body.username || !body.password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Debe ingresar su usuario y contraseña.',
        },
        { status: 400 }
      );
    }

    const authResult = await verifyCredentials({
      username: body.username,
      password: body.password,
    });

    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.error,
        },
        { status: 401 }
      );
    }

    await setSessionCookie(authResult.user);

    return NextResponse.json({
      success: true,
      user: {
        id: authResult.user.id,
        username: authResult.user.username,
        name: authResult.user.name,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Error interno al procesar el inicio de sesión.';

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

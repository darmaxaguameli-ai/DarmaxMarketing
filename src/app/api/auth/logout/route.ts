import { NextResponse } from 'next/server';
import { removeSessionCookie } from '@/modules/auth';

interface LogoutApiResponse {
  success: boolean;
  message: string;
}

/**
 * Endpoint para cerrar la sesión activa del administrador.
 * Elimina la cookie segura de sesión del navegador.
 *
 * @returns Respuesta JSON confirmando el cierre de sesión.
 */
export async function POST(): Promise<NextResponse<LogoutApiResponse>> {
  await removeSessionCookie();

  return NextResponse.json({
    success: true,
    message: 'Sesión finalizada correctamente.',
  });
}

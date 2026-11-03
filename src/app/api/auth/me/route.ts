import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/modules/auth';
import type { SessionUser } from '@/modules/auth';

interface MeApiResponse {
  authenticated: boolean;
  user: SessionUser | null;
}

/**
 * Consulta la sesión activa del usuario actual a partir de su cookie segura.
 *
 * @returns Datos del usuario si la sesión es válida, o authenticated: false.
 */
export async function GET(): Promise<NextResponse<MeApiResponse>> {
  const user = await getCurrentSession();

  return NextResponse.json({
    authenticated: Boolean(user),
    user,
  });
}

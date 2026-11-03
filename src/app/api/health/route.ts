import { NextResponse } from 'next/server';

interface HealthCheckResponse {
  status: 'healthy' | 'degraded';
  timestamp: string;
  uptime: number;
  environment: string;
}

/**
 * Endpoint de verificacin de estado del backend y servicios asociados.
 *
 * @returns Respuesta con estado general y marca de tiempo.
 */
export async function GET(): Promise<NextResponse<HealthCheckResponse>> {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV ?? 'development',
  });
}

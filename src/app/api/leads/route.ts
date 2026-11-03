import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface CreateLeadBody {
  fullName: string;
  email: string;
  phone?: string;
  selectedService: string;
  message: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Obtiene la lista de clientes potenciales registrados para servicios de marketing.
 *
 * @returns Lista paginada u ordenada de prospectos recientes.
 */
export async function GET(): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const leads = await prisma.contactLead.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      data: leads,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Error desconocido al consultar leads';

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

/**
 * Registra una nueva solicitud de contacto de marketing en la base de datos.
 *
 * @param request - Solicitud HTTP entrante con los datos del formulario de contacto.
 * @returns El registro creado o el mensaje de error correspondiente.
 */
export async function POST(
  request: Request
): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const rawBody = (await request.json()) as Partial<CreateLeadBody>;

    if (!rawBody.fullName || !rawBody.email || !rawBody.selectedService || !rawBody.message) {
      return NextResponse.json(
        {
          success: false,
          error: 'Los campos nombre, correo, servicio y mensaje son obligatorios.',
        },
        { status: 400 }
      );
    }

    const newLead = await prisma.contactLead.create({
      data: {
        fullName: rawBody.fullName.trim(),
        email: rawBody.email.trim().toLowerCase(),
        phone: rawBody.phone?.trim() ?? null,
        selectedService: rawBody.selectedService,
        message: rawBody.message.trim(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newLead,
      },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Error desconocido al registrar el lead';

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

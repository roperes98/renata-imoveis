import { NextRequest, NextResponse } from "next/server";
import { createRegistroImoveisAPI } from "@/app/lib/registro-imoveis";

/**
 * GET /api/registro-imoveis/cobrancas/[hash]
 * Detalha uma cobrança específica
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  try {
    const { hash } = await params;
    const api = createRegistroImoveisAPI();
    const result = await api.cobranca.detalharCobranca(hash);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro ao detalhar cobrança",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/registro-imoveis/cobrancas/[hash]
 * Cancela uma cobrança
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  try {
    const { hash } = await params;
    const api = createRegistroImoveisAPI();
    await api.cobranca.cancelarCobranca(hash);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro ao cancelar cobrança",
      },
      { status: 500 }
    );
  }
}













import { NextRequest, NextResponse } from "next/server";
import { createRegistroImoveisAPI } from "@/app/lib/registro-imoveis";
import type { GerarCobrancaRequest } from "@/app/lib/registro-imoveis/types";

/**
 * GET /api/registro-imoveis/protocolos/[hash]
 * Detalha um protocolo específico
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  try {
    const { hash } = await params;
    const api = createRegistroImoveisAPI();
    const result = await api.acompanhamento.detalharProtocolo(hash);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro ao detalhar protocolo",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/registro-imoveis/protocolos/[hash]
 * Exclui um protocolo
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  try {
    const { hash } = await params;
    const api = createRegistroImoveisAPI();
    await api.acompanhamento.excluirProtocolo(hash);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro ao excluir protocolo",
      },
      { status: 500 }
    );
  }
}










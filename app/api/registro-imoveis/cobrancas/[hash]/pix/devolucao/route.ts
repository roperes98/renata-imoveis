import { NextRequest, NextResponse } from "next/server";
import { createRegistroImoveisAPI } from "@/app/lib/registro-imoveis";
import type { DevolucaoPixRequest } from "@/app/lib/registro-imoveis/types";

/**
 * PUT /api/registro-imoveis/cobrancas/[hash]/pix/devolucao
 * Realiza devolução de valores pagos no PIX
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  try {
    const { hash } = await params;
    const body = await req.json() as DevolucaoPixRequest;
    
    const api = createRegistroImoveisAPI();
    const result = await api.cobranca.devolverPix(hash, body);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro ao realizar devolução PIX",
      },
      { status: 500 }
    );
  }
}












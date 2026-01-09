import { NextRequest, NextResponse } from "next/server";
import { createRegistroImoveisAPI } from "@/app/lib/registro-imoveis";
import type { GerarCobrancaRequest } from "@/app/lib/registro-imoveis/types";

/**
 * POST /api/registro-imoveis/protocolos/[hash]/cobranca
 * Gera uma cobrança automatizada para o protocolo
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  try {
    const { hash } = await params;
    const body = await req.json() as GerarCobrancaRequest;
    
    const api = createRegistroImoveisAPI();
    const result = await api.acompanhamento.gerarCobrancaAutomatizada(hash, body);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro ao gerar cobrança",
      },
      { status: 500 }
    );
  }
}












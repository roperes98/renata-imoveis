import { NextRequest, NextResponse } from "next/server";
import { createRegistroImoveisAPI } from "@/app/lib/registro-imoveis";
import type { GerarCobrancaRequest } from "@/app/lib/registro-imoveis/types";

/**
 * GET /api/registro-imoveis/cobrancas
 * Lista as cobranças
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pagina = searchParams.get("pagina") ? parseInt(searchParams.get("pagina")!) : undefined;
    const tamanhoPagina = searchParams.get("tamanhoPagina") ? parseInt(searchParams.get("tamanhoPagina")!) : undefined;
    const status = searchParams.get("status") ? parseInt(searchParams.get("status")!) : undefined;
    const hashProtocolo = searchParams.get("hashProtocolo") || undefined;

    const api = createRegistroImoveisAPI();
    const result = await api.cobranca.listarCobrancas({
      pagina,
      tamanhoPagina,
      status,
      hashProtocolo,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro ao listar cobranças",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/registro-imoveis/cobrancas
 * Gera uma nova cobrança
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as GerarCobrancaRequest;
    const api = createRegistroImoveisAPI();
    const result = await api.cobranca.gerarCobranca(body);

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












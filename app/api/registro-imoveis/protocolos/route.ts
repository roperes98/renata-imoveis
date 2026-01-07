import { NextRequest, NextResponse } from "next/server";
import { createRegistroImoveisAPI } from "@/app/lib/registro-imoveis";
import type { ProtocoloOnlineRequest, ProtocoloLoteRequest } from "@/app/lib/registro-imoveis/types";

/**
 * GET /api/registro-imoveis/protocolos
 * Lista os protocolos integrados
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pagina = searchParams.get("pagina") ? parseInt(searchParams.get("pagina")!) : undefined;
    const tamanhoPagina = searchParams.get("tamanhoPagina") ? parseInt(searchParams.get("tamanhoPagina")!) : undefined;
    const numeroProtocolo = searchParams.get("numeroProtocolo") || undefined;
    const tipoSolicitacao = searchParams.get("tipoSolicitacao") ? parseInt(searchParams.get("tipoSolicitacao")!) : undefined;
    const situacao = searchParams.get("situacao") ? parseInt(searchParams.get("situacao")!) : undefined;

    const api = createRegistroImoveisAPI();
    const result = await api.acompanhamento.listarProtocolos({
      pagina,
      tamanhoPagina,
      numeroProtocolo,
      tipoSolicitacao,
      situacao,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro ao listar protocolos",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/registro-imoveis/protocolos
 * Envia um protocolo online
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Verifica se é um lote ou protocolo único
    if (body.protocolos && Array.isArray(body.protocolos)) {
      // É um lote
      const api = createRegistroImoveisAPI();
      const result = await api.acompanhamento.enviarProtocoloLote(body as ProtocoloLoteRequest);
      return NextResponse.json(result);
    } else {
      // É um protocolo único
      const api = createRegistroImoveisAPI();
      const result = await api.acompanhamento.enviarProtocoloOnline(body as ProtocoloOnlineRequest);
      return NextResponse.json(result);
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro ao enviar protocolo",
      },
      { status: 500 }
    );
  }
}










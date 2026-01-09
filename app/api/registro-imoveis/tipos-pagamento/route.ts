import { NextRequest, NextResponse } from "next/server";
import { createRegistroImoveisAPI } from "@/app/lib/registro-imoveis";

/**
 * GET /api/registro-imoveis/tipos-pagamento
 * Lista os tipos de pagamento disponíveis
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pagina = searchParams.get("pagina") ? parseInt(searchParams.get("pagina")!) : undefined;
    const tamanhoPagina = searchParams.get("tamanhoPagina") ? parseInt(searchParams.get("tamanhoPagina")!) : undefined;
    const status = searchParams.get("status") ? parseInt(searchParams.get("status")!) : undefined;

    const api = createRegistroImoveisAPI();
    const result = await api.cobranca.listarTiposPagamento({
      pagina,
      tamanhoPagina,
      status,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro ao listar tipos de pagamento",
      },
      { status: 500 }
    );
  }
}












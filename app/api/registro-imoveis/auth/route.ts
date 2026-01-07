import { NextRequest, NextResponse } from "next/server";
import { createRegistroImoveisAPI } from "@/app/lib/registro-imoveis";

/**
 * POST /api/registro-imoveis/auth
 * Valida as credenciais e retorna informações sobre o token
 */
export async function POST(req: NextRequest) {
  try {
    const api = createRegistroImoveisAPI();
    // Tenta autenticar para validar as credenciais
    await api.acompanhamento.listarProtocolos({ pagina: 1, tamanhoPagina: 1 });

    return NextResponse.json({
      success: true,
      message: "Autenticação bem-sucedida",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro na autenticação",
      },
      { status: 401 }
    );
  }
}

/**
 * GET /api/registro-imoveis/auth
 * Valida o token atual
 */
export async function GET(req: NextRequest) {
  try {
    const api = createRegistroImoveisAPI();
    // Tenta fazer uma requisição simples para validar o token
    await api.acompanhamento.listarProtocolos({ pagina: 1, tamanhoPagina: 1 });

    return NextResponse.json({
      valid: true,
      message: "Token válido",
    });
  } catch (error) {
    return NextResponse.json(
      {
        valid: false,
        error: error instanceof Error ? error.message : "Token inválido",
      },
      { status: 401 }
    );
  }
}










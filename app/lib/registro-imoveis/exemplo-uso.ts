/**
 * Exemplos práticos de uso da API do Registro de Imóveis
 * 
 * Este arquivo contém exemplos de como usar a integração.
 * Não é necessário importar este arquivo em produção.
 */

import { createRegistroImoveisAPI } from "./index";
import {
  ACTipoSolicitacao,
  ACFilaSituacao,
  StatusCobranca,
} from "./types";

// ==================== EXEMPLO 1: Fluxo Completo de Protocolo ====================

export async function exemploFluxoCompletoProtocolo() {
  const api = createRegistroImoveisAPI();

  try {
    // 1. Enviar protocolo
    const protocolo = await api.acompanhamento.enviarProtocoloOnline({
      numeroProtocolo: "2025-001234",
      tipoSolicitacao: ACTipoSolicitacao.REGISTRO,
      matricula: "12345",
      cpfCnpj: "12345678900",
      nome: "João da Silva",
      observacoes: "Protocolo de registro de imóvel",
    });

    console.log("Protocolo criado:", protocolo.hash);

    // 2. Aguardar processamento e verificar status
    let tentativas = 0;
    let detalhes = await api.acompanhamento.detalharProtocolo(protocolo.hash);

    while (
      detalhes.situacao === ACFilaSituacao.PENDENTE ||
      detalhes.situacao === ACFilaSituacao.EM_PROCESSAMENTO
    ) {
      if (tentativas++ > 10) {
        throw new Error("Timeout aguardando processamento");
      }

      // Aguarda 5 segundos antes de verificar novamente
      await new Promise((resolve) => setTimeout(resolve, 5000));
      detalhes = await api.acompanhamento.detalharProtocolo(protocolo.hash);
    }

    console.log("Status final:", detalhes.descricaoStatus);

    // 3. Se necessário, gerar cobrança
    if (detalhes.situacao === ACFilaSituacao.PROCESSADO_COM_SUCESSO) {
      // Primeiro, obter tipos de pagamento
      const tiposPagamento = await api.cobranca.listarTiposPagamento({
        status: 1, // Apenas ativos
      });

      if (tiposPagamento.dados.length > 0) {
        const cobranca = await api.acompanhamento.gerarCobrancaAutomatizada(
          protocolo.hash,
          {
            valor: 10000, // R$ 100,00
            tipoPagamento: tiposPagamento.dados[0].id,
            vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0], // 30 dias a partir de hoje
            descricao: "Taxa de registro",
          }
        );

        console.log("Cobrança gerada:", cobranca.hash);
      }
    }

    return detalhes;
  } catch (error) {
    console.error("Erro no fluxo:", error);
    throw error;
  }
}

// ==================== EXEMPLO 2: Processamento em Lote ====================

export async function exemploProcessamentoLote() {
  const api = createRegistroImoveisAPI();

  try {
    // Enviar múltiplos protocolos de uma vez
    const protocolos = await api.acompanhamento.enviarProtocoloLote({
      protocolos: [
        {
          numeroProtocolo: "2025-001234",
          tipoSolicitacao: ACTipoSolicitacao.REGISTRO,
          matricula: "12345",
          cpfCnpj: "12345678900",
          nome: "João da Silva",
        },
        {
          numeroProtocolo: "2025-001235",
          tipoSolicitacao: ACTipoSolicitacao.EXAME_E_CALCULO,
          matricula: "12346",
          cpfCnpj: "98765432100",
          nome: "Maria Santos",
        },
      ],
    });

    console.log(`${protocolos.length} protocolos enviados`);

    // Monitorar status de todos
    for (const protocolo of protocolos) {
      const detalhes = await api.acompanhamento.detalharProtocolo(
        protocolo.hash
      );
      console.log(
        `Protocolo ${protocolo.numeroProtocolo}: ${detalhes.descricaoStatus}`
      );
    }

    return protocolos;
  } catch (error) {
    console.error("Erro no processamento em lote:", error);
    throw error;
  }
}

// ==================== EXEMPLO 3: Gerenciamento de Cobranças ====================

export async function exemploGerenciamentoCobrancas() {
  const api = createRegistroImoveisAPI();

  try {
    // 1. Listar todas as cobranças pendentes
    const cobrancasPendentes = await api.cobranca.listarCobrancas({
      status: StatusCobranca.AGUARDANDO_PAGAMENTO,
      pagina: 1,
      tamanhoPagina: 50,
    });

    console.log(
      `${cobrancasPendentes.totalRegistros} cobranças pendentes encontradas`
    );

    // 2. Para cada cobrança, verificar detalhes
    for (const cobranca of cobrancasPendentes.dados) {
      const detalhes = await api.cobranca.detalharCobranca(cobranca.hash);

      console.log(`Cobrança ${detalhes.hash}:`);
      console.log(`  Valor: R$ ${(detalhes.valorTotal / 100).toFixed(2)}`);
      console.log(`  Status: ${detalhes.status}`);
      console.log(`  Vencimento: ${detalhes.vencimento || "Não definido"}`);

      // Se pagamento foi confirmado, pode processar
      if (detalhes.status === StatusCobranca.PAGAMENTO_CONFIRMADO) {
        console.log(`  ✅ Pagamento confirmado em ${detalhes.dataStatus}`);
      }
    }

    return cobrancasPendentes;
  } catch (error) {
    console.error("Erro no gerenciamento de cobranças:", error);
    throw error;
  }
}

// ==================== EXEMPLO 4: Devolução PIX ====================

export async function exemploDevolucaoPix(hashCobranca: string, valorDevolver: number) {
  const api = createRegistroImoveisAPI();

  try {
    // Primeiro, verificar detalhes da cobrança
    const cobranca = await api.cobranca.detalharCobranca(hashCobranca);

    if (cobranca.status !== StatusCobranca.PAGAMENTO_CONFIRMADO) {
      throw new Error("Cobrança não está com pagamento confirmado");
    }

    // Verificar se foi pago via PIX (verificar se há pagamento vinculado)
    if (!cobranca.pagamentoVinculado) {
      throw new Error("Cobrança não possui pagamento PIX vinculado");
    }

    // Realizar devolução
    const devolucao = await api.cobranca.devolverPix(hashCobranca, {
      valor: valorDevolver, // Valor em centavos
    });

    console.log(`Devolução realizada: R$ ${(devolucao.valorTotalDevolvido / 100).toFixed(2)}`);
    console.log(`Status atualizado: ${devolucao.status}`);

    return devolucao;
  } catch (error) {
    console.error("Erro na devolução PIX:", error);
    throw error;
  }
}

// ==================== EXEMPLO 5: Busca e Filtros ====================

export async function exemploBuscaEFiltros() {
  const api = createRegistroImoveisAPI();

  try {
    // Buscar protocolos por número
    const protocolosPorNumero = await api.acompanhamento.listarProtocolos({
      numeroProtocolo: "2025-001234",
      pagina: 1,
      tamanhoPagina: 10,
    });

    console.log(
      `Encontrados ${protocolosPorNumero.totalRegistros} protocolos com o número especificado`
    );

    // Buscar protocolos processados com sucesso
    const protocolosProcessados =
      await api.acompanhamento.listarProtocolos({
        situacao: ACFilaSituacao.PROCESSADO_COM_SUCESSO,
        pagina: 1,
        tamanhoPagina: 20,
      });

    console.log(
      `${protocolosProcessados.totalRegistros} protocolos processados com sucesso`
    );

    // Buscar cobranças de um protocolo específico
    const cobrancasProtocolo = await api.cobranca.listarCobrancas({
      hashProtocolo: "hash-do-protocolo",
      pagina: 1,
      tamanhoPagina: 10,
    });

    console.log(
      `${cobrancasProtocolo.totalRegistros} cobranças encontradas para o protocolo`
    );

    return {
      protocolosPorNumero,
      protocolosProcessados,
      cobrancasProtocolo,
    };
  } catch (error) {
    console.error("Erro na busca:", error);
    throw error;
  }
}










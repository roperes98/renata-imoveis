"use server";

interface RgiResult {
  success: boolean;
  data?: {
    talao: string;
    presenter: string;
    status: string;
  };
  error?: string;
}

export async function checkRgiStatus(talao: string): Promise<RgiResult> {
  if (!talao) {
    return { success: false, error: "Número do talão é obrigatório." };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("tipo", "registro");
    formData.append("txtregistro", talao);

    const response = await fetch("http://www.10ri-rj.com.br/Consultas.asp", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      body: formData.toString(),
      cache: "no-store", // Ensure we don't cache the result
    });

    if (!response.ok) {
      return { success: false, error: "Falha na comunicação com o servidor do cartório." };
    }

    // The response is ISO-8859-1 (Latin1) usually, but doing text() handles basic stuff.
    // For proper encoding if issues arise, we might need arrayBuffer() + textdecoder.
    const buffer = await response.arrayBuffer();
    const decoder = new TextDecoder("iso-8859-1");
    const html = decoder.decode(buffer);

    // Simple regex/string parsing to avoid heavy dependencies
    // Input fields in the HTML look like: <input ... name="posicao" value="Exigência" ... >

    const posicaoMatch = html.match(/name="posicao"[^>]*value="([^"]*)"/i);
    const apresentanteMatch = html.match(/name="apresentante"[^>]*value="([^"]*)"/i);

    const status = posicaoMatch ? posicaoMatch[1] : null;
    const presenter = apresentanteMatch ? apresentanteMatch[1] : null;

    if (!status) {
      // If we confirm it returns a page saying "not found" or similar, handle it. 
      // Often blank value means just blank, but let's assume if we can't find the input, something changed or invalid ID.
      return { success: false, error: "Registro não encontrado ou site offline." };
    }

    return {
      success: true,
      data: {
        talao,
        status: status.trim() || "Status não informado",
        presenter: presenter?.trim() || "Desconhecido",
      }
    };

  } catch (error) {
    console.error("Error checking RGI:", error);
    return { success: false, error: "Erro interno ao consultar RGI." };
  }
}

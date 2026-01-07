# Integração com a API do Registro de Imóveis do Brasil

Esta integração permite conectar o sistema à API do Registro de Imóveis do Brasil para gerenciar protocolos e cobranças.

## Como Obter as Credenciais (client_id e client_secret)

O PDF da documentação descreve como **usar** a autenticação, mas não detalha como obter as credenciais. Para obter o `client_id` e `client_secret`, você precisa:

1. **Contatar o Registro de Imóveis do Brasil** através de:
   - Site: https://www.registrodeimoveis.org.br
   - Portal de integração ou área de desenvolvedores
   - Suporte técnico da CORI-BR (Equipe Técnica CORI-BR)

2. **Processo típico de cadastro:**
   - Cadastrar sua empresa/sistema no portal
   - Solicitar acesso à API (produção ou homologação)
   - Receber as credenciais (`client_id` e `client_secret`)
   - Para ambiente de homologação, use: `https://testes-api.registrodeimoveis.org.br`

3. **Informações que podem ser solicitadas:**
   - Dados do cartório
   - CNPJ
   - Contato técnico
   - Descrição do sistema que fará a integração

**Nota:** O token JWT (`access_token`) é gerado automaticamente pela API usando as credenciais. Você não precisa obtê-lo manualmente - o cliente faz isso automaticamente.

## Configuração

### Variáveis de Ambiente

Adicione as seguintes variáveis ao arquivo `.env.local`:

```env
# Credenciais obrigatórias
REGISTRO_IMOVEIS_CLIENT_ID=seu_client_id
REGISTRO_IMOVEIS_CLIENT_SECRET=seu_client_secret

# Opcional: URL base (padrão: produção)
REGISTRO_IMOVEIS_BASE_URL=https://api.registrodeimoveis.org.br
# Para homologação:
# REGISTRO_IMOVEIS_BASE_URL=https://testes-api.registrodeimoveis.org.br

# Opcional: Tipo de autenticação (padrão: client_credentials)
REGISTRO_IMOVEIS_GRANT_TYPE=client_credentials
# Ou para autenticação com usuário/senha:
# REGISTRO_IMOVEIS_GRANT_TYPE=password
# REGISTRO_IMOVEIS_USERNAME=seu_usuario
# REGISTRO_IMOVEIS_PASSWORD=sua_senha
```

## Uso

### Importação

```typescript
import { createRegistroImoveisAPI } from "@/app/lib/registro-imoveis";
```

### Exemplos de Uso

#### 1. Enviar Protocolo Online

```typescript
const api = createRegistroImoveisAPI();

const protocolo = await api.acompanhamento.enviarProtocoloOnline({
  numeroProtocolo: "12345",
  tipoSolicitacao: ACTipoSolicitacao.REGISTRO,
  matricula: "123456",
  cpfCnpj: "12345678900",
  nome: "João Silva",
  observacoes: "Observações opcionais"
});
```

#### 2. Enviar Protocolo em Lote

```typescript
const api = createRegistroImoveisAPI();

const protocolos = await api.acompanhamento.enviarProtocoloLote({
  protocolos: [
    {
      numeroProtocolo: "12345",
      tipoSolicitacao: ACTipoSolicitacao.REGISTRO,
      matricula: "123456"
    },
    {
      numeroProtocolo: "12346",
      tipoSolicitacao: ACTipoSolicitacao.EXAME_E_CALCULO,
      matricula: "123457"
    }
  ]
});
```

#### 3. Listar Protocolos

```typescript
const api = createRegistroImoveisAPI();

const resultado = await api.acompanhamento.listarProtocolos({
  pagina: 1,
  tamanhoPagina: 10,
  numeroProtocolo: "12345",
  tipoSolicitacao: ACTipoSolicitacao.REGISTRO,
  situacao: ACFilaSituacao.PROCESSADO_COM_SUCESSO
});
```

#### 4. Detalhar Protocolo

```typescript
const api = createRegistroImoveisAPI();

const detalhes = await api.acompanhamento.detalharProtocolo("hash-do-protocolo");
```

#### 5. Gerar Cobrança

```typescript
const api = createRegistroImoveisAPI();

// Primeiro, obtenha os tipos de pagamento disponíveis
const tiposPagamento = await api.cobranca.listarTiposPagamento();

// Gere a cobrança
const cobranca = await api.cobranca.gerarCobranca({
  valor: 10000, // R$ 100,00 em centavos
  tipoPagamento: tiposPagamento.dados[0].id,
  vencimento: "2025-12-31",
  descricao: "Taxa de registro"
});
```

#### 6. Gerar Cobrança Automatizada para Protocolo

```typescript
const api = createRegistroImoveisAPI();

const cobranca = await api.acompanhamento.gerarCobrancaAutomatizada(
  "hash-do-protocolo",
  {
    valor: 10000,
    tipoPagamento: 1,
    vencimento: "2025-12-31"
  }
);
```

#### 7. Listar Cobranças

```typescript
const api = createRegistroImoveisAPI();

const cobrancas = await api.cobranca.listarCobrancas({
  pagina: 1,
  tamanhoPagina: 10,
  status: StatusCobranca.AGUARDANDO_PAGAMENTO
});
```

#### 8. Devolver Valor PIX

```typescript
const api = createRegistroImoveisAPI();

const devolucao = await api.cobranca.devolverPix(
  "hash-da-cobranca",
  {
    valor: 5000 // R$ 50,00 em centavos
  }
);
```

## Rotas de API

O sistema também expõe rotas de API Next.js que podem ser chamadas do frontend:

### Autenticação
- `GET /api/registro-imoveis/auth` - Valida token
- `POST /api/registro-imoveis/auth` - Testa autenticação

### Protocolos
- `GET /api/registro-imoveis/protocolos` - Lista protocolos
- `POST /api/registro-imoveis/protocolos` - Envia protocolo (único ou lote)
- `GET /api/registro-imoveis/protocolos/[hash]` - Detalha protocolo
- `DELETE /api/registro-imoveis/protocolos/[hash]` - Exclui protocolo
- `POST /api/registro-imoveis/protocolos/[hash]/cobranca` - Gera cobrança automatizada

### Cobranças
- `GET /api/registro-imoveis/cobrancas` - Lista cobranças
- `POST /api/registro-imoveis/cobrancas` - Gera cobrança
- `GET /api/registro-imoveis/cobrancas/[hash]` - Detalha cobrança
- `PATCH /api/registro-imoveis/cobrancas/[hash]` - Cancela cobrança
- `PUT /api/registro-imoveis/cobrancas/[hash]/pix/devolucao` - Devolve PIX

### Tipos de Pagamento
- `GET /api/registro-imoveis/tipos-pagamento` - Lista tipos de pagamento

## Enums e Constantes

O módulo exporta vários enums úteis:

- `StatusCobranca` - Status das cobranças
- `ACTipoSolicitacao` - Tipos de solicitação
- `ACCodigoStatus` - Códigos de status do protocolo
- `ACFilaSituacao` - Situação na fila de processamento
- `StatusTipoPagamento` - Status dos tipos de pagamento

## Tratamento de Erros

Todas as funções podem lançar erros. Sempre use try/catch:

```typescript
try {
  const protocolo = await api.acompanhamento.enviarProtocoloOnline(data);
} catch (error) {
  console.error("Erro:", error instanceof Error ? error.message : "Erro desconhecido");
}
```

## Documentação Completa

Para mais detalhes sobre a API, consulte:
- **Swagger (Documentação Interativa):** https://www.registrodeimoveis.org.br/swagger/index.html
- **Manual de Integração:** registradores_api.pdf (v1.4 - 29/01/2025)
- **Site Oficial:** https://www.registrodeimoveis.org.br

### Endereços da API

- **Produção:** https://api.registrodeimoveis.org.br
- **Homologação:** https://testes-api.registrodeimoveis.org.br

### Suporte

Para obter credenciais ou suporte técnico, entre em contato com:
- **Equipe Técnica CORI-BR** (mencionada no manual)
- Portal do Registro de Imóveis do Brasil


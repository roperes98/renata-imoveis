# Como Obter as Credenciais da API

## Resumo

O PDF da documentação (`registradores_api.pdf`) **não especifica** como obter o `client_id` e `client_secret`. Essas credenciais são fornecidas pelo próprio **Registro de Imóveis do Brasil** através de um processo de cadastro.

## Processo para Obter as Credenciais

### 1. Contato Inicial

Entre em contato com o **Registro de Imóveis do Brasil** através de:

- **Site oficial:** https://www.registrodeimoveis.org.br
- **Swagger (pode ter informações de contato):** https://www.registrodeimoveis.org.br/swagger/index.html
- **Equipe Técnica CORI-BR** (mencionada no manual como responsável pela documentação)

### 2. Informações que Você Provavelmente Precisa Fornecer

Ao solicitar as credenciais, esteja preparado para fornecer:

- **Dados do Cartório:**
  - Nome do cartório
  - CNPJ
  - Endereço completo
  - Contato responsável

- **Dados do Sistema:**
  - Nome do sistema/software
  - Descrição da integração
  - Ambiente desejado (homologação ou produção)
  - Contato técnico (nome, email, telefone)

- **Documentação:**
  - Pode ser necessário enviar documentação do cartório
  - Termos de uso ou contrato de integração

### 3. Ambientes Disponíveis

Você pode solicitar credenciais para:

- **Homologação/Testes:**
  - URL: `https://testes-api.registrodeimoveis.org.br`
  - Use para testar a integração antes de ir para produção

- **Produção:**
  - URL: `https://api.registrodeimoveis.org.br`
  - Use apenas após testar completamente em homologação

### 4. Tipos de Autenticação

A API suporta dois tipos de autenticação:

#### a) `client_credentials` (Recomendado)
- Usa apenas `client_id` e `client_secret`
- Mais seguro para integrações automatizadas
- Não requer usuário/senha

#### b) `password`
- Usa `client_id`, `client_secret`, `username` e `password`
- Útil quando há necessidade de autenticação por usuário

**Recomendação:** Use `client_credentials` para integrações de sistema.

### 5. Após Receber as Credenciais

Configure no arquivo `.env.local`:

```env
# Credenciais recebidas
REGISTRO_IMOVEIS_CLIENT_ID=seu_client_id_aqui
REGISTRO_IMOVEIS_CLIENT_SECRET=seu_client_secret_aqui

# Ambiente (homologação ou produção)
REGISTRO_IMOVEIS_BASE_URL=https://testes-api.registrodeimoveis.org.br
# ou
# REGISTRO_IMOVEIS_BASE_URL=https://api.registrodeimoveis.org.br
```

### 6. Testando as Credenciais

Após configurar, teste a autenticação:

```typescript
import { createRegistroImoveisAPI } from "@/app/lib/registro-imoveis";

try {
  const api = createRegistroImoveisAPI();
  // Tenta listar protocolos (vai autenticar automaticamente)
  const result = await api.acompanhamento.listarProtocolos({ pagina: 1, tamanhoPagina: 1 });
  console.log("✅ Credenciais válidas!");
} catch (error) {
  console.error("❌ Erro na autenticação:", error);
}
```

Ou via API route:

```bash
curl http://localhost:3000/api/registro-imoveis/auth
```

## Importante

- ⚠️ **Nunca compartilhe** suas credenciais publicamente
- ⚠️ **Não commite** o arquivo `.env.local` no Git
- ⚠️ **Use credenciais diferentes** para homologação e produção
- ⚠️ **Mantenha as credenciais seguras** - elas dão acesso completo à API

## O Token JWT

O **token JWT** (`access_token`) é gerado **automaticamente** pela API quando você faz a autenticação. Você **não precisa** obtê-lo manualmente - o cliente da integração faz isso automaticamente e renova quando necessário.

## Dúvidas?

Se tiver dúvidas sobre:
- Como obter as credenciais
- Processo de cadastro
- Problemas na autenticação
- Configuração do ambiente

Entre em contato diretamente com o **Registro de Imóveis do Brasil** através do site oficial ou da equipe técnica mencionada no manual.













# Configuração do Supabase

Este projeto está configurado para se conectar ao Supabase hospedado em `https://supabase.360renataimoveis.com`.

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=https://supabase.360renataimoveis.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

## Obtendo a Chave Anon

1. Acesse o painel do Supabase em `https://supabase.360renataimoveis.com`
2. Vá em Settings > API
3. Copie a chave "anon public" e cole no arquivo `.env.local`

## Estrutura do Banco de Dados

O projeto está configurado para trabalhar com as seguintes tabelas principais:

- `real_estate` - Imóveis
- `condominiums` - Condomínios
- `condominium_addresses` - Endereços de condomínios
- `clients` - Clientes
- `agents` - Agentes
- `real_estate_agents` - Relação entre imóveis e agentes
- `real_estate_offers` - Ofertas
- `real_estate_visits` - Visitas

## Uso

As páginas do site agora buscam dados diretamente do Supabase:

- **Página Inicial** (`/`) - Mostra imóveis em destaque
- **Página de Imóveis** (`/imoveis`) - Lista todos os imóveis com filtros
- As funções de busca estão em `app/lib/supabase/properties.ts`

## Recursos do Next.js 16 Utilizados

- **Server Components** - Busca de dados no servidor
- **Client Components** - Apenas onde necessário (filtros interativos)
- **TypeScript** - Tipos baseados no schema do Supabase
- **Metadata API** - SEO otimizado


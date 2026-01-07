# Logos para Marca D'água

Para que a funcionalidade de marca d'água funcione corretamente, você precisa criar os seguintes arquivos na pasta `public/images/`:

## Arquivos necessários:

1. **logo-watermark-light.png** - Logo branco para usar em imagens escuras
2. **logo-watermark-dark.png** - Logo escuro para usar em imagens claras
3. **logo-watermark.svg** (opcional) - Versão SVG do logo como fallback

## Como criar os logos:

### Opção 1: Converter o SVG do Logo para PNG

1. Use o componente `Logo.tsx` como referência
2. Exporte o SVG do logo
3. Converta para PNG usando ferramentas como:
   - [CloudConvert](https://cloudconvert.com/svg-to-png)
   - [Inkscape](https://inkscape.org/)
   - Adobe Illustrator
   - Figma

### Opção 2: Usar ferramentas online

1. Acesse um conversor SVG para PNG
2. Use o código do componente `app/components/Logo.tsx`
3. Para logo branco: use cores claras (#FFFFFF ou similar)
4. Para logo escuro: use cores escuras (#000000 ou similar)
5. Exporte em alta resolução (pelo menos 800x800px)

### Especificações recomendadas:

- **Formato**: PNG com transparência
- **Tamanho**: Mínimo 400x400px, recomendado 800x800px
- **Background**: Transparente
- **Logo Light**: Cores claras (branco/bege claro) para usar em imagens escuras
- **Logo Dark**: Cores escuras (preto/marrom escuro) para usar em imagens claras

## Nota

Se os arquivos não existirem, o sistema usará um logo SVG simples como fallback, mas é recomendado criar os arquivos PNG para melhor qualidade.


"use server";

import sharp from "sharp";
import { readFile } from "fs/promises";
import { join } from "path";

export interface WatermarkConfig {
  source: "none" | "logo_light" | "logo_dark";
  position: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
  opacity: string; // "0" a "100"
}

/**
 * Aplica marca d'água em uma imagem usando sharp
 * @param imageBuffer - Buffer da imagem original
 * @param config - Configurações da marca d'água
 * @returns Buffer da imagem com marca d'água aplicada
 */
export async function applyWatermark(
  imageBuffer: Buffer,
  config: WatermarkConfig
): Promise<Buffer> {
  // Se não há marca d'água, retorna a imagem original
  if (config.source === "none") {
    return imageBuffer;
  }

  try {
    // Carrega a imagem base
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    const { width = 0, height = 0 } = metadata;

    // Determina qual logo usar
    // Tenta carregar PNG primeiro, depois SVG, depois fallback
    let watermarkBuffer: Buffer;
    const logoPngPath = config.source === "logo_light"
      ? join(process.cwd(), "public", "images", "logo-watermark-light.png")
      : join(process.cwd(), "public", "images", "logo-watermark-dark.png");
    const logoSvgPath = join(process.cwd(), "public", "images", "logo-watermark.svg");

    try {
      // Tenta carregar PNG primeiro
      watermarkBuffer = await readFile(logoPngPath);
    } catch {
      try {
        // Se PNG não existir, tenta SVG
        watermarkBuffer = await readFile(logoSvgPath);
      } catch {
        // Se nenhum existir, cria um logo SVG simples como fallback
        watermarkBuffer = await createFallbackLogo(config.source === "logo_light");
      }
    }

    // Redimensiona o logo para ~20% da largura da imagem (máximo 400px)
    const watermarkSize = Math.min(Math.floor(width * 0.2), 400);
    const watermark = await sharp(watermarkBuffer)
      .resize(watermarkSize, watermarkSize, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .toBuffer();

    const watermarkMetadata = await sharp(watermark).metadata();
    const watermarkWidth = watermarkMetadata.width || 0;
    const watermarkHeight = watermarkMetadata.height || 0;

    // Calcula a posição da marca d'água
    const position = calculatePosition(
      width,
      height,
      watermarkWidth,
      watermarkHeight,
      config.position
    );

    // Converte opacidade de string (0-100) para número (0-1)
    const opacity = parseInt(config.opacity || "50", 10) / 100;

    // Aplica opacidade ao watermark ajustando o canal alpha
    // Primeiro, garante que o watermark tem canal alpha
    const watermarkWithAlpha = await sharp(watermark)
      .ensureAlpha()
      .toBuffer();

    // Obtém os dados da imagem em formato raw para ajustar o alpha
    const watermarkData = await sharp(watermarkWithAlpha)
      .raw()
      .toBuffer();

    // Ajusta o canal alpha de cada pixel
    const adjustedData = Buffer.from(watermarkData);
    for (let i = 3; i < adjustedData.length; i += 4) {
      adjustedData[i] = Math.floor(adjustedData[i] * opacity);
    }

    const watermarkWithOpacity = await sharp(adjustedData, {
      raw: {
        width: watermarkWidth,
        height: watermarkHeight,
        channels: 4,
      },
    })
      .png()
      .toBuffer();

    // Aplica a marca d'água na imagem
    const watermarkedImage = await image
      .composite([
        {
          input: watermarkWithOpacity,
          left: position.x,
          top: position.y,
          blend: "over",
        },
      ])
      .toBuffer();

    return watermarkedImage;
  } catch (error) {
    console.error("Error applying watermark:", error);
    // Em caso de erro, retorna a imagem original
    return imageBuffer;
  }
}

/**
 * Calcula a posição da marca d'água baseada na configuração
 */
function calculatePosition(
  imageWidth: number,
  imageHeight: number,
  watermarkWidth: number,
  watermarkHeight: number,
  position: WatermarkConfig["position"]
): { x: number; y: number } {
  const padding = 20; // Padding de 20px das bordas

  switch (position) {
    case "top-left":
      return { x: padding, y: padding };
    case "top-right":
      return { x: imageWidth - watermarkWidth - padding, y: padding };
    case "bottom-left":
      return { x: padding, y: imageHeight - watermarkHeight - padding };
    case "bottom-right":
      return {
        x: imageWidth - watermarkWidth - padding,
        y: imageHeight - watermarkHeight - padding,
      };
    case "center":
    default:
      return {
        x: Math.floor((imageWidth - watermarkWidth) / 2),
        y: Math.floor((imageHeight - watermarkHeight) / 2),
      };
  }
}

/**
 * Cria um logo SVG baseado no componente Logo.tsx como fallback
 */
async function createFallbackLogo(isLight: boolean): Promise<Buffer> {
  const colors = isLight
    ? { light: "#FFFFFF", mid: "#F5F5F5", dark: "#E0E0E0" }
    : { light: "#7C1630", mid: "#7C1630", dark: "#4B0B1B" };

  const svg = `
    <svg width="854" height="565" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 854 565">
      <defs>
        <linearGradient id="g0" x1="0" y1="0" x2="1" y2="1">
          <stop stop-color="${colors.light}"/>
          <stop offset="0.6" stop-color="${colors.mid}"/>
          <stop offset="0.92" stop-color="${colors.dark}"/>
        </linearGradient>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop stop-color="${colors.light}"/>
          <stop offset="0.6" stop-color="${colors.mid}"/>
          <stop offset="0.92" stop-color="${colors.dark}"/>
        </linearGradient>
        <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
          <stop stop-color="${colors.light}"/>
          <stop offset="0.6" stop-color="${colors.mid}"/>
          <stop offset="0.92" stop-color="${colors.dark}"/>
        </linearGradient>
        <linearGradient id="g3" x1="0" y1="0" x2="1" y2="1">
          <stop stop-color="${colors.light}"/>
          <stop offset="0.6" stop-color="${colors.mid}"/>
          <stop offset="0.92" stop-color="${colors.dark}"/>
        </linearGradient>
        <clipPath id="clip0">
          <rect width="854" height="565" fill="white"/>
        </clipPath>
      </defs>
      <g clip-path="url(#clip0)">
        <path d="M599.203 117.475H700.169V365.215L599.203 231.657V117.475Z" fill="url(#g0)"/>
        <path d="M112.266 417L426.581 0L528.387 134.257L317.001 417H112.266Z" fill="url(#g1)"/>
        <path d="M114.007 414.66H539.501L653.386 564.301L0 565L114.007 414.66Z" fill="url(#g2)"/>
        <path d="M426 269L527.667 133.344L853.018 564.301H650.386L538.193 416.651L426 269Z" fill="url(#g3)"/>
      </g>
    </svg>
  `;
  return Buffer.from(svg);
}


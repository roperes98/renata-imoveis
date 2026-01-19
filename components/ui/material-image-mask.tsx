"use client";

import Image, { ImageProps } from "next/image";
import { CSSProperties, useId } from "react";

export type MaterialShape =
  | "none"
  | "extra-small"
  | "small"
  | "medium"
  | "large"
  | "extra-large"
  | "extra-extra-large"
  | "large-increased"
  | "extra-large-increased"
  | "full"
  | "circle"
  | "square"
  | "slanted"
  | "arch"
  | "fan"
  | "arrow"
  | "semicircle"
  | "oval"
  | "pill"
  | "triangle"
  | "diamond"
  | "hexagon"
  | "pentagon"
  | "gem"
  | "very-sunny"
  | "sunny"
  | "4-sided-cookie"
  | "6-sided-cookie"
  | "7-sided-cookie"
  | "9-sided-cookie"
  | "12-sided-cookie"
  | "ghost-ish"
  | "4-leaf-clover"
  | "8-leaf-clover"
  | "burst"
  | "soft-burst"
  | "boom"
  | "soft-boom"
  | "flower"
  | "puffy"
  | "puffy-diamond"
  | "pixel-circle"
  | "pixel-triangle"
  | "bun"
  | "heart"
  | "fgts-mask";

interface MaterialImageMaskProps extends Omit<ImageProps, "style"> {
  shape?: MaterialShape;
  className?: string;
  style?: CSSProperties;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
}

// Corner radius values from Material Design 3
const cornerRadiusMap: Record<string, string> = {
  none: "0px",
  "extra-small": "4px",
  small: "8px",
  medium: "12px",
  large: "16px",
  "extra-large": "20px",
  "extra-extra-large": "28px",
  "large-increased": "32px",
  "extra-large-increased": "48px",
  full: "50%",
};

interface ShapeDef {
  path: string;
  width: number;
  height: number;
}

// SVG path definitions extracted from the official Material Design 3 shape assets
const svgShapes: Record<string, ShapeDef> = {
  "4-sided-cookie": {
    path: "M186.389 6.47298C249.109 -20.7672 312.767 42.8908 285.527 105.611L281.023 115.981C272.707 135.13 272.707 156.87 281.023 176.019L285.527 186.389C312.767 249.109 249.109 312.767 186.389 285.527L176.019 281.023C156.87 272.707 135.13 272.707 115.981 281.023L105.611 285.527C42.8908 312.767 -20.7672 249.109 6.47299 186.389L10.9768 176.019C19.2934 156.87 19.2934 135.13 10.9768 115.981L6.47298 105.611C-20.7672 42.8908 42.8908 -20.7672 105.611 6.47299L115.981 10.9768C135.13 19.2934 156.87 19.2934 176.019 10.9768L186.389 6.47298Z",
    width: 292,
    height: 292
  },
  "arch": {
    path: "M310 258.727C310 264.96 310 268.076 309.689 270.696C307.259 291.14 291.14 307.259 270.696 309.689C268.076 310 264.96 310 258.727 310H51.2732C45.0405 310 41.9242 310 39.3043 309.689C18.8596 307.259 2.74071 291.14 0.311326 270.696C9.86457e-06 268.076 9.61297e-06 264.96 9.06809e-06 258.727L0 155C-7.48375e-06 69.3959 69.3958 7.48375e-06 155 0C240.604 -7.48375e-06 310 69.3958 310 155V258.727Z",
    width: 310,
    height: 310
  },
  "slanted": {
    path: "M15.7147 80.543C18.289 55.9642 19.5761 43.6748 24.3025 33.9777C31.142 19.9453 43.0768 9.11012 57.6278 3.72286C67.6833 0 79.9328 0 104.432 0H228.137C257.764 0 272.578 0 283.887 4.85392C300.261 11.8819 312.72 25.8495 317.927 43.0153C321.523 54.8709 319.967 69.733 316.854 99.457L304.285 219.457C301.711 244.036 300.424 256.325 295.697 266.022C288.858 280.055 276.923 290.89 262.372 296.277C252.317 300 240.067 300 215.568 300H91.8634C62.2359 300 47.4221 300 36.1134 295.146C19.7395 288.118 7.2802 274.151 2.07293 256.985C-1.5235 245.129 0.0330968 230.267 3.14629 200.543L15.7147 80.543Z",
    width: 320,
    height: 300
  },
  "ghost-ish": {
    path: "M0 142.857C0 63.9593 67.1573 0 150 0C232.843 0 300 63.9593 300 142.857L300 242.857C300 274.416 273.137 300 240 300C230.178 300 220.907 297.752 212.724 293.768C208.554 291.737 204.394 289.512 200.216 287.277C185.513 279.411 170.592 271.429 154.27 271.429H145.73C129.408 271.429 114.487 279.411 99.7841 287.277C95.6062 289.512 91.4459 291.737 87.276 293.768C79.0926 297.752 69.8219 300 60 300C26.8629 300 0 274.416 0 242.857L0 142.857Z",
    width: 300,
    height: 300
  },
  "bun": {
    path: "M0 79.3221C0 35.5137 35.5137 0 79.3221 0H222.928C266.736 0 302.25 35.5137 302.25 79.3221C302.25 115.45 278.097 145.937 245.057 155.516C244.842 155.579 244.692 155.776 244.692 156C244.692 156.224 244.842 156.421 245.057 156.484C278.097 166.063 302.25 196.55 302.25 232.678C302.25 276.486 266.736 312 222.928 312H79.3221C35.5137 312 0 276.486 0 232.678C0 196.785 23.8388 166.461 56.547 156.674C56.845 156.585 57.0514 156.311 57.0514 156C57.0514 155.689 56.845 155.415 56.547 155.326C23.8388 145.539 0 115.214 0 79.3221Z",
    width: 303,
    height: 312
  },
  "flower": {
    path: "M273.125 46.8625C261.251 34.988 234.194 40.8597 201.547 59.6813C191.771 23.2855 176.79 3.09109e-05 159.996 2.79747e-05C143.203 2.50385e-05 128.223 23.2841 118.447 59.6779C85.8015 40.8581 58.7462 34.9874 46.8722 46.8614C34.9969 58.7367 40.8701 85.7963 59.6944 118.446C23.2911 128.222 -2.50387e-05 143.204 -2.79753e-05 160C-3.09114e-05 176.793 23.2829 191.773 59.6752 201.549C40.8495 234.2 34.9756 261.261 46.8512 273.137C58.7274 285.013 85.7903 279.138 118.444 260.31C128.22 296.711 143.201 320 159.996 320C176.792 320 191.774 296.709 201.55 260.307C234.205 279.136 261.27 285.012 273.146 273.136C285.022 261.26 279.148 234.2 260.323 201.549C296.716 191.773 320 176.793 320 160C320 143.204 296.708 128.222 260.304 118.446C279.128 85.7966 285.001 58.7376 273.125 46.8625Z",
    width: 320,
    height: 320
  },
  "fgts-mask": {
    path: "M100 0 L100 100 L15 100 Q0 100 4 85 L16 15 Q20 0 35 0 Z",
    width: 100,
    height: 100
  },
  "soft-burst": {
    path: "M145.147 8.15077C151.983 -2.71691 168.017 -2.71693 174.853 8.15075L191.238 34.2009C195.731 41.3458 204.797 44.2506 212.692 41.0751L241.475 29.4972C253.482 24.6671 266.455 33.9613 265.507 46.7154L263.235 77.2876C262.612 85.6727 268.215 93.2776 276.494 95.2843L306.681 102.601C319.275 105.653 324.23 120.692 315.861 130.461L295.8 153.877C290.298 160.3 290.298 169.7 295.8 176.123L315.861 199.539C324.23 209.308 319.275 224.347 306.681 227.399L276.494 234.716C268.215 236.722 262.612 244.327 263.235 252.712L265.507 283.285C266.455 296.039 253.482 305.333 241.475 300.503L212.692 288.925C204.797 285.749 195.731 288.654 191.238 295.799L174.853 321.849C168.017 332.717 151.983 332.717 145.147 321.849L128.762 295.799C124.269 288.654 115.203 285.749 107.308 288.925L78.5255 300.503C66.5177 305.333 53.5454 296.039 54.4931 283.285L56.7649 252.712C57.388 244.327 51.785 236.722 43.5056 234.716L13.3186 227.399C0.725189 224.347 -4.22982 209.308 4.1391 199.539L24.1997 176.123C29.7018 169.7 29.7018 160.3 24.1997 153.877L4.13911 130.461C-4.22981 120.692 0.725169 105.653 13.3186 102.601L43.5056 95.2843C51.785 93.2776 57.388 85.6727 56.7649 77.2876L54.4931 46.7154C53.5454 33.9613 66.5177 24.6671 78.5254 29.4972L107.308 41.0751C115.203 44.2506 124.269 41.3458 128.762 34.201L145.147 8.15077Z",
    width: 320,
    height: 330
  }
};

// Simple relative paths for basic shapes (keeping these as they are reliable)
const simpleResultPaths: Record<string, string> = {
  "circle": "M0.5,0 A0.5,0.5 0 1,1 0.5,1 A0.5,0.5 0 1,1 0.5,0 Z",
  "oval": "M0.5,0 A0.5,0.5 0 1,1 0.5,1 A0.5,0.5 0 1,1 0.5,0 Z",
  "pill": "M0.5,0 A0.5,0.5 0 1,1 0.5,1 A0.5,0.5 0 1,1 0.5,0 Z",
  "square": "M0,0 H1 V1 H0 Z",
  "triangle": "M0.5,0 L1,1 H0 Z",
  "diamond": "M0.5,0 L1,0.5 L0.5,1 L0,0.5 Z",
};

// Fallback to polygon for shapes not yet smoothed or implemented
const polygonMap: Record<string, string> = {
  "fan": "polygon(50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%)",
  "arrow": "polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)",
  "semicircle": "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
  "hexagon": "polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)",
  "pentagon": "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
  "gem": "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
  "very-sunny": "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
  "sunny": "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
  "6-sided-cookie": "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
  "7-sided-cookie": "polygon(50% 0%, 90% 20%, 100% 60%, 75% 100%, 25% 100%, 0% 60%, 10% 20%)",
  "9-sided-cookie": "polygon(50% 0%, 83% 12%, 100% 43%, 94% 78%, 68% 100%, 32% 100%, 6% 78%, 0% 43%, 17% 12%)",
  "12-sided-cookie": "polygon(50% 0%, 93% 25%, 100% 50%, 93% 75%, 50% 100%, 7% 75%, 0% 50%, 7% 25%)",
  "4-leaf-clover": "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%, 50% 30%, 70% 50%, 50% 70%, 30% 50%)",
  "8-leaf-clover": "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%, 50% 20%, 80% 50%, 50% 80%, 20% 50%)",
  "burst": "polygon(50% 0%, 80% 10%, 100% 35%, 90% 60%, 100% 100%, 60% 90%, 35% 100%, 10% 80%, 0% 50%, 10% 20%, 35% 0%, 60% 10%)",

  "boom": "polygon(50% 0%, 85% 5%, 100% 30%, 95% 55%, 100% 100%, 55% 95%, 30% 100%, 5% 85%, 0% 50%, 5% 15%, 30% 0%, 55% 5%)",
  "soft-boom": "polygon(50% 0%, 80% 10%, 100% 35%, 90% 60%, 100% 100%, 60% 90%, 35% 100%, 10% 80%, 0% 50%, 10% 20%, 35% 0%, 60% 10%)",
  "puffy": "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)",
  "puffy-diamond": "polygon(50% 0%, 100% 30%, 100% 70%, 50% 100%, 0% 70%, 0% 30%)",
  "pixel-circle": "polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)",
  "pixel-triangle": "polygon(50% 0%, 100% 100%, 0% 100%)",
};

export function MaterialImageMask({
  shape = "medium",
  className = "",
  style,
  objectFit = "cover",
  ...imageProps
}: MaterialImageMaskProps) {
  const maskId = useId();
  const uniqueMaskId = `mask-${maskId.replace(/:/g, "")}`;

  const getStyle = (): CSSProperties => {
    const baseStyle: CSSProperties = {
      ...style,
    };

    // 1. Handle simple border-radius shapes
    if (cornerRadiusMap[shape]) {
      baseStyle.borderRadius = cornerRadiusMap[shape];
      baseStyle.overflow = "hidden";
      return baseStyle;
    }

    // 2. Handle SVG path shapes (both complex scaling and simple relative)
    if (svgShapes[shape] || simpleResultPaths[shape]) {
      baseStyle.clipPath = `url(#${uniqueMaskId})`;
      baseStyle.WebkitClipPath = `url(#${uniqueMaskId})`;
      return baseStyle;
    }

    // 3. Handle polygon shapes
    if (polygonMap[shape]) {
      baseStyle.clipPath = polygonMap[shape];
      baseStyle.WebkitClipPath = polygonMap[shape];
      baseStyle.overflow = "hidden";
      return baseStyle;
    }

    // Default
    baseStyle.borderRadius = cornerRadiusMap.medium;
    baseStyle.overflow = "hidden";
    return baseStyle;
  };

  const hasFill = "fill" in imageProps && imageProps.fill;
  const imageStyle = hasFill
    ? { objectFit }
    : { width: "100%", height: "100%", objectFit };

  const renderClipPath = () => {
    if (simpleResultPaths[shape]) {
      return (
        <clipPath id={uniqueMaskId} clipPathUnits="objectBoundingBox">
          <path d={simpleResultPaths[shape]} />
        </clipPath>
      );
    }

    if (svgShapes[shape]) {
      const { path, width, height } = svgShapes[shape];
      // Scale from viewBox dimensions to unit square [0,1]
      const scaleX = 1 / width;
      const scaleY = 1 / height;
      return (
        <clipPath id={uniqueMaskId} clipPathUnits="objectBoundingBox">
          <path d={path} transform={`scale(${scaleX}, ${scaleY})`} />
        </clipPath>
      );
    }

    return null;
  };

  const shouldRenderSvg = svgShapes[shape] || simpleResultPaths[shape];

  return (
    <>
      {shouldRenderSvg && (
        <svg width="0" height="0" style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}>
          <defs>
            {renderClipPath()}
          </defs>
        </svg>
      )}
      <div className={`relative ${className}`} style={getStyle()}>
        <Image {...imageProps} style={imageStyle} />
      </div>
    </>
  );
}

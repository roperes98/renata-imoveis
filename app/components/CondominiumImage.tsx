"use client";

import { useState } from "react";
import Logo from "./Logo";
import type { ConstructionStageEnum } from "../lib/types/database";

type CondominiumImageProps = {
  imageUrl?: string | null;
  alt: string;
  stage?: ConstructionStageEnum;
};

export default function CondominiumImage({ imageUrl, alt, stage }: CondominiumImageProps) {
  const [imageError, setImageError] = useState(false);
  const hasImage = imageUrl && imageUrl.trim() !== "" && !imageError;

  // Mostra "Lançamento" apenas se estiver em construção (stage existe e não é "ready")
  const showLaunchTag = stage && stage !== "ready";

  return (
    <div className="relative h-[336px] bg-gradient-to-br from-[#960000] to-[#b30000]">
      {hasImage ? (
        <img
          src={imageUrl!}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : null}
      {!hasImage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Logo
            className="w-31 h-31 opacity-70"
            colors={{
              light: "#BCC1CE",
              mid: "#E2DFE5",
              dark: "#E4E0E6",
            }}
          />
        </div>
      )}
      {showLaunchTag && (
        <div className={`absolute top-4 left-4 ${hasImage ? 'bg-[#960000] text-white' : 'bg-[#E2DFE5] text-[#960000]'} px-3 py-1 rounded-full text-sm font-semibold`}>
          Lançamento
        </div>
      )}
    </div>
  );
}


"use client";

import { useState } from "react";
import Logo from "./Logo";

type PropertyImageProps = {
  imageUrl?: string | null;
  alt: string;
  isNew?: boolean;
};

export default function PropertyImage({ imageUrl, alt, isNew = false }: PropertyImageProps) {
  const [imageError, setImageError] = useState(false);
  const hasImage = imageUrl && imageUrl.trim() !== "" && !imageError;

  return (
    <div className="relative h-51 bg-gradient-to-br from-[#960000] to-[#b30000]">
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
            className="w-32 h-32 opacity-70"
            colors={{
              dark: "#BCC1CE",
              mid: "#E2DFE5",
              light: "#E4E0E6",
            }}
          />
        </div>
      )}
      {isNew && (
        <div className={`absolute top-4 left-4 ${hasImage ? 'bg-[#960000] text-white' : 'bg-[#E2DFE5] text-[#960000]'} px-3 py-1 rounded-full text-sm font-semibold`}>
          Novo
        </div>
      )}
    </div>
  );
}


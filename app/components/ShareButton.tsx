"use client";

import { useState } from "react";
import { FiShare2, FiCheck } from "react-icons/fi";

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
}

export default function ShareButton({ title, text, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = url || window.location.href;
    const shareData = {
      title,
      text,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Error copying to clipboard:", err);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`p-3 rounded-full border transition-all self-end md:self-start relative group ${copied
          ? "border-green-500 text-green-500 bg-green-50"
          : "border-gray-200 text-gray-400 hover:text-[#960000] hover:border-[#960000] hover:cursor-pointer"
        }`}
      title={copied ? "Link copiado!" : "Compartilhar"}
    >
      {copied ? <FiCheck size={20} /> : <FiShare2 size={20} />}

      {/* Tooltip for desktop feedback when copied */}
      {copied && (
        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 animate-fade-in-up whitespace-nowrap">
          Link copiado!
        </span>
      )}
    </button>
  );
}

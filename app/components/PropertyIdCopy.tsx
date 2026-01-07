"use client";

import { useState } from "react";
import { LuCopy, LuCheck } from "react-icons/lu";

interface PropertyIdCopyProps {
  code: string;
}

export default function PropertyIdCopy({ code }: PropertyIdCopyProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center cursor-pointer gap-1.5 ml-auto border rounded px-2 py-0.5 transition-colors ${copied
        ? "border-green-500 text-green-600 bg-green-50"
        : "border-gray-200 text-gray-600 hover:border-[#960000] hover:text-[#960000] bg-white"
        }`}
      title="Copiar código"
    >
      {copied ? <LuCheck size={12} /> : <LuCopy size={12} />}
      <span className="text-xs font-medium">{code}</span>
    </button>
  );
}

"use client";

import { useState } from "react";
import { FiX } from "react-icons/fi";

interface DashboardAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DashboardAddModal({ isOpen, onClose }: DashboardAddModalProps) {
  const [name, setName] = useState("");
  const [link, setLink] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here we would handle the addition logic
    console.log("Adding link:", { name, link });
    onClose();
    setName("");
    setLink("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/62 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className=" flex flex-col gap-1.5 p-6 pb-3.5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Adicionar Link</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>

          <p className="text-sm text-gray-500 w-4/6">Adicione um link para que ele seja exibido no menu de links.</p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pt-5.5 pb-6.5 space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nome
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Novo Site"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#960000] focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="link" className="block text-sm font-medium text-gray-700">
              Link
            </label>
            <input
              type="url"
              id="link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://exemplo.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#960000] focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <div className="flex gap-3 pt-5.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[#960000] rounded-xl hover:bg-[#7a0000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#960000] transition-colors shadow-sm"
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

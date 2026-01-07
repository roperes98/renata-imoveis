"use client";

import { useState, FormEvent } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In a real app, you would send this to your API
    console.log("Form data:", formData);

    setIsSubmitting(false);
    setSubmitStatus("success");
    setFormData({ name: "", email: "", phone: "", message: "" });

    // Reset status message after 5 seconds
    setTimeout(() => setSubmitStatus(null), 5000);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-semibold text-[#1e1e1e] mb-2"
        >
          Nome Completo
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
          className="w-full px-4 py-3 border border-[#e6e6e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#960000] focus:border-transparent"
          placeholder="Seu nome"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-[#1e1e1e] mb-2"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          required
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
          className="w-full px-4 py-3 border border-[#e6e6e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#960000] focus:border-transparent"
          placeholder="seu@email.com"
        />
      </div>

      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-semibold text-[#1e1e1e] mb-2"
        >
          Telefone
        </label>
        <input
          type="tel"
          id="phone"
          required
          value={formData.phone}
          onChange={(e) =>
            setFormData({ ...formData, phone: e.target.value })
          }
          className="w-full px-4 py-3 border border-[#e6e6e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#960000] focus:border-transparent"
          placeholder="(21) 98765-4321"
        />
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-sm font-semibold text-[#1e1e1e] mb-2"
        >
          Mensagem
        </label>
        <textarea
          id="message"
          required
          rows={5}
          value={formData.message}
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
          className="w-full px-4 py-3 border border-[#e6e6e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#960000] focus:border-transparent resize-none"
          placeholder="Como podemos ajudar você?"
        />
      </div>

      {submitStatus === "success" && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          Mensagem enviada com sucesso! Entraremos em contato em breve.
        </div>
      )}

      {submitStatus === "error" && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          Erro ao enviar mensagem. Tente novamente.
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#960000] text-white px-6 py-3 rounded-lg hover:bg-[#b30000] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
      </button>
    </form>
  );
}


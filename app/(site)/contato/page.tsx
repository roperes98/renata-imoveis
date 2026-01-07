import type { Metadata } from "next";
import ContactForm from "./ContactForm";
import { FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import Link from "next/link";
import { IoLogoWhatsapp } from "react-icons/io5";

export const metadata: Metadata = {
  title: "Contato - Renata Imóveis",
  description: "Entre em contato com a Renata Imóveis. Estamos prontos para ajudar você a encontrar o imóvel dos seus sonhos.",
};

export default function Contato() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <div>
              <h2 className="text-2xl font-bold mb-6 text-[#1e1e1e]">
                Informações de Contato
              </h2>
              <p className="text-[#4f4f4f]">
                Entre em contato conosco para mais informações ou para agendar uma visita ao imóvel.
              </p>
            </div>

            <div className="space-y-6 text-center md:text-left">
              <Link
                href="tel:+552130428080"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 justify-center md:justify-start transition-colors"
                aria-label="WhatsApp"
              >
                <FiPhone size={28} className="text-[#B22A22]" />
                <p className="text-[#4f4f4f] group-hover:text-[#b30000] transition-colors text-lg">
                  (21) 3042-8080
                </p>
              </Link>
              <Link
                href="https://wa.me/5521998158080"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 justify-center md:justify-start transition-colors"
                aria-label="WhatsApp"
              >
                <IoLogoWhatsapp size={28} className="text-[#B22A22]" />
                <p className="text-[#4f4f4f] group-hover:text-[#b30000] transition-colors text-lg">
                  (21) 99815-8080
                </p>
              </Link>
              <Link
                href="https://maps.app.goo.gl/5H4yxPTFTUeRq1KR9"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 justify-center md:justify-start transition-colors"
                aria-label="WhatsApp"
              >
                <FiMapPin size={28} className="text-[#B22A22]" />
                <p className="text-[#4f4f4f] group-hover:text-[#b30000] transition-colors text-lg">
                  Avenida das Américas, 7899 / bl. 2 - loja 101
                  <br />
                  Barra da Tijuca, RJ - 22793-081
                </p>
              </Link>
              <Link
                href="mailto:contato@renataimoveis.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 justify-center md:justify-start transition-colors"
                aria-label="WhatsApp"
              >
                <FiMail size={28} className="text-[#B22A22]" />
                <p className="text-[#4f4f4f] group-hover:text-[#b30000] transition-colors text-lg">
                  contato@renataimoveis.com.br
                </p>
              </Link>
            </div>

            {/* Office Hours */}
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6 text-[#1e1e1e]">
                Horário de Funcionamento
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[#4f4f4f]">Segunda a Sexta</span>
                  <span className="font-semibold text-[#1e1e1e]">
                    9h às 18h
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#4f4f4f]">Sábado</span>
                  <span className="font-semibold text-[#1e1e1e]">9h às 13h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#4f4f4f]">Domingo</span>
                  <span className="font-semibold text-[#1e1e1e]">Fechado</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-[#1e1e1e]">
              Envie sua Mensagem
            </h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}


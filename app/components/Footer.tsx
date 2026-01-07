import Link from "next/link";
import WideLogo from "./WideLogo";

import { IoLogoWhatsapp, IoMdMail } from "react-icons/io";
import { IoLogoFacebook } from "react-icons/io5";
import { AiFillInstagram } from "react-icons/ai";
import { FaYoutube } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.1)] text-[#1e1e1e] mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="h-12 w-auto max-w-[200px]">
                <WideLogo className="w-full h-full object-contain" />
              </div>
            </Link>
            <p className="text-[#1e1e1e] text-sm max-w-md">
              Sua imobiliária de confiança para encontrar o imóvel dos seus
              sonhos. Oferecemos os melhores imóveis com qualidade e
              transparência.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="https://wa.me/5521987654321"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1e1e1e] hover:text-[#25D366] transition-colors"
              aria-label="WhatsApp"
            >
              <IoLogoWhatsapp size={28} />
            </Link>
            <Link
              href="https://www.facebook.com/renataimoveis"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1e1e1e] hover:text-[#1877F2] transition-colors"
              aria-label="Facebook"
            >
              <IoLogoFacebook size={28} />
            </Link>
            <Link
              href="https://www.instagram.com/renataimoveis"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1e1e1e] hover:text-[#E4405F] transition-colors"
              aria-label="Instagram"
            >
              <AiFillInstagram size={28} />
            </Link>
            <Link
              href="mailto:contato@renataimoveis.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1e1e1e] hover:text-[#960000] transition-colors"
              aria-label="Email"
            >
              <IoMdMail size={28} />
            </Link>
            <Link
              href="https://www.youtube.com/@renataimoveis4816"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1e1e1e] hover:text-[#FF0000] transition-colors"
              aria-label="YouTube"
            >
              <FaYoutube size={28} />
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 border-t border-[#1e1e1e] mt-8 pt-8 text-sm text-[#4f4f4f]">
          <p className="text-center md:text-left">CRECI-RJ 7583 PJ</p>
          <p className="text-center">&copy; 2026 Renata Imóveis. Todos os direitos reservados.</p>
          <p className="text-center md:text-right">
            Desenvolvido por{" "}
            <a
              href="https://www.linkedin.com/in/roperes98/" target="_blank" rel="noopener noreferrer"
              className="text-[#1e1e1e] hover:text-[#8257E5] transition-colors"
            >
              Rodrigo Peres
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { FiHome, FiSearch } from "react-icons/fi";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center bg-[#fafafa]">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl max-w-lg w-full border border-gray-100">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#960000]">
          <FiSearch size={40} />
        </div>

        <h1 className="text-4xl font-bold text-[#1e1e1e] mb-4">
          Página não encontrada
        </h1>

        <p className="text-gray-500 text-lg mb-8 leading-relaxed">
          O conteúdo que você procurou não existe ou foi movido.
          Que tal voltar para o início e recomeçar sua busca?
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-[#960000] text-white px-6 py-3.5 rounded-lg hover:bg-[#b30000] transition-colors font-semibold shadow-sm w-full sm:w-auto"
          >
            <FiHome size={20} />
            Voltar para o Início
          </Link>

          <Link
            href="/imoveis"
            className="flex items-center justify-center gap-2 bg-white text-[#960000] border border-[#960000] px-6 py-3.5 rounded-lg hover:bg-red-50 transition-colors font-semibold w-full sm:w-auto"
          >
            Ver Imóveis
          </Link>
        </div>
      </div>
    </div>
  );
}

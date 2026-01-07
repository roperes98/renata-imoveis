import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center py-12">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#960000] mb-4">404</h1>
        <h2 className="text-3xl font-bold text-[#1e1e1e] mb-4">
          Condomínio não encontrado
        </h2>
        <p className="text-[#4f4f4f] mb-8">
          O condomínio que você está procurando não existe ou foi removido.
        </p>
        <Link
          href="/condominios"
          className="bg-[#960000] text-white px-8 py-3 rounded-lg hover:bg-[#b30000] transition-colors font-semibold inline-block"
        >
          Voltar para condomínios
        </Link>
      </div>
    </div>
  );
}


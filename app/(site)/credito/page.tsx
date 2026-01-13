import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Renata Imóveis | Crédito Imobiliário",
  description: "Simule seu financiamento imobiliário com as principais instituições financeiras e confira dicas importantes.",
  icons: {
    icon: "/icon.svg",
  },
  keywords: ["imóveis", "apartamentos", "casas", "terrenos", "imobiliária", "Rio de Janeiro", "Renata Imóveis"],
  openGraph: {
    title: "Renata Imóveis | Crédito Imobiliário",
    description: "Simule seu financiamento imobiliário com as principais instituições financeiras e confira dicas importantes.",
    type: "website",
    locale: "pt-BR",
    siteName: "Renata Imóveis",
    url: "https://renataimoveis.com.br/credito",
    images: [
      {
        url: "https://renataimoveis.com.br/og-image.png",
        width: 1200,
        height: 630,
        alt: "Renata Imóveis | Crédito Imobiliário",
      },
    ],
  },
  twitter: {
    title: "Renata Imóveis | Crédito Imobiliário",
    description: "Simule seu financiamento imobiliário com as principais instituições financeiras e confira dicas importantes.",
    card: "summary_large_image",
    images: [
      {
        url: "https://renataimoveis.com.br/og-image.png",
        width: 1200,
        height: 630,
        alt: "Renata Imóveis | Crédito Imobiliário",
      },
    ],
  },
  alternates: {
    canonical: "https://renataimoveis.com.br/credito",
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      nocache: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

const banks = [
  {
    name: "Itaú",
    image: "/itau.jpg", // Image at root of public
    url: "https://www.itau.com.br/emprestimos-financiamentos/credito-imobiliario/simulador/",
  },
  {
    name: "Caixa",
    image: "/caixa.jpg",
    url: "http://www8.caixa.gov.br/siopiinternet-web/simulaOperacaoInternet.do?method=inicializarCasoUso",
  },
  {
    name: "Bradesco",
    image: "/bradesco.jpg",
    url: "https://banco.bradesco/html/classic/produtos-servicos/emprestimo-e-financiamento/encontre-seu-credito/simuladores-imoveis.shtm#box1-comprar",
  },
  {
    name: "Santander",
    image: "/santander.jpg",
    url: "https://www.santander.com.br/creditos-e-financiamentos/para-sua-casa/credito-imobiliario?ic=homepf-cardsprod-creditoimobiliario#/dados-pessoais",
  },
];

export default function Credito() {
  return (
    <div className="min-h-screen bg-[#fafafa] py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1e1e1e] mb-4">
            Simuladores de Crédito
          </h1>
          <p className="text-lg text-[#4f4f4f]">
            Encontre as melhores taxas e condições para o seu financiamento.
            Selecione o banco de sua preferência para fazer uma simulação.
          </p>
        </div>

        {/* Banks Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {banks.map((bank) => (
            <Link
              key={bank.name}
              href={bank.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-xl shadow-[10px_10px_20px_#e5e5e5,-10px_-10px_20px_#ffffff] p-6 flex flex-col items-center transition-all duration-300 hover:scale-[1.03] hover:shadow-[15px_15px_30px_#d9d9d9,-15px_-15px_30px_#ffffff]"
            >
              <div className="relative w-24 h-24 mb-4">
                <Image
                  src={bank.image}
                  alt={`Simulador ${bank.name}`}
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-semibold text-[#1e1e1e] group-hover:text-[#960000] transition-colors">
                {bank.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100 space-y-12">

          {/* Dicas */}
          <section>
            <h2 className="text-2xl font-bold text-[#1e1e1e] mb-6 border-l-4 border-[#960000] pl-4">
              Dicas de Financiamento
            </h2>
            <div className="text-[#4f4f4f] space-y-4 leading-relaxed">
              <p>
                Se você não dispõe de todo o dinheiro para comprar um imóvel ou
                mesmo construir sua casa, a saída é recorrer a um financiamento
                imobiliário.
              </p>
              <p>
                Não deixe para cuidar do financiamento na última hora: trate do
                assunto antes mesmo de saber que imóvel comprar. Você ganhará tempo
                e, com uma carta de crédito, terá a segurança de contar com o
                dinheiro restante no momento em que precisar. Mas escolha bem que
                tipo de financiamento comporta a quantia que você pode pagar e
                defina que banco você prefere.
              </p>
              <p>
                Ao contrair um financiamento, você estará usando dinheiro emprestado
                por uma instituição financeira, uma construtora ou uma
                incorporadora. Deverá saldar esse empréstimo de acordo com as normas
                específicas desse crédito imobiliário, em determinado número de
                anos, pagando prestações mensais resultantes de um cálculo definido.
                Se deixar de pagar as prestações, a instituição que lhe emprestou o
                dinheiro tomará as providências para se apossar do bem que você
                financiou.
              </p>
            </div>
          </section>

          {/* Restrições */}
          <section>
            <h2 className="text-2xl font-bold text-[#1e1e1e] mb-6 border-l-4 border-[#960000] pl-4">
              Restrições
            </h2>
            <div className="text-[#4f4f4f] space-y-4 leading-relaxed">
              <p>
                Em princípio, toda pessoa que comprovar que tenha um ganho constante — uma renda, alta ou baixa — estará habilitada a receber um
                financiamento imobiliário.
              </p>
              <p>
                Da mesma maneira, estará capacitada toda pessoa que comprovar, por
                meio de documentos e certidões, que sua situação perante o sistema
                judiciário e fiscal esteja em ordem.
              </p>
              <p>
                Todas as instituições que fazem financiamento de imóveis têm regras
                e exigências próprias e impostas pelo Banco Central. O montante do
                financiamento — em geral uma porcentagem fixa do valor de avaliação
                do imóvel — vai depender da capacidade de pagamento do cliente.
              </p>
              <p>
                Os bancos impõem limite de idade a quem solicita um financiamento: a
                mínima é de 21 anos, e a máxima, somando-se a idade do pretendente
                ao número de anos de financiamento, não pode ultrapassar 75 anos. Se
                a pessoa tiver 65 anos e quiser financiar um empréstimo em 15 anos,
                não poderá obter o crédito, pois essa soma dá 80. O banco poderá
                conceder um financiamento de dez anos (65 + 10 = 75), se essa pessoa
                tiver condições financeiras de arcar com as prestações resultantes.
              </p>
            </div>
          </section>

          {/* Documentos */}
          <section>
            <h2 className="text-2xl font-bold text-[#1e1e1e] mb-6 border-l-4 border-[#960000] pl-4">
              Documentos Exigidos
            </h2>
            <p className="text-[#4f4f4f] mb-6">
              Os documentos são a primeira garantia do credor de que a pessoa que
              receberá o dinheiro é capaz de assumir e honrar a dívida.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-[#1e1e1e] mb-4">
                  Documentação para o crédito
                </h3>
                <ul className="list-disc list-inside space-y-2 text-[#4f4f4f]">
                  <li>Certidão de nascimento ou casamento</li>
                  <li>Carteira de identidade</li>
                  <li>CPF</li>
                  <li>Três últimos contra-cheques (se for assalariado)</li>
                  <li>Declaração de Imposto de Renda</li>
                  <li>Certidão forense estadual e federal</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#1e1e1e] mb-4">
                  Situações Específicas
                </h3>
                <div className="space-y-4 text-[#4f4f4f]">
                  <div>
                    <h4 className="font-medium text-[#1e1e1e]">Sem comprovação de renda mensal</h4>
                    <p className="text-sm mt-1">
                      Para profissionais liberais ou economia informal, basta provar
                      ao banco capacidade de arcar mensalmente com determinada soma.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Documentos do Imóvel/Vendedor */}
          <section>
            <h2 className="text-2xl font-bold text-[#1e1e1e] mb-6 border-l-4 border-[#960000] pl-4">
              Documentos do Imóvel e Vendedor
            </h2>
            <div className="grid md:grid-cols-2 gap-8 text-[#4f4f4f]">
              <div>
                <h3 className="text-lg font-semibold text-[#1e1e1e] mb-2">Do Imóvel</h3>
                <p>
                  <strong>Ônus reais:</strong> Certidão mais importante na hora da
                  compra. Traça um histórico dos últimos 20 anos, indicando
                  proprietário, hipotecas ou pendências. Expedida pelo Cartório de
                  Registro de Imóveis.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#1e1e1e] mb-2">Do Vendedor</h3>
                <p>
                  Garantia de que a pessoa é idônea. Bancos podem exigir abertura de
                  conta ou documentos específicos mesmo para quem já é cliente.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

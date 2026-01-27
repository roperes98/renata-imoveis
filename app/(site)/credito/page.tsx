import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

import { CreditSimulatorCard } from "./CreditSimulatorCard";
import { Badge } from "@/components/ui/badge";
import { AiOutlineFileSearch } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import { IoPhonePortraitOutline } from "react-icons/io5";
import { LiaMoneyBillWaveSolid } from "react-icons/lia";
import { RiCustomerService2Line } from "react-icons/ri";
import { MaterialImageMask } from "@/components/ui/material-image-mask";
import { Separator } from "@/components/ui/separator";
import { MdGavel, MdOutlineTimer } from "react-icons/md";
import { PiHandCoins } from "react-icons/pi";

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

import Carousel from "@/app/components/Carousel";
import { RealEstate } from "@/app/lib/types/database";
import PropertyCard from "@/app/components/PropertyCard";
import { getProperties } from "@/app/lib/supabase/properties";
import DocumentsTabs from "./DocumentsTabs";
import { FAQSection } from "./FAQSection";


const testimonials = [
  {
    name: "Carlos Silva",
    text: "Excelente atendimento! Consegui meu financiamento com taxas muito boas e todo o suporte necessário.",
  },
  {
    name: "Mariana Souza",
    text: "A equipe da Renata Imóveis foi fundamental na compra do meu primeiro apartamento. Recomendo muito!",
  },
  {
    name: "Pedro Santos",
    text: "Processo rápido e descomplicado. Me ajudaram a entender todas as etapas do financiamento.",
  },
  {
    name: "Ana Oliveira",
    text: "Profissionais muito qualificados e atenciosos. Resolveram todas as minhas dúvidas com clareza.",
  },
];


const frequentQuestions = [
  {
    question: "O que é financiamento imobiliário?",
    answer: "Quando uma pessoa quer comprar um imóvel, uma casa ou um apartamento (novo ou usado com \"Habite-se\"), mas não tem o valor total para pagar ao proprietário, ela pode financiar. Assim, o banco realiza o pagamento para o vendedor e a pessoa que comprou tem sua dívida parcelada, que deverá ser paga ao banco no período já pré-definido.",
  },
  {
    question: "Qual é a melhor forma de financiar um imóvel?",
    answer: "A escolha do financiamento dependerá da quantidade de meses que você quer pagar e das taxas que mais se encaixam em seu planejamento financeiro. Conheça as taxas de financiamento imobiliário do Inter e descubra a melhor opção para você.",
  },
  {
    question: "O que preciso saber antes de financiar um imóvel?",
    answer: "1. Valor da entrada que, aqui no Inter, é de pelo menos 25% do valor total do imóvel;\n\n2. Taxas e impostos. No Inter você faz seu financiamento com taxas a partir de 9,5% a.a + IPCA. Já o imposto é o ITBI (Imposto Sobre Transmissão de Bens), que pode ter o valor incluído em seu financiamento;\n\n3. Quantidade de meses que deseja pagar. Isso facilita na hora de simular seu financiamento.",
  },
  {
    question: "Como saber se posso financiar um imóvel?",
    answer: "Depois de fazer a simulação do seu financiamento imobiliário, as informações sobre o imóvel desejado serão avaliadas e nosso time de especialistas entrará em contato para mais detalhes. Para isso, lembre-se de informar seus dados de contato depois da simulação.",
  },
  {
    question: "Como funciona o crédito imobiliário Inter?",
    answer: "O crédito imobiliário do Inter é para quem quer comprar um imóvel, mas não tem todo o valor para pagar de uma só vez. Você precisa de apenas 25% do valor do imóvel para dar de entrada e os outros 75% podem ser parcelados em até 420 meses para imóveis residenciais e 360 para imóveis comerciais",
  },
  {
    question: "Quais as etapas de um financiamento?",
    answer: "1. Faça uma simulação na calculadora de financiamento imobiliário do Inter com as informações do imóvel, quantidade de parcelas e data de nascimento.\n\n2. Com o resultado da simulação em mãos, envie seus dados e documentos e aguarde o contato de nossos especialistas que enviarão a proposta. Não sabe quais dados enviar? Confira aqui a documentação necessária.",
  },
  {
    question: "Como conseguir financiamento imobiliário?",
    answer: "Para conseguir um financiamento imobiliário, faça uma simulação e complete com suas informações de contato. Nosso time de especialistas avaliará sua situação e entrará em contato para mais detalhes.",
  },
  {
    question: "Quais os documentos necessários para fazer financiamento imobiliário?",
    answer: "Documentos do comprador: RG e CPF; certidão de nascimento ou de casamento; comprovante de endereço atualizado (até 3 meses); declaração de saúde.\nComprovação de renda: holerites ou extratos bancários dos últimos 3 meses; declaração completa e recibo de Imposto de Renda (último exercício).\nDocumentos do vendedor: RG e CPF ou CNPJ; comprovante de endereço atualizado (até 3 meses).\nDocumentos do imóvel: matrícula; fotos; IPTU do imóvel\nDocumentos complementares poderão ser solicitados ao longo da operação.",
  },
  {
    question: "Qual a renda mínima para conseguir um imóvel financiado?",
    answer: "Um dos nossos grandes diferenciais é uma análise de crédito flexível e personalizada. Por isso, faça uma simulação e deixe que um de nossos especialistas entre em contato para entender um pouco melhor seu perfil.",
  },
  {
    question: "Como diminuir o valor das parcelas de um financiamento imobiliário?",
    answer: "Se você já tem um financiamento imobiliário em outro banco, pode solicitar a portabilidade para o Inter. Faça uma simulação e veja como é possível diminuir o valor de suas parcelas.",
  },
];

export default async function Credito() {
  const [featuredPropertiesResult] =
    await Promise.all([
      getProperties({ limit: 10 })
    ]);

  const featuredProperties = featuredPropertiesResult.data;



  return (
    <div className="min-h-screen bg-[#fafafa]">
      <section className="relative min-h-[536px] h-auto md:h-[536px] py-10 md:py-0 w-full flex flex-col md:flex-row items-center justify-center gap-12 md:gap-48 overflow-hidden">
        <Image
          src="/living-room.png"
          alt="Living room background"
          fill
          className="object-cover blur-[2px]"
          priority
        />
        <div className="max-w-[712px] relative z-10 px-4 md:px-0 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-[#fff] mb-4">
            Crédito Imobiliário Renata Imóveis com entrada a partir de 25%
          </h1>
          <p className="text-lg text-[#fff]/90">
            Simule seu crédito imobiliário com as principais instituições financeiras e confira dicas importantes.
          </p>
        </div>

        <div className="relative z-10 w-full max-w-[570px]">
          <CreditSimulatorCard />
        </div>
      </section>

      <section className="py-8 md:py-16 bg-[#fafafa] container mx-auto">
        <div className="flex items-center gap-2 px-6 mb-5">
          <AiOutlineFileSearch size={24} />
          <p className="text-[#1e1e1e] text-xl font-semibold">O que você procura?</p>
        </div>
        <div className="flex items-center gap-2 px-6 overflow-x-auto w-full pb-2 scrollbar-hide">
          <Badge className="bg-[#960000] text-[13px] px-4.5 py-1.5 shrink-0">Simuladores</Badge>
          <Badge className="bg-[#960000] text-[13px] px-4.5 py-1.5 shrink-0">Vantagens</Badge>
          <Badge className="bg-[#960000] text-[13px] px-4.5 py-1.5 shrink-0">Documentação</Badge>
          <Badge className="bg-[#960000] text-[13px] px-4.5 py-1.5 shrink-0">Como financiar</Badge>
          <Badge className="bg-[#960000] text-[13px] px-4.5 py-1.5 shrink-0">Taxas de financiamento</Badge>
          <Badge className="bg-[#960000] text-[13px] px-4.5 py-1.5 shrink-0">Como usar FGTS</Badge>
          <Badge className="bg-[#960000] text-[13px] px-4.5 py-1.5 shrink-0">Custos e Impostos</Badge>
        </div>
      </section>
      <section className="bg-white py-8 md:py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <MaterialImageMask
            src="/coffee.png"
            alt=""
            width={500}
            height={500}
            shape="4-sided-cookie"
            className="w-full max-w-[370px] h-[370px] md:max-w-[500px] md:h-[500px]"
          />

          <div className="flex flex-col gap-4 w-full max-w-[690px]">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl md:text-4xl font-bold text-[#1e1e1e] mb-2">Sua casa está a um clique: nós fazemos tudo por você!</h2>
              <span className="flex items-center gap-2 text-[#00aa4f] text-md md:text-lg font-semibold max-w-[310px] md:max-w-full"><IoPhonePortraitOutline className="w-6 h-6 shrink-0" /> Processos rápidos e atendimento via WhatsApp</span>
            </div>

            <p className="text-md md:text-lg text-[#1e1e1e]">Financiar seu imóvel não precisa ser complicado. Na Renata Imóveis o processo é digital, simples, rápido e sem sair de casa. Temos um time de especialistas preparados para auxiliar com todas as etapas do seu financiamento.</p>
            <p className="text-md md:text-lg text-[#1e1e1e] font-semibold">Assim, sobra tempo para você planejar a nova casa do jeito que sempre sonhou!</p>

            <Button className="bg-[#960000] hover:bg-[#960000]/80 text-[#fff] w-full h-[48px] mt-4">Quero simular</Button>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-6 flex flex-col-reverse md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-4 w-full max-w-[696px]">
            <h2 className="text-2xl md:text-4xl font-bold text-[#1e1e1e] leading-[1.2] mb-2">
              O que é Financiamento <br />Imobiliário?
            </h2>
            <p className="text-md md:text-lg text-[#1e1e1e] ">
              Para comprar seu imóvel, novo ou usado, você pode contar com o crédito imobiliário do Inter! <strong>Financiamos até 75% do valor do imóvel para pagar em 35 anos.</strong>
            </p>
            <p className="text-md md:text-lg text-[#1e1e1e] ">
              Você pode fazer seu financiamento pelo SFI ou pelo SFH. O SFH (Sistema Financeiro de Habitação), possui teto máximo de juros de 12% ao ano e você pode usar seu FGTS para amortização ou entrada. Já o SFI (Sistema de Financiamento Imobiliário), permite financiar imóveis de maior valor, porém sem a garantia de um teto de juros.
            </p>
            <p className="text-md md:text-lg text-[#1e1e1e] ">
              Além disso, você pode usar <strong>até 30% da sua renda mensal familiar bruta no crédito imobiliário.</strong>
            </p>
          </div>

          <MaterialImageMask
            src="/receiving-keys.png"
            alt=""
            width={500}
            height={500}
            shape="arch"
            className="w-full max-w-[370px] h-[370px] md:max-w-[500px] md:h-[500px]"
          />
        </div>
      </section>

      <section className="bg-white py-8 md:py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <MaterialImageMask
            src="/working-with-computer.png"
            alt=""
            width={500}
            height={500}
            shape="slanted"
            className="w-full max-w-[370px] h-[370px] md:max-w-[500px] md:h-[500px]"
          />

          <div className="flex flex-col w-full max-w-[696px] gap-6">
            <div className="flex flex-col gap-3">
              <h2 className="text-2xl md:text-4xl font-bold text-[#1e1e1e] leading-[1.2]">
                Como financiar seu imóvel <br />com a Renata Imóveis?
              </h2>
              <p className="text-md md:text-lg text-[#1e1e1e]/80">
                Financiar seu imóvel com a Renata Imóveis é mais rápido e prático! São apenas 5 etapas! Veja:
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <div className="shrink-0 bg-[#960000] rounded-full h-[26px] w-[26px] flex items-center justify-center text-[12px] text-white">1</div>
                <div>
                  <h3 className="text-sm font-semibold text-[#1e1e1e]">Faça uma simulação</h3>
                  <p className="text-sm text-[#1e1e1e]">Preencha as informações solicitadas sobre o imóvel, dados para contato e envie os documentos pessoais solicitados.</p>
                </div>
              </div>
              <Separator className="md:hidden mb-1.5" />
              <div className="flex gap-3">
                <div className="shrink-0 bg-[#960000] rounded-full h-[26px] w-[26px] flex items-center justify-center text-[12px] text-white">2</div>
                <div>
                  <h3 className="text-sm font-semibold text-[#1e1e1e]">Análise de crédito</h3>
                  <p className="text-sm text-[#1e1e1e]">Nossos especialistas analisam a documentação enviada e preparam a proposta de financiamento mais adequada para você!</p>
                </div>
              </div>
              <Separator className="md:hidden mb-1.5" />
              <div className="flex gap-3">
                <div className="shrink-0 bg-[#960000] rounded-full h-[26px] w-[26px] flex items-center justify-center text-[12px] text-white">3</div>
                <div>
                  <h3 className="text-sm font-semibold text-[#1e1e1e]">Avaliação do imóvel</h3>
                  <p className="text-sm text-[#1e1e1e]">Um engenheiro vai até o imóvel e faz uma avaliação para definir o valor do bem e as condições de uso.</p>
                </div>
              </div>
              <Separator className="md:hidden mb-1.5" />
              <div className="flex gap-3">
                <div className="shrink-0 bg-[#960000] rounded-full h-[26px] w-[26px] flex items-center justify-center text-[12px] text-white">4</div>
                <div>
                  <h3 className="text-sm font-semibold text-[#1e1e1e]">Assinatura de contrato</h3>
                  <p className="text-sm text-[#1e1e1e]">Assinatura de contrato, onde constam as taxas do financiamento, seguros obrigatórios, amortização e outros detalhes.</p>
                </div>
              </div>
              <Separator className="md:hidden mb-1.5" />
              <div className="flex gap-3">
                <div className="shrink-0 bg-[#960000] rounded-full h-[26px] w-[26px] flex items-center justify-center text-[12px] text-white">5</div>
                <div>
                  <h3 className="text-sm font-semibold text-[#1e1e1e]">Entrega de chaves</h3>
                  <p className="text-sm text-[#1e1e1e]">Após o pagamento do ITBI e Registro do Imóvel a documentação está regularizada para o recebimento das chaves!</p>
                </div>
              </div>
              <Separator className="md:hidden mb-1.5" />
            </div>

            <Button className="bg-[#960000] hover:bg-[#960000]/80 text-[#fff] w-full md:max-w-[320px] h-[48px] mt-4">Simular crédito imobiliário</Button>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-6 flex flex-col items-center gap-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-4xl font-bold text-[#1e1e1e] mb-2">Quais são as vantagens de<br />fazer seu Financiamento Imobiliário na Renata Imóveis?</h2>
            <p className="text-md md:text-lg text-[#1e1e1e]/80">Mais flexibilidade para ter seu imóvel. Pesquise com a gente a melhor oportunidade para seu financiamento. Na Renata Imóveis, o processo de contratação é <br />digital, rápido e descomplicado.</p>
          </div>


          {/* Mobile Carousel */}
          <div className="md:hidden w-full">
            <Carousel>
              <div className="h-[211px] w-[263px] p-6 bg-white rounded-lg shadow-sm">
                <LiaMoneyBillWaveSolid className="text-[#960000] h-8 w-8 mb-5.5" />
                <h3 className="text-lg font-bold text-[#1e1e1e] mb-0.5">Financie até 75% do imóvel em até 35 anos</h3>
                <p className="text-sm text-[#1e1e1e]/80">Prestações que cabem no seu bolso e mais tempo para pagar.</p>
              </div>
              <div className="h-[211px] w-[263px] p-6 bg-white rounded-lg shadow-sm">
                <RiCustomerService2Line className="text-[#960000] h-7 w-7 mb-5.5" />
                <h3 className="text-lg font-bold text-[#1e1e1e] mb-0.5">Atendimento personalizado</h3>
                <p className="text-sm text-[#1e1e1e]/80">Atendimento personalizado para cada cliente.</p>
              </div>
              <div className="h-[211px] w-[263px] p-6 bg-white rounded-lg shadow-sm">
                <MdOutlineTimer className="text-[#960000] h-8 w-8 mb-5.5" />
                <h3 className="text-lg font-bold text-[#1e1e1e] mb-0.5">Agilidade e Praticidade</h3>
                <p className="text-sm text-[#1e1e1e]/80">Simule online e contrate seu financiamento com mais agilidade e praticidade</p>
              </div>
              <div className="h-[211px] w-[263px] p-6 bg-white rounded-lg shadow-sm">
                <MdGavel className="text-[#960000] h-8 w-8 mb-5.5" />
                <h3 className="text-lg font-bold text-[#1e1e1e] mb-0.5">Sem burocracias</h3>
                <p className="text-sm text-[#1e1e1e]/80">Todo os processos de Registro Eletrônico e de baixa do Termo de Quitação dos contratos liquidados são feitos por nós.</p>
              </div>
            </Carousel>
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:flex items-center gap-6">
            <div className="h-[211px] w-[263px] p-6 bg-white rounded-lg shadow-sm">
              <LiaMoneyBillWaveSolid className="text-[#960000] h-8 w-8 mb-5.5" />
              <h3 className="text-lg font-bold text-[#1e1e1e] mb-0.5">Financie até 75% do imóvel em até 35 anos</h3>
              <p className="text-sm text-[#1e1e1e]/80">Prestações que cabem no seu bolso e mais tempo para pagar.</p>
            </div>
            <div className="h-[211px] w-[263px] p-6 bg-white rounded-lg shadow-sm">
              <RiCustomerService2Line className="text-[#960000] h-7 w-7 mb-5.5" />
              <h3 className="text-lg font-bold text-[#1e1e1e] mb-0.5">Atendimento personalizado</h3>
              <p className="text-sm text-[#1e1e1e]/80">Atendimento personalizado para cada cliente.</p>
            </div>
            <div className="h-[211px] w-[263px] p-6 bg-white rounded-lg shadow-sm">
              <MdOutlineTimer className="text-[#960000] h-8 w-8 mb-5.5" />
              <h3 className="text-lg font-bold text-[#1e1e1e] mb-0.5">Agilidade e Praticidade</h3>
              <p className="text-sm text-[#1e1e1e]/80">Simule online e contrate seu financiamento com mais agilidade e praticidade</p>
            </div>
            <div className="h-[211px] w-[263px] p-6 bg-white rounded-lg shadow-sm">
              <MdGavel className="text-[#960000] h-8 w-8 mb-5.5" />
              <h3 className="text-lg font-bold text-[#1e1e1e] mb-0.5">Sem burocracias</h3>
              <p className="text-sm text-[#1e1e1e]/80">Todo os processos de Registro Eletrônico e de baixa do Termo de Quitação dos contratos liquidados são feitos por nós.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-8 md:py-12 relative min-h-[500px] overflow-hidden">
        <div className="container mx-auto flex flex-col-reverse lg:flex-row items-center gap-4">
          <div className="flex flex-col px-6 gap-4 w-full max-w-[696px]">
            <h2 className="text-2xl md:text-4xl font-bold text-[#1e1e1e] leading-[1.2] mb-2">
              Como posso usar meu FGTS<br />para financiar meu imóvel?
            </h2>
            <p className="text-md md:text-lg text-[#1e1e1e] ">
              Você pode <strong className="text-[#960000]">usar seu FGTS no financiamento imobiliário</strong><br />
              para compor o valor da entrada ou na amortização de parcelas.
            </p>

            <div>
              <div className="flex gap-3">
                <PiHandCoins className="text-[#960000] h-8 w-8 mb-5.5" />
                <div>
                  <h3 className="font-semibold text-[#1e1e1e]">Amortização de saldo devedor:</h3>
                  <p className="text-sm text-[#1e1e1e]">O FGTS pode ser usado a cada 2 anos para essa finalidade, desde que tenha valor disponível.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <LiaMoneyBillWaveSolid className="text-[#960000] h-8 w-8 mb-5.5" />
                <div>
                  <h3 className="font-semibold text-[#1e1e1e]">Diminuir o valor das parcelas:</h3>
                  <p className="text-sm text-[#1e1e1e]">Com o FGTS é possível diminuir o valor das próximas 12 parcelas em até 80%. Nessa modalidade não há prazo mínimo para utilização.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <LiaMoneyBillWaveSolid className="text-[#960000] h-8 w-8 mb-5.5" />
                <div>
                  <h3 className="font-semibold text-[#1e1e1e]">Amortização de parcelas:</h3>
                  <p className="text-sm text-[#1e1e1e]">O saldo do FGTS é utilizado para diminuir a quantidade de parcelas do seu financiamento, sem alterar seu valor.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-[812px] h-[300px] lg:h-[500px] lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2">
            <MaterialImageMask
              src="/house.png"
              alt=""
              width={812}
              height={500}
              shape="fgts-mask"
              className="w-full h-full"
            />
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <MaterialImageMask
            src="/barra.jpg"
            alt=""
            width={500}
            height={500}
            shape="soft-burst"
            className="w-full max-w-[370px] h-[370px] md:max-w-[500px] md:h-[500px]"
          />

          <div className="flex flex-col gap-4 w-full max-w-[690px]">
            <h2 className="text-2xl md:text-4xl font-bold text-[#1e1e1e] mb-2">
              Dicas de Financiamento
            </h2>
            <div className="text-md md:text-lg text-[#1e1e1e] space-y-4">
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
          </div>
        </div>
      </section>

      <section className="bg-[#960000] py-8 md:py-12">
        <div className="container mx-auto px-6 flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex flex-col gap-2 w-full md:max-w-[40%]">
            <h2 className="text-2xl md:text-4xl font-bold text-[#fff] mb-2">
              Faça com quem entende do assunto!
            </h2>
            <p className="text-md md:text-lg text-[#fff]">
              O Crédito Imobiliário está no nosso DNA e já são milhares de clientes contando com serviços exclusivos: tudo online e sem burocracia!
            </p>
          </div>
          <div className="w-full md:max-w-[50%]">
            <Carousel>
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg w-[300px] h-[170px] flex flex-col justify-between">
                  <p className="text-[#1e1e1e] text-sm/relaxed italic mb-4 line-clamp-4">"{testimonial.text}"</p>
                  <p className="text-[#960000] font-bold text-sm">- {testimonial.name}</p>
                </div>
              ))}
            </Carousel>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-6 flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex flex-col gap-2 w-full md:max-w-[40%]">
            <h2 className="text-2xl md:text-4xl font-bold text-[#1e1e1e] leading-[1.2] mb-2">
              Documentos Exigidos
            </h2>
            <p className="text-md md:text-lg text-[#1e1e1e]">
              Para dar entrada no seu financiamento imobiliário, você precisará separar alguns documentos. Confira a lista ao lado:
            </p>
          </div>
          <DocumentsTabs />
        </div>
      </section>

      <section className="bg-white py-8 md:py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <MaterialImageMask
            src="/barra.jpg"
            alt=""
            width={500}
            height={500}
            shape="bun"
            className="w-full max-w-[370px] h-[370px] md:max-w-[500px] md:h-[500px]"
          />

          <div className="flex flex-col gap-4 w-full max-w-[690px]">
            <h2 className="text-2xl md:text-4xl font-bold text-[#1e1e1e] mb-2">Quem pode financiar?</h2>

            <p className="text-md md:text-lg text-[#1e1e1e]">
              Obter seu financiamento é simples: basta comprovar sua renda e estar com a situação fiscal e jurídica regularizada. A aprovação depende apenas da análise de crédito e da avaliação do imóvel.
            </p>

            <h3 className="text-lg text-[#1e1e1e] font-semibold mt-6 mb-4">Como funciona</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm flex flex-col gap-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#fafafa] flex items-center justify-center text-[#960000]">
                    <MdGavel size={20} />
                  </div>
                  <h4 className="font-bold text-[#1e1e1e]">Idade</h4>
                </div>
                <p className="text-sm text-[#1e1e1e]/80">
                  Mínima de 21 anos. A soma da sua idade com o prazo do financiamento não pode ultrapassar 75 anos.
                </p>
              </div>

              <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm flex flex-col gap-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#fafafa] flex items-center justify-center text-[#960000]">
                    <LiaMoneyBillWaveSolid size={20} />
                  </div>
                  <h4 className="font-bold text-[#1e1e1e]">Renda</h4>
                </div>
                <p className="text-sm text-[#1e1e1e]/80">
                  Você pode comprometer até 30% da sua renda mensal familiar bruta com as parcelas do financiamento.
                </p>
              </div>
            </div>

            <div className="flex gap-1 text-xs text-[#1e1e1e]/80 w-full mt-2">
              <span>*</span>
              <p>
                Todas as instituições que fazem financiamento de imóveis têm regras e exigências próprias além das impostas pelo <br />Banco Central.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-4xl font-bold text-[#1e1e1e] mb-2">
            Perguntas frequentes sobre Financiamento Imobiliário
          </h2>

          <FAQSection questions={frequentQuestions} />

          <div className="flex justify-between items-center mb-12">
            <h2 className="text-2xl font-bold text-[#1e1e1e]">
              Confira alguns dos nossos imóveis
            </h2>
            <Link
              href="/imoveis"
              className="group relative text-sm text-gray-outline font-semibold border border-gray-outline px-[22px] py-[10px] rounded-lg flex items-center gap-2 overflow-hidden transition-all duration-300 hover:border-[#960000]"
            >
              <span className="relative z-10 flex items-center gap-2 group-hover:text-[#fafafa] transition-colors duration-300">
                Ver todos
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 10 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="flex-shrink-0"
                >
                  <path
                    d="M5.5 12L10.5 8L5.5 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="absolute inset-0 bg-[#960000] transform origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></span>
            </Link>
          </div>
          <Carousel>
            {featuredProperties.map((property: RealEstate, index: number) => {
              const imageUrl = property.images?.[0]?.url || null;

              return (
                <PropertyCard
                  key={property.id}
                  property={property}
                  imageUrl={imageUrl}
                  index={index}
                  className="w-[276px]"
                />
              );
            })}
          </Carousel>
        </div>
      </section>

      {/* --- Section Removed --- */}
    </div>
  );
}

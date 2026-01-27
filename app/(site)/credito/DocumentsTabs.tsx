"use client";

import { useState } from "react";
import Carousel from "@/app/components/Carousel";
import { FaAddressCard, FaFileContract, FaHome, FaUser, FaFileInvoiceDollar } from "react-icons/fa";
import { GrDocumentText } from "react-icons/gr";

export default function DocumentsTabs() {
  const [currentEntity, setCurrentEntity] = useState(1);

  const entityTabs = [
    { name: "Comprador", id: 1 },
    { name: "Vendedor", id: 2 },
    { name: "Imóvel", id: 3 },
  ];

  const documents: Record<number, { text: string; description: string; icon: React.ReactNode }[]> = {
    1: [ // Comprador
      {
        text: "RG e CPF",
        description: "Para estrangeiros, é necessário apresentar o RNE (Registro Nacional de Estrangeiro) ou Passaporte com visto válido.",
        icon: <FaAddressCard className="text-[#960000] w-5 h-5 mx-auto" />
      },
      {
        text: "Certidão de Estado Civil",
        description: "Certidão de Nascimento (solteiros) ou Casamento (casados/divorciados) com averbações atualizadas.",
        icon: <FaUser className="text-[#960000] w-5 h-5 mx-auto" />
      },
      {
        text: "Comprovante de Residência",
        description: "Contas de consumo (luz, água, telefone) em nome do comprador, emitidas há menos de 60 dias.",
        icon: <FaHome className="text-[#960000] w-5 h-5 mx-auto" />
      },
      {
        text: "Comprovante de Renda",
        description: "Holerites (últimos 3 meses). Se houver renda variável ou comissões, apresentar os últimos 6 meses.",
        icon: <FaFileInvoiceDollar className="text-[#960000] w-5 h-5 mx-auto" />
      },
      {
        text: "Imposto de Renda",
        description: "Declaração completa do último exercício com o recibo de entrega. Essencial para análise de crédito.",
        icon: <GrDocumentText className="text-[#960000] w-5 h-5 mx-auto" />
      },
      {
        text: "Carteira de Trabalho",
        description: "Para autônomos ou profissionais sem registro CLT, substituir por Extratos Bancários (6 meses) e DECORE.",
        icon: <FaFileContract className="text-[#960000] w-5 h-5 mx-auto" />
      },
    ],
    2: [ // Vendedor
      {
        text: "RG e CPF",
        description: "Identificação oficial de todos os proprietários do imóvel e seus cônjuges, se houver.",
        icon: <FaAddressCard className="text-[#960000] w-5 h-5 mx-auto" />
      },
      {
        text: "Certidão de Estado Civil",
        description: "Documento atualizado que comprove o estado civil atual dos vendedores na data da venda.",
        icon: <FaUser className="text-[#960000] w-5 h-5 mx-auto" />
      },
      {
        text: "Certidões Negativas",
        description: "Certidões de ações cíveis, criminais e federais para garantir a idoneidade da venda.",
        icon: <GrDocumentText className="text-[#960000] w-5 h-5 mx-auto" />
      },
      {
        text: "Protestos em Cartório",
        description: "Certidão negativa de protestos dos últimos 5 anos dos cartórios de domicílio do vendedor.",
        icon: <GrDocumentText className="text-[#960000] w-5 h-5 mx-auto" />
      },
      {
        text: "Certidão de Tributos",
        description: "Comprovante de regularidade fiscal federal (Receita Federal) e dívida ativa da União.",
        icon: <GrDocumentText className="text-[#960000] w-5 h-5 mx-auto" />
      },
      {
        text: "Endereço Atualizado",
        description: "Comprovante de residência recente em nome do proprietário vendedor.",
        icon: <FaHome className="text-[#960000] w-5 h-5 mx-auto" />
      },
    ],
    3: [ // Imóvel
      {
        text: "Matrícula do Imóvel",
        description: "Certidão de Inteiro Teor com Ônus Reais e Reipersecutórias atualizada (válida por 30 dias).",
        icon: <FaFileContract className="text-[#960000] w-5 h-5 mx-auto" />
      },
      {
        text: "Capa do IPTU",
        description: "Cópia da capa do carnê do IPTU do ano vigente, identificando o número de inscrição do imóvel.",
        icon: <FaHome className="text-[#960000] w-5 h-5 mx-auto" />
      },
      {
        text: "Débitos Condominiais",
        description: "Declaração emitida pela administradora ou síndico comprovando a inexistência de débitos.",
        icon: <GrDocumentText className="text-[#960000] w-5 h-5 mx-auto" />
      },
      {
        text: "Taxa de Incêndio",
        description: "Comprovante de quitação ou declaração de isenção da Taxa de Incêndio (FUNESBOM).",
        icon: <GrDocumentText className="text-[#960000] w-5 h-5 mx-auto" />
      },
    ]
  };

  return (
    <div className="w-full md:max-w-[50%]">
      <div className="relative bg-gray-100 p-1 rounded-full flex w-full max-w-sm mb-6 ml-[-8px]">
        {entityTabs.map((entity, index) => {
          const isActive = currentEntity === entity.id;
          return (
            <button
              key={entity.id}
              type="button"
              onClick={() => setCurrentEntity(entity.id)}
              className={`flex-1 relative z-10 py-2 text-sm font-medium rounded-full transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary
              ${isActive
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                }`}
            >
              {entity.name}
            </button>
          );
        })}
      </div>

      <div className="relative">
        {entityTabs.map((entity) => {
          const isActive = currentEntity === entity.id;
          const docs = documents[entity.id] || [];

          return (
            <div
              key={entity.id}
              className={isActive ? "relative block opacity-100 visible" : "absolute top-0 left-0 w-full opacity-0 invisible pointer-events-none"}
              aria-hidden={!isActive}
            >
              <Carousel>
                {docs.map((doc, index) => (
                  <div
                    key={index}
                    className="bg-white mx-2 rounded-xl p-6 shadow-lg w-[300px] h-[170px] flex flex-col justify-between items-start text-left border border-gray-100"
                  >
                    <div className="text-[#960000]">
                      {doc.icon}
                    </div>
                    <div>
                      <p className="text-[#1e1e1e] text-base font-bold mb-1">
                        {doc.text}
                      </p>
                      <p className="text-[#1e1e1e]/70 text-xs leading-snug line-clamp-3 h-[50px]">
                        {doc.description}
                      </p>
                    </div>
                  </div>
                ))}
              </Carousel>
            </div>
          );
        })}
      </div>
    </div>
  );
}

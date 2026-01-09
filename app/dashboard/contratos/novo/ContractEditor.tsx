"use client";

import { useState, useEffect } from "react";
import { SaleProcess } from "@/app/lib/types/sales";
import { generateBaseContract } from "./contract-generator";
import ContractDataBlocks from "./ContractDataBlocks";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

// Tiptap imports
import { useEditor, EditorContent, mergeAttributes } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import OrderedList from "@tiptap/extension-ordered-list";
import Paragraph from "@tiptap/extension-paragraph";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { ContractToolbar } from "./ContractToolbar";
import "./editor.css";
import { PaginationPlus, PAGE_SIZES } from "tiptap-pagination-plus";
import DragHandle from "./DragHandle";
import { ContractSlashCommand } from "./extensions/ContractSlashCommand";
import { ContractBubbleMenu } from "./ContractBubbleMenu";
import BubbleMenuExtension from "@tiptap/extension-bubble-menu";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontSize } from "./extensions/FontSize";


interface ContractEditorProps {
  sale: SaleProcess | undefined;
}

export default function ContractEditor({ sale }: ContractEditorProps) {
  // Configuração do editor
  // Helper for footer text
  const getFooterText = (sale: SaleProcess | undefined) => {
    if (!sale?.property) return "Contrato de Compra e Venda";

    // Helper to format proper case or keep as is? Usually contracts use uppercase or standard.
    // I'll stick to the input format.
    const p = sale.property;

    // Construct address parts
    const parts = [];
    if (p.address_street) parts.push(p.address_street);
    if (p.address_number) parts.push(`nº ${p.address_number}`);
    if (p.address_complement) parts.push(p.address_complement);

    // Join address components
    const address = parts.join(" "); // "Av. V. Pres. Jose Alencar no 1515 bl 06 apto 112"

    const neighborhood = p.address_neighborhood || "";
    const state = p.address_state || "";

    // "Contr. de Sinal e Princípio de Pagamento de Compra e Venda do Imóvel à [Endereço] - [Bairro] - [UF]."
    const text = `Contr. de Sinal e Princípio de Pagamento de Compra e Venda do Imóvel à ${address} - ${neighborhood} - ${state}.`;

    // Separator lines: Thick top (3px), Thin bottom (1px), Primary Color #960000
    // Separator lines: Thick top (3px), Thin bottom (1px), Primary Color #960000
    // We used to have separate separators, now we want a continuous one.
    const separator = `
      <div style="margin-bottom: 4px; width: 100%;">
        <div style="border-top: 4px solid #960000; margin-bottom: 2px;"></div>
        <div style="border-top: 1px solid #960000;"></div>
      </div>
    `;

    return `
      <div style="display: flex; flex-direction: column; width: 100%;">
        ${separator}
        <div style="font-size: 10px; color: #888; line-height: 1.2; padding-top: 4px;">${text}</div>
      </div>
    `;
  };

  const footerText = getFooterText(sale);

  // Reusable separator for right footer to match - needs to look continuous
  const separatorHtml = `
    <div style="margin-bottom: 4px; width: 100%;">
      <div style="border-top: 4px solid #960000; margin-bottom: 2px;"></div>
      <div style="border-top: 1px solid #960000;"></div>
    </div>
  `;


  const wideLogoSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="130" viewBox="0 0 1957 565" fill="none" style="display: block;">
      <path fill="url(#paint0_linear_5203_156)" d="M599.252 117.475h100.974v247.74L599.252 231.657z"></path>
      <path fill="url(#paint1_linear_5203_156)" d="M112.273 417 426.614 0l101.815 134.257L317.026 417z"></path>
      <path fill="url(#paint2_linear_5203_156)" d="M114.016 414.66h425.529l113.894 149.641L0 565z"></path>
      <path fill="url(#paint3_linear_5203_156)" d="M426.035 269 527.71 133.344l325.378 430.957H650.44l-112.203-147.65z"></path>
      <path fill="#7C1630" d="M1040 125h126v41.75h-84v41.75h63v41.75h-63v41.25h84V333h-126zM1210 121l126.5 119V125h42v212l-126-117.5V333H1210zM1423 333h44.34l50.91-111 18.84 42.5H1511l-17.5 36.5h60.5l14.08 32h45.42l-95.09-211zM1766.5 333h44.34l50.91-111 18.84 42.5h-26.09L1837 301h60.5l14.08 32H1957l-95.09-211zM1669.75 167H1618v-41.5h145V167h-51.25v166h-42zM995.5 332.5l-48-74.5c8.735-3.518 15.5-8 19.5-12.5 6.686-6.5 9.381-14.007 13-22.5s5-17.807 5-27-.882-18.507-4.5-27c-3.619-8.493-9.814-16.5-16.5-23s-14.712-11.154-23.447-14.672A73.8 73.8 0 0 0 913 126h-71.5v206.5h42V168.181H913c3.757 0 7.478.719 10.95 2.118a28.7 28.7 0 0 1 9.283 6.03 27.8 27.8 0 0 1 6.203 9.025A27.15 27.15 0 0 1 941.614 196c0 3.653-.74 7.271-2.178 10.646a27.8 27.8 0 0 1-6.203 9.025 28.7 28.7 0 0 1-9.283 6.03 29.3 29.3 0 0 1-10.95 2.118h-16.353v28.902l46.649 79.779z"></path>
      <path fill="#6E6F71" d="M1630 383h106v35.126h-70.67v35.126h53v35.127h-53v34.705H1736V558h-106zM1016 379l86 116.5 86-116.5v178.63h-35.5V486.5l-50.5 68-49.8-68v71.13H1016zM937 383h36v175h-36zM1773 383h35.5v175H1773zM1434 383h37.5l41.5 95.5 42-95.5h38l-80 178.5zM1404 470.5c0 48.877-40.07 88.5-89.5 88.5s-89.5-39.623-89.5-88.5 40.07-88.5 89.5-88.5 89.5 39.623 89.5 88.5m-142.64 0c0 29.023 23.79 52.55 53.14 52.55s53.14-23.527 53.14-52.55-23.79-52.55-53.14-52.55-53.14 23.527-53.14 52.55M1321.5 317l21 16.5-36.5 34-13-10.5zM1943.57 402.067c5.76 7.195 9.57 16.702 10.93 25.754l-35 7.179c0-3-.5-7.179-4.13-11.195a17.66 17.66 0 0 0-7.24-5.35 18 18 0 0 0-9-1.11 17.8 17.8 0 0 0-8.37 3.424 17.4 17.4 0 0 0-5.54 7.052 17.1 17.1 0 0 0-1.23 8.817 17.1 17.1 0 0 0 3.4 8.252c1.84 2.414 4.64 3.903 7.12 5.507 2.44 1.573 12.88 4.973 21.97 7.935l.52.168c9.21 3 20 8.5 27 15.5s10.7 14.459 12.07 23.517c1.36 9.057.17 18.297-3.45 26.803-3.63 8.506-9.57 15.983-17.24 21.69s-16.79 9.446-26.47 10.846c-9.67 1.4-19.57.412-28.7-2.865s-17.18-8.73-23.35-15.819c-6.17-7.088-10.34-16.524-11.92-25.55L1881 505.5c.05 3 .62 6.551 4.5 10.5 2.04 2.337 4.99 4.419 8 5.5s6.52 1.872 9.5 1.5c4-.5 7.5-1.5 9.5-3s6-5 7.5-8.5 1.5-6.5.5-10.5c-1-3-2-5-5-7-3-2.5-5.02-3.357-8-4.5l-22.5-7c-9.5-4-20-11-25.5-17.5-5.6-7.319-9.94-14.936-11.09-24.015a51.6 51.6 0 0 1 3.73-26.739c3.6-8.442 9.38-15.814 16.78-21.387 7.39-5.572 16.14-9.151 25.38-10.382a54.44 54.44 0 0 1 27.29 3.366c8.64 3.436 16.22 9.029 21.98 16.224"></path>
      <defs>
        <linearGradient id="paint0_linear_5203_156" x1="732.561" x2="611.064" y1="129" y2="292.009" gradientUnits="userSpaceOnUse"><stop stop-color="#7C1630"></stop><stop offset="0.599" stop-color="#7C1630"></stop><stop offset="0.928" stop-color="#4B0B1B"></stop></linearGradient>
        <linearGradient id="paint1_linear_5203_156" x1="263.021" x2="261.521" y1="22" y2="415" gradientUnits="userSpaceOnUse"><stop stop-color="#7C1630"></stop><stop offset="0.682" stop-color="#7C1630"></stop><stop offset="0.928" stop-color="#4B0B1B"></stop></linearGradient>
        <linearGradient id="paint2_linear_5203_156" x1="0" x2="650.439" y1="489.83" y2="489.83" gradientUnits="userSpaceOnUse"><stop stop-color="#7C1630"></stop><stop offset="0.682" stop-color="#7C1630"></stop><stop offset="0.928" stop-color="#4B0B1B"></stop></linearGradient>
        <linearGradient id="paint3_linear_5203_156" x1="905.074" x2="426.061" y1="514" y2="174.463" gradientUnits="userSpaceOnUse"><stop stop-color="#7C1630"></stop><stop offset="0.682" stop-color="#7C1630"></stop><stop offset="0.928" stop-color="#4B0B1B"></stop></linearGradient>
      </defs>
    </svg>
  `;

  // Configuração do editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        orderedList: false, // Desabilitar o padrão para usar o customizado abaixo
        paragraph: false, // Custom paragraph config
      }),
      Paragraph.configure({
        HTMLAttributes: {
          class: "my-custom-paragraph",
        },
      }).extend({
        addAttributes() {
          return {
            class: {
              default: null,
              parseHTML: element => element.getAttribute("class"),
              renderHTML: attributes => {
                return {
                  class: attributes.class,
                }
              },
            }
          }
        }
      }),
      ContractSlashCommand,
      BubbleMenuExtension,
      Underline,
      TextStyle,
      FontSize,
      TextAlign.configure({
        types: ['heading', 'paragraph', 'orderedList', 'listItem'],
        defaultAlignment: 'justify',
      }),
      Table.configure({
        resizable: true,
      }).extend({
        addAttributes() {
          return {
            class: {
              default: null,
              parseHTML: element => element.getAttribute("class"),
              renderHTML: attributes => {
                return {
                  class: attributes.class,
                }
              },
            }
          }
        }
      }),
      TableRow.extend({
        addAttributes() {
          return {
            class: {
              default: null,
              parseHTML: element => element.getAttribute("class"),
              renderHTML: attributes => {
                return {
                  class: attributes.class,
                }
              },
            }
          }
        }
      }),
      TableHeader,
      TableCell.extend({
        addAttributes() {
          return {
            class: {
              default: null,
              parseHTML: element => element.getAttribute("class"),
              renderHTML: attributes => {
                return {
                  class: attributes.class,
                }
              },
            }
          }
        }
      }),
      OrderedList.configure({
        keepMarks: true,
        keepAttributes: true,
      }).extend({
        addAttributes() {
          return {
            class: {
              default: "list-decimal ml-4", // Estilo padrão para listas normais
              parseHTML: element => element.getAttribute("class"),
              renderHTML: attributes => {
                return {
                  class: attributes.class,
                }
              },
            }
          }
        }
      }),
      PaginationPlus.configure({
        pageHeight: PAGE_SIZES.A4.pageHeight,
        pageWidth: PAGE_SIZES.A4.pageWidth,
        pageGap: 20,
        pageGapBorderSize: 1,
        pageGapBorderColor: "#f3f4f6",
        pageBreakBackground: "#f3f4f6",
        headerLeft: wideLogoSvg,
        footerRight: `
          <div style="display: flex; flex-direction: column; width: 100%; text-align: right;">
            ${separatorHtml}
            <div style="font-size: 10px; color: #888; line-height: 1.2; padding-top: 4px;">Página {page}</div>
          </div>
        `,
        footerLeft: `
        <div style="display: flex; flex: 1; text-align: left;">
        ${footerText}
        </div>
        `,
        marginTop: 40,
        marginBottom: 40,
        marginLeft: 60,
        marginRight: 40,
        contentMarginTop: 20,
        contentMarginBottom: 20,
      }),
    ],
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[in] p-0", // Removido p-8 pois a extensão lida com margens
        style: "font-family: Georgia, 'Times New Roman', serif; line-height: 1.8; font-size: 14px;",
      },
    },
    immediatelyRender: false,
  }, [footerText]);

  // Atualizar conteúdo quando 'sale' mudar
  // Atualizar conteúdo quando o editor estiver pronto
  useEffect(() => {
    if (editor) {
      // Gera o contrato (usa dados mockados internamente se sale for undefined)
      const baseContract = generateBaseContract(sale);
      editor.commands.setContent(baseContract);

      // Hack: Forçar atualização do layout para que a paginação seja calculada corretamente
      // A extensão PaginationPlus pode não detectar a altura correta imediatamente após o setContent
      // Disparar uma transação vazia força a re-avaliação
      setTimeout(() => {
        if (editor && !editor.isDestroyed) {
          editor.view.dispatch(editor.state.tr);
        }
      }, 500);
    }
  }, [sale, editor]);

  // Sempre mostrar o editor, usando dados mockados se não houver venda
  const displaySale = sale || {
    id: "mock",
    offer_id: "mock",
    status: "active" as const,
    current_step_index: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    steps: [],
    buyer: { name: "Comprador Exemplo" }, // Mock mínimo para display
  } as unknown as SaleProcess; // Cast simplificado para evitar erro de tipo no mock



  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-gray-100">
      <div className="flex items-center gap-4 py-4 px-6 border-b bg-white">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/contratos">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <div className="h-6 w-px bg-border" />
        <ContractToolbar editor={editor} />
        <Button onClick={() => window.print()} className="no-print">
          Print Content
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Editor à esquerda - Formato A4 com paginação via Extension */}
        <div className="flex-1 overflow-auto bg-gray-100 p-8 print-content-only">
          {/* Container flex para centralizar verticalmente e permitir scroll */}
          <div className="min-h-full flex flex-col items-center">
            {/* 
                Wrapper do Editor com PaginationPlus:
                A extensão desenha o background e páginas. 
                Precisamos garantir que o container não restrinja altura.
              */}
            <div
              className="relative"
            >
              <DragHandle editor={editor} />
              <ContractBubbleMenu editor={editor} />
              <style jsx global>{`
                  /* Garantir visibilidade de formatação rica */
                  .ProseMirror h4 {
                    font-weight: 800;
                    font-size: 1.2rem;
                    text-transform: uppercase;
                    text-align: center;
                    margin-top: 1em;
                    margin-bottom: 1em;
                    color: black;
                  }
                  .ProseMirror strong {
                    font-weight: 700 !important;
                    color: black;
                  }
                  .ProseMirror p {
                    margin-bottom: 1em;
                    text-align: justify;
                  }
                  /* Remove outline on focus */
                  .ProseMirror:focus {
                     outline: none;
                  }
               `}</style>
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>

        {/* Blocos de informações à direita */}
        <div className="w-80 border-l bg-white shrink-0 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-semibold text-sm text-gray-700">Dados do Contrato</h3>
            <p className="text-xs text-muted-foreground">Arraste os campos para o contrato</p>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
            <ContractDataBlocks sale={displaySale} />
          </div>
        </div>
      </div>
    </div>
  );
}


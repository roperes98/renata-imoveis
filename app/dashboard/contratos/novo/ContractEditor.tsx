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

interface ContractEditorProps {
  sale: SaleProcess | undefined;
}

export default function ContractEditor({ sale }: ContractEditorProps) {
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
        footerRight: "Página {page}",
        footerLeft: "Contrato de Compra e Venda",
        marginTop: 40,
        marginBottom: 40,
        marginLeft: 40,
        marginRight: 40,
        contentMarginTop: 20,
        contentMarginBottom: 20,
      }),
    ],
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[in] p-0", // Removido p-8 pois a extensão lida com margens
        style: "font-family: Georgia, 'Times New Roman', serif; line-height: 1.8;",
      },
    },
    immediatelyRender: false,
  });

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
    <div className="flex flex-col h-screen w-full overflow-hidden bg-gray-100">
      {/* <div className="flex items-center gap-4 py-4 px-6 border-b bg-white">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/contratos">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <div className="h-6 w-px bg-border" />
        <ContractToolbar editor={editor} />
      </div> */}

      <div className="flex-1 flex overflow-hidden">
        {/* Editor à esquerda - Formato A4 com paginação via Extension */}
        <div className="flex-1 overflow-auto bg-gray-100 p-8">
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
                    text-align: left;
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


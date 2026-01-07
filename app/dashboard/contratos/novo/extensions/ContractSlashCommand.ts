import {
  Command,
  getSuggestionItems,
  renderItems,
  CommandProps
} from "@/components/ui/editor-command";
import { Gavel } from "lucide-react";

export const getContractSuggestionItems = ({ query }: { query: string }) => {
  const baseItems = getSuggestionItems({ query });

  const customItems = [
    {
      title: "Cláusula",
      description: "Lista numerada de contrato",
      icon: Gavel,
      command: ({ editor, range }: CommandProps) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleOrderedList()
          .updateAttributes('orderedList', { class: 'contract-clauses' })
          .run();
      },
    }
  ];

  const allItems = [...customItems, ...baseItems];

  if (typeof query === "string" && query.length > 0) {
    return allItems.filter((item) =>
      item.title.toLowerCase().includes(query.toLowerCase())
    );
  }

  return allItems;
};

export const ContractSlashCommand = Command.configure({
  suggestion: {
    items: getContractSuggestionItems,
    render: renderItems,
  },
});

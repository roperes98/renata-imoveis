"use client";

import { useState, useEffect } from "react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Search } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  questions: FAQItem[];
}

export function FAQSection({ questions }: FAQSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [openItems, setOpenItems] = useState<string[]>([]);

  // Assign stable IDs to questions based on their original index
  const questionsWithIds = questions.map((q, i) => ({ ...q, id: `item-${i}` }));

  const filteredQuestions = questionsWithIds.filter(
    (item) =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (searchTerm) {
      setOpenItems(filteredQuestions.map((q) => q.id));
    } else {
      setOpenItems([]);
    }
  }, [searchTerm]);

  return (
    <>
      <InputGroup className="max-w-full mb-10 mt-10 border-none shadow-none h-auto bg-[#f5f6fa]">
        <InputGroupInput
          className="py-6 pl-4 text-lg font-semibold"
          placeholder="Pesquisar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <InputGroupAddon align="inline-end">
          <Search />
        </InputGroupAddon>
      </InputGroup>

      <Accordion type="multiple" value={openItems} onValueChange={setOpenItems}>
        {filteredQuestions.map((item) => (
          <AccordionItem key={item.id} value={item.id} className="mt-10 pb-9">
            <AccordionTrigger className="text-[#1e1e1e] text-md font-semibold text-left hover:no-underline !important">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-[#1e1e1e]/78 text-sm whitespace-pre-line">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
        {filteredQuestions.length === 0 && (
          <p className="text-center text-gray-500 py-4">Nenhuma pergunta encontrada.</p>
        )}
      </Accordion>
    </>
  );
}

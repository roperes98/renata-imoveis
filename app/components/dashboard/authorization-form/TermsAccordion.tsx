"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const TermsAccordion = () => {
  return (
    <div className="border rounded-lg p-4 border-gray-200">
      <h4 className="text-sm font-bold text-gray-900 mb-2">
        Termos e Condições
      </h4>

      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue=""
      >
        <AccordionItem value="item-1">
          <AccordionTrigger>Despesas Promocionais e Publicidade</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <p>
              Fica acordado que todas as despesas promocionais e publicidade na divulgação desse imóvel correrão por conta da
              CONTRATADA. A CONTRATADA fica autorizada a divulgar fotos e descrição deste imóvel, em todos os meios de
              divulgação
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Ônus e Documentação</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <p>
              A CONTRATANTE declara, sob penas da lei, que esse imóvel se encontra livre e desembaraçado de qualquer ônus para
              a efetivação da venda, obrigando-se o CONTRATANTE a entregar toda a documentação hábil, assim que solicitado,
              conforme praxe nesse tipo de transação comercial;
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Remuneração e Comissão</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <p>
              À título de remuneração da prestação deste serviço, a CONTRATADA receberá 5% do valor total da venda
              do imóvel acima citado, que serão pagos no ato da escritura de compra e venda do mesmo. Como comprovante de
              seus honorário, a CONTRATADA emitirá um recibo;
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-4">
          <AccordionTrigger>Foro e Lei Aplicável</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <p>
              Fica eleito o foro da cidade do Rio de Janeiro para as questões resultantes desse compromisso.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-5">
          <AccordionTrigger>Prazo do Contrato</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <p>
              O presente contrato é firmado pelo prazo de _____ (___________________) dias úteis, contratados dessa data, sendo
              renovado automaticamente, conforme interesse das partes.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-6">
          <AccordionTrigger>Assinatura Eletrônica</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <p>
              Ao clicar em "Enviar Autorização", você concorda com a captura destes dados para fins de auditoria e validação jurídica desta autorização digital.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

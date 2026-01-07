"use client";

import { useActionState } from "react";
// fallback for older React versions if useActionState is not available, use useFormState from react-dom
// But let's assume standard Next.js 14/15 setup.
// If it fails, I'll switch to basic form.
import { createProposal } from "@/app/lib/actions";
import Link from "next/link";
import { Client } from "@/app/lib/types/database";

// Basic useFormState implementation if needed, but assuming modern next.
import { useFormState } from "react-dom";

interface ProposalFormProps {
  propertyId: string;
  clients: Client[];
}

export default function ProposalForm({ propertyId, clients }: ProposalFormProps) {
  const [state, formAction] = useFormState(createProposal, undefined);

  return (
    <form action={formAction} className="space-y-6 bg-white p-6 rounded-lg shadow">
      {state && (
        <div className="p-3 bg-red-100 text-red-700 rounded mb-4">
          {state}
        </div>
      )}

      <input type="hidden" name="property_id" value={propertyId} />

      <div>
        <label className="block text-sm font-medium text-gray-700">Cliente</label>
        <select
          name="client_id"
          required
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#960000] focus:border-[#960000]"
        >
          <option value="">Selecione um cliente</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name} ({client.email || client.phone})
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          <Link href="/dashboard/clientes" className="text-[#960000] hover:underline">Novo Cliente?</Link>
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Valor da Proposta (R$)</label>
        <input
          type="number"
          name="offer_amount"
          step="0.01"
          required
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#960000] focus:border-[#960000]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Forma de Pagamento</label>
        <select
          name="payment_type"
          required
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#960000] focus:border-[#960000]"
        >
          <option value="cash">À Vista</option>
          <option value="financing">Financiamento</option>
          <option value="mixed">Misto (Entrada + Financiamento)</option>
          <option value="rent_to_own">Aluguel com Opção de Compra</option>
          <option value="other">Outro</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Observações</label>
        <textarea
          name="notes"
          rows={3}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#960000] focus:border-[#960000]"
        />
      </div>

      <div className="flex justify-end gap-4">
        <Link
          href={`/dashboard/proposals/${propertyId}`}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#960000] hover:bg-[#7a0000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#960000]"
        >
          Salvar Proposta
        </button>
      </div>
    </form>
  );
}

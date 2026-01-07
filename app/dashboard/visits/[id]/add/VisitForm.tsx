"use client";

import { useFormState } from "react-dom";
import { createVisit } from "@/app/lib/actions";
import Link from "next/link";
import { Client, Agent } from "@/app/lib/types/database";

interface VisitFormProps {
  propertyId: string;
  clients: Client[];
  agents: Agent[];
}

export default function VisitForm({ propertyId, clients, agents }: VisitFormProps) {
  const [state, formAction] = useFormState(createVisit, undefined);

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
        <label className="block text-sm font-medium text-gray-700">Corretor Responsável</label>
        <select
          name="agent_id"
          required
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#960000] focus:border-[#960000]"
        >
          <option value="">Selecione um corretor</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.full_name || agent.name || agent.email}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Data e Hora</label>
        <input
          type="datetime-local"
          name="scheduled_at"
          required
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#960000] focus:border-[#960000]"
        />
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
          href={`/dashboard/visits/${propertyId}`}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#960000] hover:bg-[#7a0000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#960000]"
        >
          Agendar Visita
        </button>
      </div>
    </form>
  );
}

import { MOCK_SALE_DATA } from "./mock-sale-data";
import ContractEditor from "./ContractEditor";

interface PageProps {
  searchParams: Promise<{ saleId?: string }>;
}

export default async function NewContractPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Use the detailed mock data for testing the contract editor
  const selectedSale = MOCK_SALE_DATA;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Novo Contrato</h1>
        <p className="text-gray-500 mt-1">
          Gere e edite o contrato baseado nos dados da venda
        </p>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <ContractEditor sale={selectedSale} />
      </div>
    </div>
  );
}


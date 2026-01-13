
import { getSales } from "@/app/lib/sales-service";
import Link from "next/link";
import { FaBuilding, FaUser, FaRegMoneyBillAlt } from "react-icons/fa";

export default async function SalesPage() {
  const sales = await getSales();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-[27px] font-bold text-gray-900">Vendas</h2>
        <p className="mt-1 text-gray-500">
          Gerencie suas vendas ativas e acompanhe o progresso de cada negociação.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sales.map((sale) => {
          const currentStep = sale.steps[sale.current_step_index];
          const progress = ((sale.current_step_index) / sale.steps.length) * 100;

          const getPaymentLabel = (type?: string) => {
            switch (type) {
              case 'cash': return 'À Vista';
              case 'financing': return 'Financiamento';
              case 'mixed': return 'Misto';
              case 'rent_to_own': return 'Aluguel com Opção';
              default: return 'Outro';
            }
          };

          return (
            <Link href={`/dashboard/vendas/${sale.id}`} key={sale.id} className="block group">
              <div className="bg-white rounded-[24px] p-8 border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300">
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-[#960000]">
                      <FaBuilding size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#960000] transition-colors">
                        {sale.property?.code || "REF-XXXX"} - {sale.property?.type ? sale.property.type.charAt(0).toUpperCase() + sale.property.type.slice(1) : "Imóvel"}
                      </h3>
                      <p className="text-gray-500">
                        {sale.property?.address_neighborhood}, {sale.property?.address_city}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium self-start">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    {sale.status === 'active' ? 'Em Andamento' : 'Concluído'}
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-lg text-gray-500">
                      <FaUser size={14} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-xs uppercase tracking-wider">Comprador</span>
                      <span className="font-semibold text-gray-900">{sale.buyer?.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-lg text-gray-500">
                      <FaUser size={14} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-xs uppercase tracking-wider">Vendedor</span>
                      <span className="font-semibold text-gray-900">{sale.seller?.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-lg text-gray-500">
                      <FaRegMoneyBillAlt size={14} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-xs uppercase tracking-wider">Valor e Pagamento</span>
                      <span className="font-semibold text-gray-900">
                        {sale.offer?.offer_amount
                          ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.offer.offer_amount)
                          : "R$ 0,00"}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">
                        {getPaymentLabel(sale.offer?.payment_type)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <span className="text-sm font-medium text-gray-900">Etapa Atual: </span>
                      <span className="text-sm text-[#960000] font-semibold">{currentStep?.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">{Math.round(progress)}% Concluído</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-[#960000] h-full rounded-full transition-all duration-500 ease-out relative"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 skew-x-12 w-full animate-[shimmer_2s_infinite]"></div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-gray-500 line-clamp-1">
                    {currentStep?.description}
                  </p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  );
}

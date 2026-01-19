import { RealEstate, PropertyDisplay } from "../../lib/types/database";
import { formatPrice, getPropertyTypeLabel } from "../../lib/utils/format";
import PropertiesActions from "./PropertiesActions";
import Link from "next/link";
import { FaBuilding, FaPlus } from "react-icons/fa";

interface PropertiesTableProps {
  properties: PropertyDisplay[];
}

export default function PropertiesTable({ properties }: PropertiesTableProps) {
  return (
    <div className="h-full w-full rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 text-[#8B735B] mb-1">
        <FaBuilding className="text-xs" />
        <span className="text-xs font-bold tracking-wider uppercase">PORTFÓLIO</span>
      </div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-medium text-[#1C1C1C]">Imóveis</h2>
        <Link
          href="/dashboard/imoveis/novo"
          className="flex items-center gap-2 px-4 py-2 bg-[#960000] text-white rounded-lg hover:bg-[#7a0000] transition-colors font-medium text-sm shadow-sm"
        >
          <FaPlus />
          <span>Adicionar Imóvel</span>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 rounded-lg">
            <tr>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider first:rounded-l-lg w-20"
              >
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Imóvel
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Tipo
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Proprietário
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Atualizado
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Criado em
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider last:rounded-r-lg">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {properties.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  Nenhum imóvel encontrado.
                </td>
              </tr>
            ) : (
              properties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50 transition-colors border-b border-transparent hover:border-gray-100 last:border-0">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-16 w-16 flex-shrink-0">
                      {property.images && property.images[0] ? (
                        <img
                          className="h-16 w-16 rounded-lg object-cover"
                          src={property.images[0].url}
                          alt={property.code}
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                          No Img
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {property.code}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatPrice(property.sale_price)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {getPropertyTypeLabel(property.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {property.real_estate_owners && property.real_estate_owners.length > 0
                      ? property.real_estate_owners[0].client.name
                      : <span className="text-gray-400 italic">N/A</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(property.updated_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(property.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${property.status === "for_sale"
                        ? "bg-green-100 text-green-800"
                        : property.status === "sold"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                        }`}
                    >
                      {property.status === "for_sale"
                        ? "Active"
                        : property.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                    <PropertiesActions propertyId={property.id} propertyCode={property.code} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


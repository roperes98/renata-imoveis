import { RealEstate, PropertyDisplay } from "../lib/types/database";
import { formatPrice, getPropertyTypeLabel } from "../lib/utils/format";
import DashboardActions from "./DashboardActions";

interface DashboardTableProps {
  properties: PropertyDisplay[];
}

export default function DashboardTable({ properties }: DashboardTableProps) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Imóvel
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Tipo
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Criado em
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Atualizado
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Proprietário
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {properties.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                Nenhum imóvel encontrado.
              </td>
            </tr>
          ) : (
            properties.map((property) => (
              <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      {property.images && property.images[0] ? (
                        <img
                          className="h-10 w-10 rounded object-cover"
                          src={property.images[0]}
                          alt={property.code}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                          No Img
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {property.code}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatPrice(property.sale_price)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {getPropertyTypeLabel(property.type)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(property.created_at).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(property.updated_at).toLocaleDateString("pt-BR")}
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {property.real_estate_owners && property.real_estate_owners.length > 0
                    ? property.real_estate_owners[0].client.name
                    : <span className="text-gray-400 italic">N/A</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                  <DashboardActions propertyId={property.id} propertyCode={property.code} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

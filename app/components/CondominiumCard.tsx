import Link from "next/link";
import CondominiumImage from "./CondominiumImage";
import type { CondominiumDisplay } from "../lib/supabase/properties";

type CondominiumCardProps = {
  condominium: CondominiumDisplay;
  imageUrl?: string | null;
  index?: number;
};

// Helper function to format delivery date
function formatDeliveryDate(dateString: string | null | undefined): string | null {
  if (!dateString) return null;

  try {
    const date = new Date(dateString);
    const monthNames = [
      "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
      "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${year}`;
  } catch {
    return null;
  }
}

export default function CondominiumCard({ condominium, imageUrl }: CondominiumCardProps) {
  const address = condominium.condominium_addresses?.[0];
  const constructionInfo = condominium.construction_infos?.[0];

  // Generate REF code from ID (convert UUID to number and take last 3 digits)
  const idHash = condominium.id.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  const refCode = String(idHash % 1000).padStart(3, '0');

  const deliveryDate = formatDeliveryDate(constructionInfo?.delivery_forecast);

  return (
    <Link href={`/condominios/${condominium.id}`}>
      <div
        className="bg-white rounded-lg overflow-hidden shadow-md hover:cursor-pointer hover:shadow-xl transition-shadow w-[276px] h-[525px] border border-gray-outline flex flex-col"
      >
        <CondominiumImage
          imageUrl={imageUrl}
          alt={condominium.name}
          stage={constructionInfo?.stage}
        />
        <div className="px-[18px] pt-[25px] pb-[18px] mb-3.5 flex flex-col flex-1">
          <span className="text-[#5E5E5E] text-xs">
            REF: {refCode}
          </span>
          <div className="mb-auto">
            <h3 className="text-xl font-bold text-[#1e1e1e]">
              {condominium.name}
            </h3>
            {deliveryDate && (
              <p className="text-[#5E5E5E] text-sm">
                Entrega: {deliveryDate}
              </p>
            )}
          </div>
          <div className="space-y-1">
            {address && (
              <>
                <p className="text-[#5E5E5E] text-sm">
                  {address.street}, {address.number}
                </p>
                <p className="text-[#5E5E5E] text-sm">
                  {address.neighborhood}, {address.state}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}


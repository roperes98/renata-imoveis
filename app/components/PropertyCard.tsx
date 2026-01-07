import Link from "next/link";
import PropertyImage from "./PropertyImage";
import { formatPrice, formatArea, getPropertyTypeLabel } from "../lib/utils/format";
import type { RealEstate } from "../lib/types/database";
import { TfiRulerAlt2 } from "react-icons/tfi"
import { PiBathtub } from "react-icons/pi"
import { IoBedOutline, IoCarSportOutline } from "react-icons/io5"

type PropertyCardProps = {
  property: RealEstate;
  imageUrl?: string | null;
  index: number;
  className?: string;
};

export default function PropertyCard({ property, imageUrl, index, className = "" }: PropertyCardProps) {
  // Check if property is new (created less than 1 month ago)
  const createdAt = new Date(property.created_at);
  const now = new Date();
  const diffInMs = now.getTime() - createdAt.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24); // Convert to days
  const isNew = diffInDays < 30; // Less than 30 days (1 month)

  return (
    <Link href={`/imoveis/${property.code}`} className={`block ${className}`}>
      <div
        className="bg-white flex flex-col rounded-lg overflow-hidden shadow-md hover:cursor-pointer hover:shadow-xl transition-shadow w-full h-[432px] border border-gray-outline"
      >
        <PropertyImage
          imageUrl={imageUrl}
          alt={getPropertyTypeLabel(property.type)}
          isNew={isNew}
        />
        <div className="px-[18px] py-[22px] flex flex-col flex-1">
          <h3 className="text-sm text-[#303030] mb-3">
            {getPropertyTypeLabel(property.type)}
          </h3>
          <p className="text-xl font-bold text-on-surface mb-6">
            {formatPrice(property.sale_price)}
          </p>
          <p className="text-[#4f4f4f] text-sm">
            {property.address_street}, {property.address_number}
          </p>
          <p className="text-[#4f4f4f] text-sm mb-4">
            {property.address_neighborhood}, {property.address_state}
          </p>
          <div className="flex items-center justify-between text-sm text-[#000000] mt-auto">
            <div className="flex items-center gap-2">
              <TfiRulerAlt2 size={16} className="text-[#B22A22]" />
              <span className="text-xs font-medium text-center">{formatArea(property.usable_area)}</span>
            </div>
            <div className="h-5 w-px bg-[#B22A22]/50" />
            <div className="flex items-center gap-2">
              <IoBedOutline size={20} className="text-[#B22A22]" />
              <span className="text-xs font-medium text-center">
                {property.bedrooms}
              </span>
            </div>
            <div className="h-5 w-px bg-[#B22A22]/50" />
            <div className="flex items-center gap-2">
              <PiBathtub size={20} className="text-[#B22A22]" />
              <span className="text-xs font-medium text-center">
                {property.bathrooms}
              </span>
            </div>
            <div className="h-5 w-px bg-[#B22A22]/50" />
            <div className="flex items-center gap-2">
              <IoCarSportOutline size={20} className="text-[#B22A22]" />
              <span className="text-xs font-medium text-center">
                {property.parking_spaces}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}


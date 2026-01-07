import Image from "next/image";

type NeighborhoodsCardProps = {
  imageUrl: string;
  name: string;
};

export default function NeighborhoodsCard({ imageUrl, name }: NeighborhoodsCardProps) {
  return (
    <div
      className="flex items-center bg-white rounded-lg overflow-hidden shadow-md hover:cursor-pointer hover:shadow-xl transition-shadow w-[309px] h-[90px] border border-gray-outline"
    >
      <Image
        src={imageUrl}
        alt={name}
        width={64}
        height={68}
        className="object-cover rounded-lg ml-2.5 border border-gray-outline"
      />
      <div className="pl-[24px] pr-[80px] py-[25px]">
        <span className="text-[#1e1e1e] text-md font-bold opacity-84">
          {name}
        </span>
      </div>
    </div>
  );
}


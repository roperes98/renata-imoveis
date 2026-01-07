import Image from "next/image";

type CategoriesCardProps = {
  imageUrl: string;
  title: string;
  description: string;
};

export default function CategoriesCard({ imageUrl, title, description }: CategoriesCardProps) {
  return (
    <div
      className="flex items-center bg-white rounded-lg overflow-hidden shadow-md hover:cursor-pointer hover:shadow-xl transition-shadow w-[546px] h-[165px] border border-gray-outline"
    >
      <Image
        src={imageUrl}
        alt={title}
        width={240}
        height={165}
      />
      <div className="pl-[24px] pr-[80px] py-[25px]">
        <h3 className="text-xl font-bold text-[#1e1e1e] mb-4">
          {title}
        </h3>
        <span className="text-[#5E5E5E] text-sm">
          {description}
        </span>
      </div>
    </div>
  );
}


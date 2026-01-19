
import { Skeleton } from "@/components/ui/skeleton";

export default function PropertyCardSkeleton() {
  return (
    <div className="w-full max-w-[276px] h-[432px] bg-white rounded-lg shadow-md overflow-hidden flex flex-col border border-gray-outline">
      {/* Image Skeleton - Matching PropertyImage height roughly (h-51 ~ 204px) */}
      <div className="relative h-[204px] w-full shrink-0">
        <Skeleton className="h-full w-full" />
      </div>

      <div className="px-[18px] py-[22px] flex flex-col flex-1 min-h-0">
        {/* Type Skeleton */}
        <Skeleton className="h-[14px] w-1/3 mb-3" />

        {/* Price Skeleton */}
        <Skeleton className="h-7 w-1/2 mb-6" />

        {/* Address Skeletons */}
        <Skeleton className="h-[14px] w-3/4 mb-1" />
        <Skeleton className="h-[14px] w-2/3 mb-4" />

        {/* Features Divider */}
        <div className="mt-auto flex items-center justify-between pt-4">
          {/* Area */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-3 w-8" />
          </div>
          <div className="h-5 w-px bg-gray-200" />
          {/* Bedrooms */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-3 w-4" />
          </div>
          <div className="h-5 w-px bg-gray-200" />
          {/* Bathrooms */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-3 w-4" />
          </div>
          <div className="h-5 w-px bg-gray-200" />
          {/* Parking */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-3 w-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

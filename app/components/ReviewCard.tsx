import Link from "next/link";

interface ReviewCardProps {
  authorName: string;
  rating: number;
  text: string;
  relativeTime: string;
  profilePhotoUrl?: string;
  reviewUrl?: string;
  authorUrl?: string; // URL to the reviewer's profile if available
}

export default function ReviewCard({
  authorName,
  rating,
  text,
  relativeTime,
  profilePhotoUrl,
  reviewUrl,
  authorUrl,
}: ReviewCardProps) {
  return (
    <Link
      href={reviewUrl || "https://www.google.com/maps"}
      target="_blank"
      rel="noopener noreferrer"
      className="block h-full"
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-6 flex flex-col h-full shadow-md hover:cursor-pointer hover:shadow-xl transition-shadow cursor-pointer">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {profilePhotoUrl && (
              <img
                src={profilePhotoUrl}
                alt={authorName}
                className="w-10 h-10 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            )}
            <div>
              <p className="text-lg font-semibold text-[#1e1e1e] line-clamp-1">
                {authorName}
              </p>
              <p className="text-sm text-gray-500">{relativeTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {Array.from({ length: 5 }).map((_, starIndex) => (
              <span
                key={starIndex}
                className={`text-lg ${starIndex < rating ? "text-[#f4b400]" : "text-gray-300"
                  }`}
              >
                ★
              </span>
            ))}
          </div>
        </div>
        <p className="text-[#4f4f4f] leading-relaxed mb-4 flex-grow line-clamp-4">
          {text}
        </p>
        <div className="flex items-center gap-2 text-sm font-semibold text-[#4285f4] mt-auto">
          <span className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-base shrink-0 p-1.5">
            <img
              src="/google-maps-icon.svg"
              alt="Google Maps"
              className="w-full h-full object-contain"
            />
          </span>
          <span className="text-[#4f4f4f] font-normal">Google Maps</span>
        </div>
      </div>
    </Link>
  );
}

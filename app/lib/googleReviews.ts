type PlaceReview = {
  author_name: string;
  rating: number;
  text: string;
  relative_time_description?: string;
  profile_photo_url?: string;
};

export type GoogleReview = {
  authorName: string;
  rating: number;
  text: string;
  relativeTime: string;
  profilePhotoUrl?: string;
};

// Fetch latest Google Maps reviews for the configured place.
export async function getGoogleReviews(): Promise<GoogleReview[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const placeId = process.env.GOOGLE_MAPS_PLACE_ID;

  if (!apiKey || !placeId) {
    return [];
  }

  const fields = "name,rating,user_ratings_total,reviews";
  const params = new URLSearchParams({
    place_id: placeId,
    fields,
    reviews_no_translations: "true",
    reviews_sort: "newest",
    key: apiKey,
  });

  const url = `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`;

  try {
    const response = await fetch(url, {
      // Cache for an hour to reduce API calls.
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const reviews: PlaceReview[] = data?.result?.reviews ?? [];

    return reviews.slice(0, 3).map((review) => ({
      authorName: review.author_name,
      rating: review.rating,
      text: review.text,
      relativeTime: review.relative_time_description ?? "",
      profilePhotoUrl: review.profile_photo_url,
    }));
  } catch (error) {
    console.error("Failed to fetch Google reviews", error);
    return [];
  }
}



























import { google } from "googleapis";

export type GoogleReview = {
  authorName: string;
  rating: number;
  text: string;
  relativeTime: string;
  profilePhotoUrl?: string;
  reviewUrl?: string;
};

// Place ID for Renata Imoveis
const PLACE_ID = "ChIJy3vqguR9mQARqi6ZRq3Gg6M";
const REVIEW_LINK_BASE = `https://search.google.com/local/reviews?placeid=${PLACE_ID}`;

const MOCK_REVIEWS: GoogleReview[] = [
  {
    authorName: "Silene Maria Delduque Lima",
    rating: 5,
    text: "Renata Imóveis conseguiu me atender plenamente. Além de vender um apto. de minha mãe, Renata vendeu o meu apto. e me ajudou muito na compra de um apto. que atendia às minhas necessidades. Ela tem uma sensibilidade e uma organização em todo processo que dão a segurança e a tranquilidade necessárias para uma boa compra/ venda. Me senti plenamente atendida e segura durante todo o processo de compra/ venda. Recomendo muito o trabalho da Renata Imóveis.",
    relativeTime: "há uma semana",
    profilePhotoUrl: "https://lh3.googleusercontent.com/a/default-user=s128-c",
    reviewUrl: REVIEW_LINK_BASE,
  },
  {
    authorName: "Andréia Grain",
    rating: 5,
    text: "Renata superou muito as minhas expectativas! Tudo resolvido muito rápido e com muita excelência! Melhor corretora que já conheci!",
    relativeTime: "há 2 meses",
    profilePhotoUrl: "https://lh3.googleusercontent.com/a/default-user=s128-c",
    reviewUrl: REVIEW_LINK_BASE,
  },
  {
    authorName: "Katia Maria Ferreira",
    rating: 4,
    text: "A Renata é uma excelente profissional. Obrigada pelo carinho e dedicação. Sempre vou lembrar com grande felicidade o quanto ela se mostrou disponível em me ajudar do início ao fim nessa minha realização. SUPER RECOMENDO!",
    relativeTime: "há 3 meses",
    profilePhotoUrl: "https://lh3.googleusercontent.com/a/default-user=s128-c",
    reviewUrl: REVIEW_LINK_BASE,
  },
];

export async function getBusinessReviews(): Promise<GoogleReview[]> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const accountId = process.env.GOOGLE_ACCOUNT_ID;
  const locationId = process.env.GOOGLE_LOCATION_ID;

  if (!clientId || !clientSecret || !refreshToken || !accountId || !locationId) {
    console.warn("Google OAuth credentials or Account/Location IDs missing. Using Mock Data.");
    return MOCK_REVIEWS;
  }

  try {
    const auth = new google.auth.OAuth2(clientId, clientSecret);
    auth.setCredentials({ refresh_token: refreshToken });

    // Construct the resource name directly using the known IDs.
    // Format: accounts/{accountId}/locations/{locationId}
    const resourceName = `accounts/${accountId}/locations/${locationId}/reviews`;

    const url = `https://mybusiness.googleapis.com/v4/${resourceName}`;

    // Check if we need to paginate or request more? 
    // The default pageRequest might be small, let's try strict default first but slice higher.

    const res = await auth.request({
      url,
      method: "GET",
      params: {
        pageSize: 20 // Request more reviews
      }
    });

    const data = res.data as any;

    if (data && data.reviews && Array.isArray(data.reviews)) {
      return data.reviews.map((r: any) => ({
        authorName: r.reviewer?.displayName ?? "Anônimo",
        rating: ["ONE", "TWO", "THREE", "FOUR", "FIVE"].indexOf(r.starRating) + 1,
        text: r.comment ?? "",
        relativeTime: r.createTime ? new Date(r.createTime).toLocaleDateString("pt-BR") : "",
        profilePhotoUrl: r.reviewer?.profilePhotoUrl,
        reviewUrl: r.name ? `https://www.google.com/maps/contrib/${r.reviewer?.name?.split('/')[1] || ''}/place/${PLACE_ID}` : REVIEW_LINK_BASE
        // Note: Constructing individual review links is hard without the specific review ID format known for public URLs.
        // Fallback to the general reviews link is safer and better UX than a broken deep link.
        // Let's use the General Review Link for all for consistency, as 'r.name' is internal API ID.
        // Actually, let's just use the REVIEW_LINK_BASE for all.
      })).map((r: GoogleReview) => ({ ...r, reviewUrl: REVIEW_LINK_BASE })).slice(0, 20);
    }

    return MOCK_REVIEWS;

  } catch (error) {
    console.error("Error fetching Google Reviews:", error);
    return MOCK_REVIEWS;
  }
}

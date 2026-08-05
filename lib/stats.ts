import { createClient } from "./supabase/server";

export type BusinessStats = {
  totalTestimonials: number;
  approvedTestimonials: number;
  cardsGenerated: number;
  averageRating: number;
};

export async function getBusinessStats(businessId: string): Promise<BusinessStats> {
  const supabase = await createClient();

  const [totalRes, approvedRatingsRes, cardsRes] = await Promise.all([
    supabase
      .from("testimonials")
      .select("*", { count: "exact", head: true })
      .eq("business_id", businessId),
    supabase
      .from("testimonials")
      .select("rating")
      .eq("business_id", businessId)
      .eq("status", "approved"),
    supabase
      .from("card_generations")
      .select("*", { count: "exact", head: true })
      .eq("business_id", businessId),
  ]);

  const approvedRatings = approvedRatingsRes.data ?? [];
  const approvedTestimonials = approvedRatings.length;
  const averageRating =
    approvedTestimonials > 0
      ? approvedRatings.reduce((sum, t) => sum + t.rating, 0) / approvedTestimonials
      : 0;

  return {
    totalTestimonials: totalRes.count ?? 0,
    approvedTestimonials,
    cardsGenerated: cardsRes.count ?? 0,
    averageRating,
  };
}

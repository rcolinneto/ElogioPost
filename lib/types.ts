export type TestimonialStatus = "pending" | "approved" | "rejected";

export type BusinessPlan = "free" | "paid";
export type SubscriptionStatus = "inactive" | "active" | "overdue" | "canceled";

export type Business = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  plan: BusinessPlan;
  subscription_status: SubscriptionStatus;
  asaas_customer_id: string | null;
  asaas_subscription_id: string | null;
  billing_document: string | null;
  whatsapp_template: string;
  qr_headline: string;
  carousel_cta_text: string;
  card_style: string;
  logo_path: string | null;
  brand_color: string | null;
  instagram_handle: string | null;
  whatsapp_number: string | null;
  qr_background_path: string | null;
  qr_band_style: "light" | "dark";
  google_place_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Testimonial = {
  id: string;
  business_id: string;
  client_name: string;
  rating: number;
  body: string;
  screenshot_path: string | null;
  status: TestimonialStatus;
  caption: string | null;
  created_at: string;
  reviewed_at: string | null;
};

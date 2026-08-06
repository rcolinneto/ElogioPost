import { ImageResponse } from "next/og";
import { NextResponse, type NextRequest } from "next/server";
import { getCurrentBusiness } from "@/lib/business";
import { createClient } from "@/lib/supabase/server";
import { resolveCardStyle, applyBrandColor } from "@/lib/cardStyles";
import { loadCardFonts } from "@/lib/cardFonts";
import { renderTestimonialCard, CARD_SIZES, type CardFormat } from "@/lib/cardRender";
import { isPaidPlan } from "@/lib/plan";

function parseFormat(value: string | null): CardFormat {
  if (value === "stories" || value === "google") return value;
  return "feed";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const format = parseFormat(request.nextUrl.searchParams.get("formato"));
  const { width, height } = CARD_SIZES[format];

  const business = await getCurrentBusiness();
  if (!business) {
    return new NextResponse("Não autorizado.", { status: 401 });
  }

  const supabase = await createClient();
  const { data: testimonial } = await supabase
    .from("testimonials")
    .select("client_name, rating, body, status, screenshot_path")
    .eq("id", id)
    .eq("business_id", business.id)
    .single();

  if (!testimonial || testimonial.status !== "approved") {
    return new NextResponse("Depoimento não encontrado.", { status: 404 });
  }

  let backgroundUrl: string | null = null;
  if (testimonial.screenshot_path) {
    const { data } = await supabase.storage
      .from("whatsapp-screenshots")
      .createSignedUrl(testimonial.screenshot_path, 60);
    backgroundUrl = data?.signedUrl ?? null;
  }

  // Escolher estilo é recurso do plano Pago — no Free ignora o parâmetro da
  // URL (que dá pra manipular direto) e sempre usa o estilo padrão salvo.
  const styleParam = isPaidPlan(business)
    ? request.nextUrl.searchParams.get("estilo")
    : null;
  const baseStyle = resolveCardStyle(styleParam ?? business.card_style);
  const style = applyBrandColor(baseStyle, business.brand_color);
  const fonts = await loadCardFonts();

  const logoUrl = business.logo_path
    ? supabase.storage.from("business-assets").getPublicUrl(business.logo_path).data.publicUrl
    : null;

  return new ImageResponse(
    renderTestimonialCard(
      style,
      format,
      {
        clientName: testimonial.client_name,
        rating: testimonial.rating,
        body: testimonial.body,
        businessName: business.name,
        logoUrl,
      },
      backgroundUrl,
    ),
    {
      width,
      height,
      fonts,
      headers: {
        "Content-Disposition": `attachment; filename="depoimento-${testimonial.client_name}-${format}.png"`,
        "Cache-Control": "no-store",
      },
    },
  );
}

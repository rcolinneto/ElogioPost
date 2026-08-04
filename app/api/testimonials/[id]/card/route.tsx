import { ImageResponse } from "next/og";
import { NextResponse, type NextRequest } from "next/server";
import { getCurrentBusiness } from "@/lib/business";
import { createClient } from "@/lib/supabase/server";
import { resolveCardStyle } from "@/lib/cardStyles";
import { loadCardFonts } from "@/lib/cardFonts";
import { renderTestimonialCard, CARD_SIZES, type CardFormat } from "@/lib/cardRender";

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

  const styleParam = request.nextUrl.searchParams.get("estilo");
  const style = resolveCardStyle(styleParam ?? business.card_style);
  const fonts = await loadCardFonts();

  return new ImageResponse(
    renderTestimonialCard(
      style,
      format,
      {
        clientName: testimonial.client_name,
        rating: testimonial.rating,
        body: testimonial.body,
        businessName: business.name,
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

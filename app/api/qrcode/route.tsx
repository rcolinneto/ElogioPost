import QRCode from "qrcode";
import { ImageResponse } from "next/og";
import { NextResponse, type NextRequest } from "next/server";
import { getCurrentBusiness } from "@/lib/business";
import { createClient } from "@/lib/supabase/server";
import { QrCtaCard } from "@/lib/qrCard";
import { resolveCardStyle } from "@/lib/cardStyles";
import { loadCardFonts } from "@/lib/cardFonts";
import { isPaidPlan } from "@/lib/plan";

const PLAQUINHA_SIZE = 1200;
const CARROSSEL_SIZE = 1080;

export async function GET(request: NextRequest) {
  const business = await getCurrentBusiness();
  if (!business) {
    return new NextResponse("Não autorizado.", { status: 401 });
  }
  if (!isPaidPlan(business)) {
    return new NextResponse("QR code é um recurso do plano Pago.", { status: 402 });
  }

  const formatoParam = request.nextUrl.searchParams.get("formato");
  const formato =
    formatoParam === "puro" || formatoParam === "carrossel" ? formatoParam : "plaquinha";

  const host = request.headers.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const reviewUrl = `${protocol}://${host}/${business.slug}/review`;

  if (formato === "puro") {
    const buffer = await QRCode.toBuffer(reviewUrl, {
      type: "png",
      width: PLAQUINHA_SIZE,
      margin: 2,
      color: { dark: "#000000ff", light: "#ffffffff" },
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="qrcode-${business.slug}.png"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const size = formato === "carrossel" ? CARROSSEL_SIZE : PLAQUINHA_SIZE;
  const headline = formato === "carrossel" ? business.carousel_cta_text : business.qr_headline;
  const filename =
    formato === "carrossel"
      ? `carrossel-slide2-${business.slug}.png`
      : `plaquinha-${business.slug}.png`;

  // O estilo escolhido pelo negócio resolve pros dois formatos agora — o
  // slide do carrossel herda o visual inteiro (fundo/cor/fonte), a
  // plaquinha só as fontes (fundo/cor dela continuam fixos, ver QrCtaCard).
  const resolvedStyle = resolveCardStyle(
    request.nextUrl.searchParams.get("estilo") ?? business.card_style,
  );
  const cardStyle = formato === "carrossel" ? resolvedStyle : undefined;

  // Bucket público — não precisa de signed URL, só monta o link.
  const supabase = await createClient();
  const publicUrl = (path: string) =>
    supabase.storage.from("business-assets").getPublicUrl(path).data.publicUrl;

  const logoUrl = business.logo_path ? publicUrl(business.logo_path) : null;

  // Foto de fundo + faixa atrás do QR só existem na plaquinha (não no slide
  // do carrossel, que já tem seu próprio visual pelo estilo do card).
  const backgroundImageUrl =
    formato === "plaquinha" && business.qr_background_path
      ? publicUrl(business.qr_background_path)
      : null;
  const bandIsDark = formato === "plaquinha" && !!backgroundImageUrl && business.qr_band_style === "dark";
  const bandColor = bandIsDark ? "#000000" : "#ffffff";

  const accentColor = business.brand_color ?? cardStyle?.accentColor;

  const qrDataUrl = await QRCode.toDataURL(reviewUrl, {
    width: Math.round(size * 0.52),
    margin: 1,
    // QR com fundo escuro precisa de módulos claros — direto sobre uma
    // faixa preta, um QR preto-no-preto simplesmente não escaneia.
    color: bandIsDark
      ? { dark: "#ffffffff", light: "#000000ff" }
      : { dark: "#000000ff", light: "#ffffffff" },
  });

  // Os dois formatos usam fonte customizada agora.
  const fonts = await loadCardFonts();

  return new ImageResponse(
    (
      <QrCtaCard
        width={size}
        height={size}
        headline={headline}
        qrDataUrl={qrDataUrl}
        businessName={business.name}
        qrSize={Math.round(size * 0.42)}
        style={cardStyle}
        displayFont={resolvedStyle.displayFont}
        supportFont={resolvedStyle.supportFont}
        backgroundImageUrl={backgroundImageUrl}
        bandColor={bandColor}
        accentColor={accentColor}
        logoUrl={logoUrl}
      />
    ),
    {
      width: size,
      height: size,
      fonts,
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    },
  );
}

import QRCode from "qrcode";
import { ImageResponse } from "next/og";
import { NextResponse, type NextRequest } from "next/server";
import { getCurrentBusiness } from "@/lib/business";
import { QrCtaCard } from "@/lib/qrCard";

const PLAQUINHA_SIZE = 1200;
const CARROSSEL_SIZE = 1080;

export async function GET(request: NextRequest) {
  const business = await getCurrentBusiness();
  if (!business) {
    return new NextResponse("Não autorizado.", { status: 401 });
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

  const qrDataUrl = await QRCode.toDataURL(reviewUrl, {
    width: Math.round(size * 0.52),
    margin: 1,
    color: { dark: "#000000ff", light: "#ffffffff" },
  });

  return new ImageResponse(
    (
      <QrCtaCard
        width={size}
        height={size}
        headline={headline}
        qrDataUrl={qrDataUrl}
        businessName={business.name}
        qrSize={Math.round(size * 0.42)}
      />
    ),
    {
      width: size,
      height: size,
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    },
  );
}

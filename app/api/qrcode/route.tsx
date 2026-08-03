import QRCode from "qrcode";
import { ImageResponse } from "next/og";
import { NextResponse, type NextRequest } from "next/server";
import { getCurrentBusiness } from "@/lib/business";
import { BRAND_GRADIENT } from "@/lib/brand";

const CARD_SIZE = 1200;

export async function GET(request: NextRequest) {
  const business = await getCurrentBusiness();
  if (!business) {
    return new NextResponse("Não autorizado.", { status: 401 });
  }

  const formato =
    request.nextUrl.searchParams.get("formato") === "puro" ? "puro" : "plaquinha";

  const host = request.headers.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const reviewUrl = `${protocol}://${host}/${business.slug}/review`;

  if (formato === "puro") {
    const buffer = await QRCode.toBuffer(reviewUrl, {
      type: "png",
      width: CARD_SIZE,
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

  const qrDataUrl = await QRCode.toDataURL(reviewUrl, {
    width: 620,
    margin: 1,
    color: { dark: "#000000ff", light: "#ffffffff" },
  });

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: 90,
          background: BRAND_GRADIENT,
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            fontSize: 56,
            fontWeight: 700,
            lineHeight: 1.3,
          }}
        >
          {business.qr_headline}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 50,
            background: "white",
            padding: 32,
            borderRadius: 24,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- gerado pelo next/og, não é o next/image */}
          <img src={qrDataUrl} alt="" width={500} height={500} style={{ display: "flex" }} />
        </div>

        <div style={{ display: "flex", fontSize: 28, opacity: 0.9, marginTop: 40 }}>
          aponte a câmera do celular pro QR code
        </div>

        <div style={{ display: "flex", fontSize: 40, fontWeight: 700, marginTop: 60 }}>
          {business.name}
        </div>
      </div>
    ),
    {
      width: CARD_SIZE,
      height: CARD_SIZE,
      headers: {
        "Content-Disposition": `attachment; filename="plaquinha-${business.slug}.png"`,
        "Cache-Control": "no-store",
      },
    },
  );
}

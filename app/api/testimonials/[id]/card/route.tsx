import { ImageResponse } from "next/og";
import { NextResponse, type NextRequest } from "next/server";
import { getCurrentBusiness } from "@/lib/business";
import { createClient } from "@/lib/supabase/server";
import { BRAND_GRADIENT } from "@/lib/brand";

const SIZES = {
  feed: { width: 1080, height: 1080 },
  stories: { width: 1080, height: 1920 },
} as const;

type Format = keyof typeof SIZES;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const format: Format =
    request.nextUrl.searchParams.get("formato") === "stories"
      ? "stories"
      : "feed";
  const { width, height } = SIZES[format];

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

  const stars = "★".repeat(testimonial.rating);
  const bizTag = `via ${business.name}`;

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          fontFamily: "sans-serif",
          color: "white",
        }}
      >
        {backgroundUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- gerado pelo next/og, não é o next/image
          <img
            src={backgroundUrl}
            alt=""
            width={width}
            height={height}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width,
              height,
              objectFit: "cover",
              display: "flex",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              background: BRAND_GRADIENT,
            }}
          />
        )}

        {backgroundUrl && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              background: "rgba(15, 8, 28, 0.6)",
            }}
          />
        )}

        {format === "stories" ? (
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              width: "100%",
              height: "100%",
              padding: "160px 100px",
            }}
          >
            <div style={{ display: "flex", fontSize: 110, opacity: 0.6, lineHeight: 1 }}>
              &ldquo;
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 60,
                fontWeight: 700,
                lineHeight: 1.45,
                marginTop: 20,
              }}
            >
              {testimonial.body}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginTop: 64,
              }}
            >
              <div style={{ display: "flex", fontSize: 46, color: "#fde68a" }}>
                {stars}
              </div>
              <div style={{ display: "flex", fontSize: 44, fontWeight: 700, marginTop: 20 }}>
                {testimonial.client_name}
              </div>
              <div style={{ display: "flex", fontSize: 30, opacity: 0.85, marginTop: 8 }}>
                {bizTag}
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: "100%",
              height: "100%",
              padding: 80,
            }}
          >
            <div style={{ display: "flex", fontSize: 130, opacity: 0.6, lineHeight: 1 }}>
              &ldquo;
            </div>
            <div style={{ display: "flex", fontSize: 48, fontWeight: 700, lineHeight: 1.4 }}>
              {testimonial.body}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", fontSize: 38, fontWeight: 700 }}>
                  {testimonial.client_name}
                </div>
                <div style={{ display: "flex", fontSize: 26, opacity: 0.85, marginTop: 6 }}>
                  {bizTag}
                </div>
              </div>
              <div style={{ display: "flex", fontSize: 42, color: "#fde68a" }}>
                {stars}
              </div>
            </div>
          </div>
        )}
      </div>
    ),
    {
      width,
      height,
      headers: {
        "Content-Disposition": `attachment; filename="depoimento-${testimonial.client_name}-${format}.png"`,
      },
    },
  );
}

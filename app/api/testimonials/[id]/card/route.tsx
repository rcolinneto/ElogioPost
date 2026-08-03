import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";
import { getCurrentBusiness } from "@/lib/business";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const business = await getCurrentBusiness();
  if (!business) {
    return new NextResponse("Não autorizado.", { status: 401 });
  }

  const supabase = await createClient();
  const { data: testimonial } = await supabase
    .from("testimonials")
    .select("client_name, rating, body, status")
    .eq("id", id)
    .eq("business_id", business.id)
    .single();

  if (!testimonial || testimonial.status !== "approved") {
    return new NextResponse("Depoimento não encontrado.", { status: 404 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "linear-gradient(150deg, #7c3aed, #ec4899)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 130, opacity: 0.5, lineHeight: 1 }}>
          &ldquo;
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 48,
            fontWeight: 700,
            lineHeight: 1.4,
          }}
        >
          {testimonial.body}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 38, fontWeight: 700 }}>
              {testimonial.client_name}
            </div>
            <div style={{ display: "flex", fontSize: 26, opacity: 0.85, marginTop: 6 }}>
              via {business.name}
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 42, color: "#fde68a" }}>
            {"★".repeat(testimonial.rating)}
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080,
      headers: {
        "Content-Disposition": `attachment; filename="depoimento-${testimonial.client_name}.png"`,
      },
    },
  );
}

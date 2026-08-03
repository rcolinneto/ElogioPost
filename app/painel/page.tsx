import { headers } from "next/headers";
import { getCurrentBusiness } from "@/lib/business";
import { createClient } from "@/lib/supabase/server";
import type { Testimonial } from "@/lib/types";
import ApprovalPanel from "./ApprovalPanel";
import CopyLinkButton from "./CopyLinkButton";
import RequestReviewPanel from "./RequestReviewPanel";
import QrCodePanel from "./QrCodePanel";
import PainelTabs from "./PainelTabs";

export default async function PainelPage() {
  const business = await getCurrentBusiness();
  if (!business) return null; // já tratado pelo layout, aqui só pro TypeScript

  const supabase = await createClient();

  // Só pendentes são carregados aqui (fila de trabalho, sempre pequena).
  // Aprovados vira uma biblioteca pesquisável, buscada sob demanda pelo
  // próprio ApprovedLibrary (busca/filtro/paginação client-side).
  const [{ data: testimonials }, headersList] = await Promise.all([
    supabase
      .from("testimonials")
      .select("*")
      .eq("business_id", business.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    headers(),
  ]);

  const pendingWithUrls = await Promise.all(
    (testimonials ?? []).map(async (t: Testimonial) => {
      if (!t.screenshot_path) return { ...t, screenshotUrl: null };
      const { data } = await supabase.storage
        .from("whatsapp-screenshots")
        .createSignedUrl(t.screenshot_path, 3600);
      return { ...t, screenshotUrl: data?.signedUrl ?? null };
    }),
  );

  const host = headersList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const collectionUrl = `${protocol}://${host}/${business.slug}/review`;

  return (
    <>
      <header className="app-header">
        <h1>{business.name}</h1>
        <p>Painel de depoimentos</p>
      </header>
      <main className="app-main">
        <div className="card-panel">
          <h2>Seu link de coleta</h2>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 0 }}>
            Manda esse link pro seu cliente no WhatsApp depois de atender ele.
          </p>
          <CopyLinkButton url={collectionUrl} />
        </div>
        <PainelTabs
          depoimentos={
            <ApprovalPanel
              pendingTestimonials={pendingWithUrls}
              businessId={business.id}
              businessName={business.name}
              carouselCtaText={business.carousel_cta_text}
            />
          }
          pedir={
            <RequestReviewPanel
              businessName={business.name}
              reviewUrl={collectionUrl}
              template={business.whatsapp_template}
            />
          }
          qrcode={<QrCodePanel headline={business.qr_headline} />}
        />
      </main>
    </>
  );
}

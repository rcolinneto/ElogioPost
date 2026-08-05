import { headers } from "next/headers";
import { BadgeCheck, Download, FileDown, MessagesSquare, Star } from "lucide-react";
import { getCurrentBusiness } from "@/lib/business";
import { createClient } from "@/lib/supabase/server";
import { getBusinessStats } from "@/lib/stats";
import { formatCompactNumber } from "@/lib/text";
import type { Testimonial } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "./PageHeader";
import { StatTile } from "./StatTile";
import { DownloadButton } from "./DownloadButton";
import ApprovalPanel from "./ApprovalPanel";
import CopyLinkButton from "./CopyLinkButton";

export default async function PainelPage() {
  const business = await getCurrentBusiness();
  if (!business) return null; // já tratado pelo layout, aqui só pro TypeScript

  const supabase = await createClient();

  // Só pendentes são carregados aqui (fila de trabalho, sempre pequena).
  // Aprovados vira uma biblioteca pesquisável, buscada sob demanda pelo
  // próprio ApprovedLibrary (busca/filtro/paginação client-side).
  const [{ data: testimonials }, headersList, stats] = await Promise.all([
    supabase
      .from("testimonials")
      .select("*")
      .eq("business_id", business.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    headers(),
    getBusinessStats(business.id),
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
      <PageHeader
        title="Depoimentos"
        description="Aprove os depoimentos recebidos e baixe os cards prontos pra postar."
      />

      <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          icon={MessagesSquare}
          label="Recebidos"
          value={formatCompactNumber(stats.totalTestimonials)}
        />
        <StatTile
          icon={BadgeCheck}
          label="Aprovados"
          value={formatCompactNumber(stats.approvedTestimonials)}
        />
        <StatTile
          icon={Download}
          label="Cards gerados"
          value={formatCompactNumber(stats.cardsGenerated)}
        />
        <StatTile
          icon={Star}
          label="Nota média"
          value={stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "—"}
          accent
        />
      </div>

      <div className="mb-6 flex justify-end">
        <DownloadButton
          href="/api/testimonials/export"
          fallbackFilename={`depoimentos-${business.slug}.csv`}
          errorMessage="Não deu pra exportar agora. Tenta de novo."
          variant="outline"
          size="sm"
        >
          <FileDown /> Exportar CSV
        </DownloadButton>
      </div>

      <Card className="mb-6">
        <CardContent className="space-y-2">
          <p className="text-sm font-medium">Seu link de coleta</p>
          <p className="text-xs text-muted-foreground">
            Manda esse link pro seu cliente no WhatsApp depois de atender ele.
          </p>
          <CopyLinkButton url={collectionUrl} />
        </CardContent>
      </Card>

      <ApprovalPanel
        pendingTestimonials={pendingWithUrls}
        businessId={business.id}
        businessName={business.name}
        carouselCtaText={business.carousel_cta_text}
        defaultCardStyle={business.card_style}
        googlePlaceId={business.google_place_id}
      />
    </>
  );
}

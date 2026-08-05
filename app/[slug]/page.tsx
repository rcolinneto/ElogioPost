import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MessageCircleHeart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BRAND_GRADIENT } from "@/lib/brand";
import { whatsappLink } from "@/lib/whatsapp";
import { getInitials } from "@/lib/text";
import { PublicTestimonialCard, type PublicTestimonial } from "./PublicTestimonialCard";

type Props = { params: Promise<{ slug: string }> };

type PublicBusiness = {
  id: string;
  name: string;
  slug: string;
  logo_path: string | null;
  brand_color: string | null;
  instagram_handle: string | null;
  whatsapp_number: string | null;
};

async function getPageData(slug: string) {
  const supabase = await createClient();
  const { data: businessRows } = await supabase.rpc("get_business_by_slug", {
    p_slug: slug,
  });
  const business = businessRows?.[0] as PublicBusiness | undefined;
  if (!business) return null;

  const { data: testimonials } = await supabase.rpc("get_approved_testimonials", {
    p_business_id: business.id,
  });
  const list = (testimonials ?? []) as PublicTestimonial[];

  const logoUrl = business.logo_path
    ? supabase.storage.from("business-assets").getPublicUrl(business.logo_path).data.publicUrl
    : null;

  return { business, testimonials: list, logoUrl };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPageData(slug);
  if (!data) return {};

  const title = `Depoimentos de ${data.business.name}`;
  const description = `Veja o que os clientes de ${data.business.name} estão dizendo.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: data.logoUrl ? [data.logoUrl] : undefined,
    },
  };
}

export default async function PublicBusinessPage({ params }: Props) {
  const { slug } = await params;
  const data = await getPageData(slug);
  if (!data) notFound();

  const { business, testimonials, logoUrl } = data;

  const avgRating =
    testimonials.length > 0
      ? testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length
      : 0;

  const heroBackground = business.brand_color ?? BRAND_GRADIENT;
  const hasContactLinks = business.instagram_handle || business.whatsapp_number;

  return (
    <main className="min-h-screen bg-neutral-50">
      <header
        className="flex flex-col items-center gap-3 px-6 py-16 text-center text-white"
        style={{ background: heroBackground }}
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- vem de um bucket público nosso, não precisa do next/image
          <img
            src={logoUrl}
            alt={business.name}
            className="size-20 rounded-full border-4 border-white/70 object-cover shadow-lg"
          />
        ) : (
          <div className="flex size-20 items-center justify-center rounded-full border-4 border-white/70 bg-white/15 text-2xl font-bold">
            {getInitials(business.name)}
          </div>
        )}

        <h1 className="text-2xl font-bold tracking-tight">{business.name}</h1>

        {testimonials.length > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-sm">
            <span className="font-semibold">{avgRating.toFixed(1)} ★</span>
            <span className="text-white/80">
              · {testimonials.length} depoimento{testimonials.length === 1 ? "" : "s"}
            </span>
          </div>
        )}

        {hasContactLinks && (
          <div className="mt-1 flex flex-wrap justify-center gap-2">
            {business.instagram_handle && (
              <a
                href={`https://instagram.com/${business.instagram_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-white/15 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/25"
              >
                @{business.instagram_handle}
              </a>
            )}
            {business.whatsapp_number && (
              <a
                href={whatsappLink(business.whatsapp_number)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-white/15 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/25"
              >
                WhatsApp
              </a>
            )}
          </div>
        )}
      </header>

      <section className="mx-auto max-w-5xl px-6 py-12">
        {testimonials.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <MessageCircleHeart className="size-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Ainda não tem depoimentos por aqui</p>
              <p className="mx-auto max-w-xs text-sm text-muted-foreground">
                Assim que {business.name} aprovar os primeiros depoimentos, eles aparecem nessa
                página.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <PublicTestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        )}
      </section>

      <footer className="pb-10 text-center text-xs text-neutral-400">
        Depoimentos verificados via ElogioPost
      </footer>
    </main>
  );
}

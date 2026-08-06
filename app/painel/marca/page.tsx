import { getCurrentBusiness } from "@/lib/business";
import { isPaidPlan } from "@/lib/plan";
import { PageHeader } from "../PageHeader";
import { PlanLock } from "../PlanLock";
import BrandKitPanel from "../BrandKitPanel";

export default async function MarcaPage() {
  const business = await getCurrentBusiness();
  if (!business) return null; // já tratado pelo layout, aqui só pro TypeScript

  return (
    <>
      <PageHeader
        title="Marca"
        description="Preencha uma vez e sua logo, cor e contatos aparecem automaticamente nos cards, na plaquinha de QR, na página de coleta de depoimentos e na mensagem de depoimento. Tudo opcional."
      />
      {isPaidPlan(business) ? (
        <BrandKitPanel
          businessId={business.id}
          logoPath={business.logo_path}
          brandColor={business.brand_color}
          instagramHandle={business.instagram_handle}
          whatsappNumber={business.whatsapp_number}
          googlePlaceId={business.google_place_id}
        />
      ) : (
        <PlanLock description="Logo, cor da marca, @Instagram, WhatsApp e ponte pro Google são exclusivos de quem assina o plano Pago." />
      )}
    </>
  );
}

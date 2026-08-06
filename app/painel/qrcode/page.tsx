import { getCurrentBusiness } from "@/lib/business";
import { isPaidPlan } from "@/lib/plan";
import { PageHeader } from "../PageHeader";
import { PlanLock } from "../PlanLock";
import QrCodePanel from "../QrCodePanel";

export default async function QrCodePage() {
  const business = await getCurrentBusiness();
  if (!business) return null; // já tratado pelo layout, aqui só pro TypeScript

  return (
    <>
      <PageHeader
        title="QR Code"
        description="Baixe a plaquinha pra deixar no balcão do seu negócio."
      />
      {isPaidPlan(business) ? (
        <QrCodePanel
          businessId={business.id}
          headline={business.qr_headline}
          qrBackgroundPath={business.qr_background_path}
          qrBandStyle={business.qr_band_style}
        />
      ) : (
        <PlanLock description="A plaquinha de QR code pro balcão do seu negócio é exclusiva de quem assina o plano Pago." />
      )}
    </>
  );
}

import { getCurrentBusiness } from "@/lib/business";
import { PageHeader } from "../PageHeader";
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
      <QrCodePanel
        businessId={business.id}
        headline={business.qr_headline}
        qrBackgroundPath={business.qr_background_path}
        qrBandStyle={business.qr_band_style}
      />
    </>
  );
}

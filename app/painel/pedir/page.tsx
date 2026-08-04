import { headers } from "next/headers";
import { getCurrentBusiness } from "@/lib/business";
import { PageHeader } from "../PageHeader";
import RequestReviewPanel from "../RequestReviewPanel";

export default async function PedirDepoimentoPage() {
  const business = await getCurrentBusiness();
  if (!business) return null; // já tratado pelo layout, aqui só pro TypeScript

  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const collectionUrl = `${protocol}://${host}/${business.slug}/review`;

  return (
    <>
      <PageHeader
        title="Pedir depoimento"
        description="Gere uma mensagem pronta com o nome do cliente pra mandar no WhatsApp."
      />
      <RequestReviewPanel
        businessName={business.name}
        reviewUrl={collectionUrl}
        template={business.whatsapp_template}
      />
    </>
  );
}

import { CheckCircle2, Sparkles } from "lucide-react";
import { getCurrentBusiness } from "@/lib/business";
import { isPaidPlan, PAID_PLAN_PRICE_LABEL } from "@/lib/plan";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "../PageHeader";
import SubscribeForm from "../SubscribeForm";

const PAID_BENEFITS = [
  "Depoimentos aprovados ilimitados",
  "Todos os estilos de card",
  "Plaquinha de QR code pro balcão",
  "Marca personalizada (logo, cor, @Instagram, WhatsApp)",
  "Ponte pra pedir a mesma avaliação no Google",
];

const SUBSCRIPTION_STATUS_LABEL: Record<string, string> = {
  active: "Ativa",
  overdue: "Pagamento atrasado",
  canceled: "Cancelada",
  inactive: "Inativa",
};

export default async function AssinaturaPage() {
  const business = await getCurrentBusiness();
  if (!business) return null; // já tratado pelo layout, aqui só pro TypeScript

  const isPaid = isPaidPlan(business);

  return (
    <>
      <PageHeader
        title="Assinatura"
        description={
          isPaid
            ? "Você assina o plano Pago do ElogioPost."
            : `Assine o plano Pago por ${PAID_PLAN_PRICE_LABEL} e libere tudo, sem limite de depoimentos.`
        }
      />

      {isPaid ? (
        <Card>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle2 className="size-4 text-primary" />
              Plano Pago —{" "}
              {SUBSCRIPTION_STATUS_LABEL[business.subscription_status] ??
                business.subscription_status}
            </div>
            {business.subscription_status === "overdue" && (
              <p className="text-xs text-muted-foreground">
                A última cobrança não foi paga. Verifica o e-mail com a fatura ou entra em
                contato com a gente.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-2.5">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="size-4 text-primary" />O que o plano Pago libera
              </div>
              <ul className="space-y-1.5">
                {PAID_BENEFITS.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <SubscribeForm />
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

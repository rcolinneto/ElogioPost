import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PAID_PLAN_PRICE_LABEL } from "@/lib/plan";

export function PlanLock({ description }: { description: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-14 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
        <Lock className="size-6 text-primary" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">Recurso do plano Pago</p>
        <p className="mx-auto max-w-xs text-sm text-muted-foreground">{description}</p>
      </div>
      <Button asChild className="mt-1">
        <Link href="/painel/assinatura">Assinar por {PAID_PLAN_PRICE_LABEL}</Link>
      </Button>
    </div>
  );
}

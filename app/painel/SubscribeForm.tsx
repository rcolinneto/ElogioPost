"use client";

import { useState } from "react";
import { toast } from "sonner";
import { QrCode, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "./LoadingButton";
import { createSubscriptionCheckout } from "./billingActions";
import type { AsaasSubscriptionBillingType } from "@/lib/asaas";

export default function SubscribeForm() {
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [submitting, setSubmitting] = useState<AsaasSubscriptionBillingType | null>(null);

  async function handleSubscribe(billingType: AsaasSubscriptionBillingType) {
    if (!cpfCnpj.trim()) {
      toast.error("Informa o CPF ou CNPJ do responsável pela cobrança.");
      return;
    }

    setSubmitting(billingType);
    try {
      const { invoiceUrl } = await createSubscriptionCheckout(cpfCnpj, billingType);
      window.location.href = invoiceUrl;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não deu pra iniciar a assinatura agora. Tenta de novo.",
      );
      setSubmitting(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="cpfCnpj">CPF ou CNPJ do responsável pela cobrança</Label>
        <Input
          id="cpfCnpj"
          type="text"
          inputMode="numeric"
          placeholder="000.000.000-00"
          value={cpfCnpj}
          onChange={(e) => setCpfCnpj(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Exigido pelo Asaas, nosso parceiro de cobrança, pra emitir a fatura.
        </p>
      </div>

      <div className="flex gap-2">
        <LoadingButton
          className="flex-1"
          loading={submitting === "PIX"}
          loadingText="Gerando..."
          disabled={submitting !== null}
          onClick={() => handleSubscribe("PIX")}
        >
          <QrCode /> Assinar com Pix
        </LoadingButton>
        <LoadingButton
          variant="outline"
          className="flex-1"
          loading={submitting === "CREDIT_CARD"}
          loadingText="Gerando..."
          disabled={submitting !== null}
          onClick={() => handleSubscribe("CREDIT_CARD")}
        >
          <CreditCard /> Assinar com cartão
        </LoadingButton>
      </div>
    </div>
  );
}

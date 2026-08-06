"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/business";
import { isPaidPlan } from "@/lib/plan";
import {
  createAsaasCustomer,
  createAsaasSubscription,
  getFirstSubscriptionPayment,
  type AsaasSubscriptionBillingType,
} from "@/lib/asaas";

const PLAN_VALUE = 39;

function todayISODate(): string {
  return new Intl.DateTimeFormat("en-CA").format(new Date());
}

export async function createSubscriptionCheckout(
  cpfCnpj: string,
  billingType: AsaasSubscriptionBillingType,
): Promise<{ invoiceUrl: string }> {
  const business = await getCurrentBusiness();
  if (!business) throw new Error("Sessão expirada. Recarrega a página e tenta de novo.");
  if (isPaidPlan(business)) throw new Error("Você já assina o plano Pago.");

  const document = cpfCnpj.replace(/\D/g, "");
  if (document.length !== 11 && document.length !== 14) {
    throw new Error("Informe um CPF ou CNPJ válido.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) throw new Error("Sessão expirada. Recarrega a página e tenta de novo.");

  let customerId = business.asaas_customer_id;
  if (!customerId) {
    const customer = await createAsaasCustomer({
      name: business.name,
      email: user.email,
      cpfCnpj: document,
    });
    customerId = customer.id;
  }

  const subscription = await createAsaasSubscription({
    customer: customerId,
    billingType,
    value: PLAN_VALUE,
    nextDueDate: todayISODate(),
    description: "ElogioPost - Plano Pago",
  });

  await supabase
    .from("businesses")
    .update({
      asaas_customer_id: customerId,
      asaas_subscription_id: subscription.id,
      billing_document: document,
    })
    .eq("owner_id", user.id);

  const payment = await getFirstSubscriptionPayment(subscription.id);
  if (!payment) {
    throw new Error("Assinatura criada, mas não achamos a cobrança. Tenta de novo em instantes.");
  }

  return { invoiceUrl: payment.invoiceUrl };
}

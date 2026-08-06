import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

const PAID_ACTIVE_EVENTS = new Set(["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED"]);
const DOWNGRADE_OVERDUE_EVENTS = new Set(["PAYMENT_OVERDUE"]);
const DOWNGRADE_CANCELED_EVENTS = new Set([
  "PAYMENT_DELETED",
  "PAYMENT_REFUNDED",
  "SUBSCRIPTION_DELETED",
  "SUBSCRIPTION_INACTIVATED",
]);

type AsaasWebhookBody = {
  event: string;
  payment?: { subscription?: string | null };
  subscription?: { id?: string } | string;
};

function extractSubscriptionId(body: AsaasWebhookBody): string | null {
  if (body.payment?.subscription) return body.payment.subscription;
  if (typeof body.subscription === "string") return body.subscription;
  if (body.subscription?.id) return body.subscription.id;
  return null;
}

export async function POST(request: NextRequest) {
  const receivedToken = request.headers.get("asaas-access-token");
  const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;

  if (!expectedToken || receivedToken !== expectedToken) {
    return new NextResponse("Não autorizado.", { status: 401 });
  }

  const body = (await request.json()) as AsaasWebhookBody;
  const subscriptionId = extractSubscriptionId(body);

  let plan: "free" | "paid" | null = null;
  let subscriptionStatus: "active" | "overdue" | "canceled" | null = null;

  if (PAID_ACTIVE_EVENTS.has(body.event)) {
    plan = "paid";
    subscriptionStatus = "active";
  } else if (DOWNGRADE_OVERDUE_EVENTS.has(body.event)) {
    plan = "free";
    subscriptionStatus = "overdue";
  } else if (DOWNGRADE_CANCELED_EVENTS.has(body.event)) {
    plan = "free";
    subscriptionStatus = "canceled";
  }

  // Evento que não reconhecemos ou sem id de assinatura — nada pra fazer,
  // mas confirma recebimento pro Asaas não ficar reenviando.
  if (!plan || !subscriptionStatus || !subscriptionId) {
    return new NextResponse("ok", { status: 200 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { error } = await supabase.rpc("apply_asaas_billing_update", {
    p_webhook_token: expectedToken,
    p_asaas_subscription_id: subscriptionId,
    p_plan: plan,
    p_subscription_status: subscriptionStatus,
  });

  if (error) {
    return new NextResponse("Erro ao atualizar assinatura.", { status: 500 });
  }

  return new NextResponse("ok", { status: 200 });
}

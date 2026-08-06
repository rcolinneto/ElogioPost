// Cliente mínimo da API do Asaas — só o necessário pro fluxo de assinatura
// do plano Pago (criar cliente, criar assinatura, buscar a primeira cobrança
// e o QR code Pix dela). Autenticação via header `access_token` (não é
// Authorization: Bearer) e User-Agent é obrigatório pra contas criadas depois
// de 13/06/2024. Ambiente controlado por ASAAS_ENV ("production" ou
// qualquer outra coisa/ausente = sandbox, o padrão mais seguro).

const ASAAS_BASE_URL =
  process.env.ASAAS_ENV === "production"
    ? "https://api.asaas.com/v3"
    : "https://api-sandbox.asaas.com/v3";

async function asaasFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const apiKey = process.env.ASAAS_API_KEY;
  if (!apiKey) {
    throw new Error("ASAAS_API_KEY não configurada no ambiente.");
  }

  const res = await fetch(`${ASAAS_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "ElogioPost/1.0",
      access_token: apiKey,
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Asaas API respondeu ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

export type AsaasCustomer = { id: string };

export async function createAsaasCustomer(input: {
  name: string;
  email: string;
  cpfCnpj: string;
}): Promise<AsaasCustomer> {
  return asaasFetch<AsaasCustomer>("/customers", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export type AsaasSubscriptionBillingType = "PIX" | "CREDIT_CARD";

export type AsaasSubscription = {
  id: string;
  status: string;
};

export async function createAsaasSubscription(input: {
  customer: string;
  billingType: AsaasSubscriptionBillingType;
  value: number;
  nextDueDate: string; // YYYY-MM-DD
  description: string;
}): Promise<AsaasSubscription> {
  return asaasFetch<AsaasSubscription>("/subscriptions", {
    method: "POST",
    body: JSON.stringify({ ...input, cycle: "MONTHLY" }),
  });
}

export type AsaasPayment = {
  id: string;
  status: string;
  invoiceUrl: string;
  billingType: AsaasSubscriptionBillingType;
};

// A assinatura em si não devolve a cobrança gerada — busca a primeira
// cobrança criada pra essa assinatura (a que o dono precisa pagar agora).
export async function getFirstSubscriptionPayment(
  subscriptionId: string,
): Promise<AsaasPayment | null> {
  const result = await asaasFetch<{ data: AsaasPayment[] }>(
    `/payments?subscription=${encodeURIComponent(subscriptionId)}&limit=1`,
  );
  return result.data[0] ?? null;
}

export type AsaasPixQrCode = {
  encodedImage: string; // PNG em base64
  payload: string; // Pix copia-e-cola
  expirationDate: string;
};

export async function getAsaasPixQrCode(paymentId: string): Promise<AsaasPixQrCode> {
  return asaasFetch<AsaasPixQrCode>(`/payments/${encodeURIComponent(paymentId)}/pixQrCode`);
}

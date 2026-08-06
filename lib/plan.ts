import type { Business } from "./types";

// Limite cumulativo (não mensal) de depoimentos aprovados no plano Free —
// contagem histórica total, nunca reseta.
export const FREE_APPROVED_LIMIT = 3;
export const PAID_PLAN_PRICE_LABEL = "R$39/mês";

export function isPaidPlan(business: Pick<Business, "plan">): boolean {
  return business.plan === "paid";
}

export function hasReachedFreeLimit(
  business: Pick<Business, "plan">,
  approvedCount: number,
): boolean {
  return !isPaidPlan(business) && approvedCount >= FREE_APPROVED_LIMIT;
}

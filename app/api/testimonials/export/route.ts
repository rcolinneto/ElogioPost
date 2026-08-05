import { NextResponse } from "next/server";
import { getCurrentBusiness } from "@/lib/business";
import { createClient } from "@/lib/supabase/server";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
};

function csvField(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export async function GET() {
  const business = await getCurrentBusiness();
  if (!business) {
    return new NextResponse("Não autorizado.", { status: 401 });
  }

  const supabase = await createClient();
  const { data: testimonials } = await supabase
    .from("testimonials")
    .select("client_name, rating, body, status, created_at")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  const dateFormatter = new Intl.DateTimeFormat("pt-BR");

  const header = ["Nome", "Nota", "Depoimento", "Data", "Status"].map(csvField).join(";");
  const rows = (testimonials ?? []).map((t) =>
    [
      csvField(t.client_name),
      csvField(String(t.rating)),
      csvField(t.body),
      csvField(dateFormatter.format(new Date(t.created_at))),
      csvField(STATUS_LABELS[t.status] ?? t.status),
    ].join(";"),
  );

  // ; em vez de , — Excel em português abre CSV com , direto no navegador de
  // arquivos jogando tudo numa coluna só, porque o separador de lista do
  // Windows pt-BR é ;. BOM no início pro Excel reconhecer UTF-8 (senão a
  // acentuação vem toda errada) — String.fromCharCode em vez do caractere
  // literal, que é ambíguo de digitar/colar de forma confiável.
  const BOM = String.fromCharCode(0xfeff);
  const csv = BOM + [header, ...rows].join("\r\n");

  const today = new Intl.DateTimeFormat("en-CA").format(new Date());

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="depoimentos-${business.slug}-${today}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

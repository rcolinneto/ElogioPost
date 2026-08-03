"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function setStatus(id: string, status: "approved" | "rejected") {
  const supabase = await createClient();
  await supabase
    .from("testimonials")
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/painel");
}

export async function approveTestimonial(id: string) {
  await setStatus(id, "approved");
}

export async function rejectTestimonial(id: string) {
  await setStatus(id, "rejected");
}

async function updateOwnBusinessField(field: "whatsapp_template" | "qr_headline", value: string) {
  const trimmed = value.trim();
  if (!trimmed) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("businesses")
    .update({ [field]: trimmed })
    .eq("owner_id", user.id);

  revalidatePath("/painel");
}

export async function updateWhatsappTemplate(template: string) {
  await updateOwnBusinessField("whatsapp_template", template);
}

export async function updateQrHeadline(headline: string) {
  await updateOwnBusinessField("qr_headline", headline);
}

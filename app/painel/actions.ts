"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/business";
import { generateCaption } from "./captionActions";
import { CARD_STYLES, type CardStyleId } from "@/lib/cardStyles";

async function setStatus(id: string, status: "approved" | "rejected") {
  const supabase = await createClient();
  const { error } = await supabase
    .from("testimonials")
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error("Não deu pra atualizar o depoimento agora.");
  revalidatePath("/painel");
}

export async function approveTestimonial(id: string) {
  await setStatus(id, "approved");
  try {
    // legenda é um bônus gerado por IA — se falhar, a aprovação já aconteceu
    // e o dono ainda pode gerar manualmente pelo botão "Gerar legenda"
    await generateCaption(id);
  } catch {
    // ignorado de propósito
  }
}

export async function rejectTestimonial(id: string) {
  await setStatus(id, "rejected");
}

async function updateOwnBusinessField(
  field: "whatsapp_template" | "qr_headline" | "carousel_cta_text" | "card_style",
  value: string,
) {
  const trimmed = value.trim();
  if (!trimmed) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sessão expirada. Recarrega a página e tenta de novo.");

  const { error } = await supabase
    .from("businesses")
    .update({ [field]: trimmed })
    .eq("owner_id", user.id);
  if (error) throw new Error("Não deu pra salvar agora. Tenta de novo.");

  revalidatePath("/painel");
}

export async function updateWhatsappTemplate(template: string) {
  await updateOwnBusinessField("whatsapp_template", template);
}

export async function updateQrHeadline(headline: string) {
  await updateOwnBusinessField("qr_headline", headline);
}

export async function updateCarouselCta(text: string) {
  await updateOwnBusinessField("carousel_cta_text", text);
}

export async function updateCardStyle(styleId: CardStyleId) {
  if (!(styleId in CARD_STYLES)) return;
  await updateOwnBusinessField("card_style", styleId);
}

// Campos do Brand Kit (logo, cor, @instagram, WhatsApp) e da plaquinha de QR
// são todos opcionais e precisam poder ser apagados (voltar pra null), então
// usam esse helper à parte em vez de updateOwnBusinessField, que ignora
// valor vazio de propósito (os campos que ele cobre nunca fazem sentido em
// branco).
async function updateOwnBusinessColumns(values: Record<string, string | null>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sessão expirada. Recarrega a página e tenta de novo.");

  const { error } = await supabase
    .from("businesses")
    .update(values)
    .eq("owner_id", user.id);
  if (error) throw new Error("Não deu pra salvar agora. Tenta de novo.");

  revalidatePath("/painel");
}

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export async function updateBrandColor(color: string | null) {
  if (color && !HEX_COLOR.test(color)) {
    throw new Error("Cor inválida.");
  }
  await updateOwnBusinessColumns({ brand_color: color });
}

export async function updateInstagramHandle(handle: string) {
  const cleaned = handle.trim().replace(/^@+/, "");
  await updateOwnBusinessColumns({ instagram_handle: cleaned || null });
}

export async function updateWhatsappNumber(number: string) {
  const cleaned = number.trim();
  await updateOwnBusinessColumns({ whatsapp_number: cleaned || null });
}

export async function updateGooglePlaceId(placeId: string) {
  const cleaned = placeId.trim();
  await updateOwnBusinessColumns({ google_place_id: cleaned || null });
}

async function updateOwnBusinessAsset(
  column: "logo_path" | "qr_background_path",
  newPath: string | null,
  oldPath: string | null,
) {
  await updateOwnBusinessColumns({ [column]: newPath });
  if (oldPath && oldPath !== newPath) {
    const supabase = await createClient();
    await supabase.storage.from("business-assets").remove([oldPath]);
  }
}

export async function updateLogoPath(newPath: string | null, oldPath: string | null) {
  await updateOwnBusinessAsset("logo_path", newPath, oldPath);
}

export async function updateQrBackgroundPath(newPath: string | null, oldPath: string | null) {
  await updateOwnBusinessAsset("qr_background_path", newPath, oldPath);
}

export async function updateQrBandStyle(bandStyle: "light" | "dark") {
  if (bandStyle !== "light" && bandStyle !== "dark") return;
  await updateOwnBusinessColumns({ qr_band_style: bandStyle });
}

// Registro "melhor esforço" pra estatística de cards gerados no dashboard —
// nunca lança erro, porque o download em si já aconteceu com sucesso do
// ponto de vista de quem clicou; uma falha aqui não deve virar um toast de
// erro sobre uma ação que já deu certo.
export async function logCardGeneration(testimonialId: string | null, format: string) {
  try {
    const business = await getCurrentBusiness();
    if (!business) return;

    const supabase = await createClient();
    await supabase.from("card_generations").insert({
      business_id: business.id,
      testimonial_id: testimonialId,
      format,
    });
  } catch {
    // ignorado de propósito
  }
}

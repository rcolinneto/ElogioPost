"use server";

import Anthropic from "@anthropic-ai/sdk";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/business";

// Instanciado uma vez por processo; lê ANTHROPIC_API_KEY do ambiente
// (server-only — nunca é enviado pro navegador, já que este arquivo é "use server").
const anthropic = new Anthropic();

const CAPTION_SYSTEM_PROMPT = `Você é um assistente de redes sociais para pequenos negócios locais no Brasil (salão, loja, prestador de serviço). Sua tarefa é escrever uma legenda curta pra postar no Instagram junto com um card de depoimento de cliente aprovado.

A legenda deve:
- ter entre 2 e 4 frases, tom caloroso e autêntico, sem soar corporativo
- usar no máximo 2 a 3 emojis, sem exagero
- terminar com 3 a 5 hashtags relevantes ao nicho do negócio, em português, sem espaço, cada uma com #

Regra mais importante: não invente nenhum detalhe que não esteja explícito no depoimento — nem produto, nem para quem é, nem ocasião de uso. Por exemplo, se o depoimento diz só "comprei a bandana e achei linda", não presuma que é pra pet, bebê ou qualquer outro público — fique no que foi realmente dito. Na dúvida, prefira uma legenda mais genérica a arriscar inventar algo errado.

Responda só com a legenda final. Sem aspas ao redor, sem explicações, sem markdown.`;

export type GenerateCaptionResult = {
  caption: string | null;
  error: string | null;
};

export async function generateCaption(
  testimonialId: string,
): Promise<GenerateCaptionResult> {
  const business = await getCurrentBusiness();
  if (!business) {
    return { caption: null, error: "Não autorizado." };
  }

  const supabase = await createClient();
  const { data: testimonial } = await supabase
    .from("testimonials")
    .select("client_name, rating, body")
    .eq("id", testimonialId)
    .eq("business_id", business.id)
    .single();

  if (!testimonial) {
    return { caption: null, error: "Depoimento não encontrado." };
  }

  let message;
  try {
    message = await anthropic.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 300,
      output_config: { effort: "low" },
      system: CAPTION_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Negócio: ${business.name}\nNota do cliente: ${testimonial.rating}/5\nDepoimento: "${testimonial.body}"\n\nEscreva a legenda.`,
        },
      ],
    });
  } catch {
    return {
      caption: null,
      error: "Não deu pra gerar a legenda agora. Tenta de novo.",
    };
  }

  const firstBlock = message.content[0];
  const caption =
    firstBlock && firstBlock.type === "text" ? firstBlock.text.trim() : "";

  if (!caption) {
    return {
      caption: null,
      error: "Não deu pra gerar a legenda agora. Tenta de novo.",
    };
  }

  await supabase
    .from("testimonials")
    .update({ caption })
    .eq("id", testimonialId)
    .eq("business_id", business.id);

  await supabase.from("caption_generations").insert({
    business_id: business.id,
    testimonial_id: testimonialId,
    input_tokens: message.usage.input_tokens,
    output_tokens: message.usage.output_tokens,
  });

  revalidatePath("/painel");
  return { caption, error: null };
}

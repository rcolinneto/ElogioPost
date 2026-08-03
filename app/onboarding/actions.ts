"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify, randomSuffix } from "@/lib/slug";

export type OnboardingState = { error: string | null };

export async function createBusiness(
  _prevState: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { error: "Digite o nome do seu negócio." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const baseSlug = slugify(name) || "negocio";
  let slug = baseSlug;

  for (let attempt = 0; attempt < 5; attempt++) {
    const { error } = await supabase.from("businesses").insert({
      owner_id: user.id,
      name,
      slug,
    });

    if (!error) {
      redirect("/painel");
    }

    if (error.code === "23505") {
      if (error.message.includes("slug")) {
        slug = `${baseSlug}-${randomSuffix()}`;
        continue;
      }
      // conflito em owner_id: o negócio já existe, só segue pro painel
      redirect("/painel");
    }

    return { error: "Não deu pra criar seu negócio agora. Tenta de novo." };
  }

  return { error: "Não deu pra gerar um link único agora. Tenta de novo." };
}

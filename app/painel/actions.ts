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

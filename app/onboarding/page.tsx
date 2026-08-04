import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (business) {
    redirect("/painel");
  }

  return (
    <>
      <header className="app-header">
        <h1>ElogioPost</h1>
        <p>Só mais um passo pra começar a coletar depoimentos</p>
      </header>
      <main className="app-main">
        <div className="card-panel">
          <h2>Como se chama o seu negócio?</h2>
          <p style={{ fontSize: 14, color: "var(--legacy-muted)" }}>
            Esse nome aparece nos cards de depoimento gerados e no seu link de
            coleta.
          </p>
          <OnboardingForm />
        </div>
      </main>
    </>
  );
}

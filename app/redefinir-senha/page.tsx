import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ResetPasswordForm from "./ResetPasswordForm";

export default async function RedefinirSenhaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/esqueci-senha");
  }

  return (
    <>
      <header className="app-header">
        <h1>ElogioPost</h1>
        <p>Defina sua nova senha</p>
      </header>
      <main className="app-main">
        <div className="card-panel">
          <h2>Nova senha</h2>
          <ResetPasswordForm />
        </div>
      </main>
    </>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("sending");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setStatus(error ? "error" : "sent");
  }

  return (
    <>
      <header className="app-header">
        <h1>ElogioPost</h1>
        <p>Entre pra acessar o painel do seu negócio</p>
      </header>
      <main className="app-main">
        <div className="card-panel">
          <h2>Entrar</h2>
          {status === "sent" ? (
            <div className="success-msg">
              Te mandamos um link de acesso pro e-mail <strong>{email}</strong>.
              Abre a caixa de entrada e clica no link pra entrar. 🎉
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label htmlFor="email">Seu e-mail</label>
              <input
                id="email"
                type="email"
                required
                placeholder="voce@seunegocio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {status === "error" && (
                <div className="error-msg" style={{ marginTop: 14 }}>
                  Não deu pra enviar o link agora. Confere o e-mail e tenta de
                  novo.
                </div>
              )}
              <button
                className="primary"
                type="submit"
                disabled={status === "sending"}
              >
                {status === "sending" ? "Enviando..." : "Receber link de acesso"}
              </button>
            </form>
          )}
        </div>
      </main>
    </>
  );
}

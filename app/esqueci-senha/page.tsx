"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("sending");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/redefinir-senha`,
    });

    // Não diferenciamos erro de "e-mail não existe" pra não vazar quais
    // e-mails têm conta — sempre mostramos a mesma mensagem de sucesso.
    setStatus(error ? "error" : "sent");
  }

  return (
    <>
      <header className="app-header">
        <h1>ElogioPost</h1>
        <p>Recuperar senha</p>
      </header>
      <main className="app-main">
        <div className="card-panel">
          <h2>Esqueci minha senha</h2>
          {status === "sent" ? (
            <div className="success-msg">
              Se esse e-mail tiver uma conta, mandamos um link pra você
              redefinir sua senha. Confere a caixa de entrada. 🎉
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
                  Não deu pra enviar o link agora. Tenta de novo.
                </div>
              )}

              <button
                className="primary"
                type="submit"
                disabled={status === "sending"}
              >
                {status === "sending" ? "Enviando..." : "Enviar link de recuperação"}
              </button>
            </form>
          )}

          <p style={{ fontSize: 13, marginTop: 16, color: "var(--muted)" }}>
            <Link href="/login">Voltar pro login</Link>
          </p>
        </div>
      </main>
    </>
  );
}

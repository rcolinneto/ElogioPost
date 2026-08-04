"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function CadastroPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorMsg("");

    if (password.length < 8) {
      setErrorMsg("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("As senhas não são iguais.");
      return;
    }

    setStatus("sending");

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMsg("Não deu pra criar sua conta agora. Tenta de novo.");
      return;
    }

    // Supabase não retorna erro pra e-mail já cadastrado (evita vazar quais
    // e-mails existem) — identities vazio é o sinal de que já tinha conta.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setStatus("error");
      setErrorMsg(
        "Esse e-mail já tem uma conta. Tenta entrar ou recuperar sua senha.",
      );
      return;
    }

    setStatus("sent");
  }

  return (
    <>
      <header className="app-header">
        <h1>ElogioPost</h1>
        <p>Crie sua conta pra começar a coletar depoimentos</p>
      </header>
      <main className="app-main">
        <div className="card-panel">
          <h2>Criar conta</h2>
          {status === "sent" ? (
            <div className="success-msg">
              Falta pouco! Te mandamos um link de confirmação pro e-mail{" "}
              <strong>{email}</strong>. Abre a caixa de entrada e clica no
              link pra ativar sua conta. 🎉
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

              <label htmlFor="password">Crie uma senha</label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <label htmlFor="confirmPassword">Confirme a senha</label>
              <input
                id="confirmPassword"
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              {errorMsg && (
                <div className="error-msg" style={{ marginTop: 14 }}>
                  {errorMsg}
                </div>
              )}

              <button
                className="primary"
                type="submit"
                disabled={status === "sending"}
              >
                {status === "sending" ? "Criando..." : "Criar conta"}
              </button>
            </form>
          )}

          <p style={{ fontSize: 13, marginTop: 16, color: "var(--legacy-muted)" }}>
            Já tem conta? <Link href="/login">Entrar</Link>
          </p>
        </div>
      </main>
    </>
  );
}

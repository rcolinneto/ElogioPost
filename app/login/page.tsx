"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setStatus("error");
      setErrorMsg("E-mail ou senha incorretos.");
      return;
    }

    // navegação completa pra garantir que o painel já leia a sessão nova
    window.location.assign("/painel");
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

            <label htmlFor="password">Sua senha</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {errorMsg && (
              <div className="error-msg" style={{ marginTop: 14 }}>
                {errorMsg}
              </div>
            )}

            <button className="primary" type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p style={{ fontSize: 13, marginTop: 16 }}>
            <Link href="/esqueci-senha">Esqueci minha senha</Link>
          </p>
          <p style={{ fontSize: 13, marginTop: 6, color: "var(--legacy-muted)" }}>
            Não tem conta ainda? <Link href="/cadastro">Criar conta</Link>
          </p>
        </div>
      </main>
    </>
  );
}

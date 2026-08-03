"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
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
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus("error");
      setErrorMsg("Não deu pra salvar a nova senha agora. Tenta de novo.");
      return;
    }

    window.location.assign("/painel");
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="password">Nova senha</label>
      <input
        id="password"
        type="password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <label htmlFor="confirmPassword">Confirme a nova senha</label>
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

      <button className="primary" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Salvando..." : "Salvar nova senha"}
      </button>
    </form>
  );
}

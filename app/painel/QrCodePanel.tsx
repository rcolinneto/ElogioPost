"use client";

import { useState, useTransition, type FormEvent } from "react";
import { updateQrHeadline } from "./actions";

export default function QrCodePanel({ headline }: { headline: string }) {
  const [headlineDraft, setHeadlineDraft] = useState(headline);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [cacheBust, setCacheBust] = useState(0);

  function handleSave(event: FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      await updateQrHeadline(headlineDraft);
      setCacheBust((v) => v + 1);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  const plaquinhaUrl = `/api/qrcode?formato=plaquinha&v=${cacheBust}`;
  const puroUrl = `/api/qrcode?formato=puro&v=${cacheBust}`;

  return (
    <>
      <h2>QR Code pra divulgar</h2>
      <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 0 }}>
        Imprime essa plaquinha e deixa no balcão — o cliente escaneia e cai
        direto no seu link de depoimento.
      </p>

      <div style={{ display: "flex", justifyContent: "center", margin: "14px 0" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- prévia gerada pela nossa própria rota autenticada */}
        <img
          src={plaquinhaUrl}
          alt="Prévia da plaquinha com QR code"
          style={{ maxWidth: 280, width: "100%", borderRadius: 12 }}
        />
      </div>

      <div className="actions">
        <a className="btn-download" href={plaquinhaUrl} download>
          ⬇ Baixar plaquinha
        </a>
        <a className="btn-download" href={puroUrl} download>
          ⬇ Baixar QR code puro
        </a>
      </div>

      <details style={{ marginTop: 20 }}>
        <summary
          style={{ cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--muted)" }}
        >
          Personalizar texto da plaquinha
        </summary>
        <form onSubmit={handleSave} style={{ marginTop: 10 }}>
          <label htmlFor="qrHeadline">Chamada no topo da plaquinha</label>
          <input
            id="qrHeadline"
            type="text"
            value={headlineDraft}
            onChange={(e) => setHeadlineDraft(e.target.value)}
          />
          <button className="primary" type="submit" disabled={isPending}>
            {isPending ? "Salvando..." : saved ? "Salvo!" : "Salvar texto"}
          </button>
        </form>
      </details>
    </>
  );
}

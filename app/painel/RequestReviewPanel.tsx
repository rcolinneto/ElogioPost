"use client";

import { useState, useTransition, type FormEvent } from "react";
import { buildWhatsappMessage } from "@/lib/whatsapp";
import { updateWhatsappTemplate } from "./actions";

type Props = {
  businessName: string;
  reviewUrl: string;
  template: string;
};

export default function RequestReviewPanel({
  businessName,
  reviewUrl,
  template,
}: Props) {
  const [clientName, setClientName] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const [templateDraft, setTemplateDraft] = useState(template);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleGenerate(event: FormEvent) {
    event.preventDefault();
    setMessage(
      buildWhatsappMessage(template, {
        nome: clientName.trim(),
        negocio: businessName,
        link: reviewUrl,
      }),
    );
    setCopied(false);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSaveTemplate(event: FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      await updateWhatsappTemplate(templateDraft);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <>
      <form onSubmit={handleGenerate}>
        <label htmlFor="clientName">Nome do cliente</label>
        <input
          id="clientName"
          type="text"
          required
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Ex: Mariana"
        />
        <button className="primary" type="submit">
          Gerar mensagem
        </button>
      </form>

      {message && (
        <div style={{ marginTop: 14 }}>
          <label htmlFor="generatedMessage">Mensagem pronta</label>
          <textarea id="generatedMessage" readOnly value={message} rows={5} />
          <button
            type="button"
            className="primary"
            onClick={handleCopy}
            style={{ marginTop: 10 }}
          >
            {copied ? "Copiado!" : "Copiar mensagem"}
          </button>
        </div>
      )}

      <details style={{ marginTop: 20 }}>
        <summary
          style={{ cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--muted)" }}
        >
          Personalizar modelo da mensagem
        </summary>
        <form onSubmit={handleSaveTemplate} style={{ marginTop: 10 }}>
          <textarea
            value={templateDraft}
            onChange={(e) => setTemplateDraft(e.target.value)}
            rows={5}
          />
          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
            Use {"{{nome}}"}, {"{{negocio}}"} e {"{{link}}"} — eles são
            trocados automaticamente pelo nome do cliente, o nome do seu
            negócio e o link de coleta.
          </p>
          <button className="primary" type="submit" disabled={isPending}>
            {isPending ? "Salvando..." : saved ? "Salvo!" : "Salvar modelo"}
          </button>
        </form>
      </details>
    </>
  );
}

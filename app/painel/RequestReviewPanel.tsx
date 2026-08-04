"use client";

import { useState, useTransition, type FormEvent } from "react";
import { buildWhatsappMessage } from "@/lib/whatsapp";
import { updateWhatsappTemplate } from "./actions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
    <Card>
      <CardContent className="space-y-4">
        <form onSubmit={handleGenerate} className="space-y-2">
          <Label htmlFor="clientName">Nome do cliente</Label>
          <Input
            id="clientName"
            type="text"
            required
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Ex: Mariana"
          />
          <Button type="submit" className="w-full">
            Gerar mensagem
          </Button>
        </form>

        {message && (
          <div className="space-y-2">
            <Label htmlFor="generatedMessage">Mensagem pronta</Label>
            <Textarea id="generatedMessage" readOnly value={message} rows={5} />
            <Button type="button" variant="secondary" className="w-full" onClick={handleCopy}>
              {copied ? "Copiado!" : "Copiar mensagem"}
            </Button>
          </div>
        )}

        <details className="group">
          <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">
            Personalizar modelo da mensagem
          </summary>
          <form onSubmit={handleSaveTemplate} className="mt-3 space-y-2">
            <Textarea
              value={templateDraft}
              onChange={(e) => setTemplateDraft(e.target.value)}
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              Use {"{{nome}}"}, {"{{negocio}}"} e {"{{link}}"} — eles são
              trocados automaticamente pelo nome do cliente, o nome do seu
              negócio e o link de coleta.
            </p>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : saved ? "Salvo!" : "Salvar modelo"}
            </Button>
          </form>
        </details>
      </CardContent>
    </Card>
  );
}

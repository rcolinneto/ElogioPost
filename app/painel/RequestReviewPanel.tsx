"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Copy, MessageCircle } from "lucide-react";
import { buildWhatsappMessage, whatsappLink } from "@/lib/whatsapp";
import { updateWhatsappTemplate } from "./actions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "./LoadingButton";

type Props = {
  businessName: string;
  reviewUrl: string;
  template: string;
  instagramHandle: string | null;
};

export default function RequestReviewPanel({
  businessName,
  reviewUrl,
  template,
  instagramHandle,
}: Props) {
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [message, setMessage] = useState("");
  const [generatedPhone, setGeneratedPhone] = useState("");
  const [copying, setCopying] = useState(false);

  const [templateDraft, setTemplateDraft] = useState(template);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleGenerate(event: FormEvent) {
    event.preventDefault();
    setMessage(
      buildWhatsappMessage(template, {
        nome: clientName.trim(),
        negocio: businessName,
        link: reviewUrl,
        instagram: instagramHandle,
      }),
    );
    setGeneratedPhone(clientPhone.trim());
  }

  async function handleCopy() {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(message);
      toast.success("Mensagem copiada!");
    } catch {
      toast.error("Não deu pra copiar. Seleciona o texto manualmente.");
    } finally {
      setCopying(false);
    }
  }

  async function handleSaveTemplate(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await updateWhatsappTemplate(templateDraft);
      toast.success("Modelo de mensagem salvo!");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error("Não deu pra salvar agora. Tenta de novo.");
    } finally {
      setSaving(false);
    }
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
          <Label htmlFor="clientPhone">WhatsApp do cliente (opcional)</Label>
          <Input
            id="clientPhone"
            type="tel"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            placeholder="(11) 99999-9999"
          />
          <p className="text-xs text-muted-foreground">
            Preenchendo, você abre a conversa já com a mensagem pronta num toque só.
          </p>
          <Button type="submit" className="w-full">
            Gerar mensagem
          </Button>
        </form>

        {message && (
          <div className="space-y-2">
            <Label htmlFor="generatedMessage">Mensagem pronta</Label>
            <Textarea id="generatedMessage" readOnly value={message} rows={5} />
            <div className="flex gap-2">
              {generatedPhone && (
                <Button asChild className="flex-1">
                  <a
                    href={whatsappLink(generatedPhone, message)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle /> Abrir no WhatsApp
                  </a>
                </Button>
              )}
              <LoadingButton
                type="button"
                variant="secondary"
                className="flex-1"
                loading={copying}
                onClick={handleCopy}
              >
                <Copy /> Copiar mensagem
              </LoadingButton>
            </div>
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
              Use {"{{nome}}"}, {"{{negocio}}"}, {"{{link}}"} e {"{{instagram}}"} — eles são
              trocados automaticamente pelo nome do cliente, o nome do seu negócio, o link de
              coleta e o @ do seu Instagram (configurado na aba Marca).
            </p>
            <LoadingButton type="submit" loading={saving} loadingText="Salvando...">
              {saved ? "Salvo!" : "Salvar modelo"}
            </LoadingButton>
          </form>
        </details>
      </CardContent>
    </Card>
  );
}

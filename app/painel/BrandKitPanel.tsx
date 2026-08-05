"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updateBrandColor,
  updateInstagramHandle,
  updateLogoPath,
  updateWhatsappNumber,
} from "./actions";
import { ImageUploadField } from "./ImageUploadField";
import { LoadingButton } from "./LoadingButton";

const DEFAULT_COLOR = "#7c3aed";

type Props = {
  businessId: string;
  logoPath: string | null;
  brandColor: string | null;
  instagramHandle: string | null;
  whatsappNumber: string | null;
};

export default function BrandKitPanel({
  businessId,
  logoPath,
  brandColor,
  instagramHandle,
  whatsappNumber,
}: Props) {
  const [color, setColor] = useState(brandColor ?? DEFAULT_COLOR);
  const [savingColor, setSavingColor] = useState(false);

  const [instagram, setInstagram] = useState(instagramHandle ?? "");
  const [savingInstagram, setSavingInstagram] = useState(false);

  const [whatsapp, setWhatsapp] = useState(whatsappNumber ?? "");
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);

  async function handleSaveColor(event: FormEvent) {
    event.preventDefault();
    setSavingColor(true);
    try {
      await updateBrandColor(color);
      toast.success("Cor da marca salva!");
    } catch {
      toast.error("Não deu pra salvar agora. Tenta de novo.");
    } finally {
      setSavingColor(false);
    }
  }

  async function handleResetColor() {
    setSavingColor(true);
    try {
      await updateBrandColor(null);
      setColor(DEFAULT_COLOR);
      toast.success("Cor da marca removida — os cards voltam pra cor padrão de cada estilo.");
    } catch {
      toast.error("Não deu pra remover agora. Tenta de novo.");
    } finally {
      setSavingColor(false);
    }
  }

  async function handleSaveInstagram(event: FormEvent) {
    event.preventDefault();
    setSavingInstagram(true);
    try {
      await updateInstagramHandle(instagram);
      toast.success("Instagram salvo!");
    } catch {
      toast.error("Não deu pra salvar agora. Tenta de novo.");
    } finally {
      setSavingInstagram(false);
    }
  }

  async function handleSaveWhatsapp(event: FormEvent) {
    event.preventDefault();
    setSavingWhatsapp(true);
    try {
      await updateWhatsappNumber(whatsapp);
      toast.success("WhatsApp salvo!");
    } catch {
      toast.error("Não deu pra salvar agora. Tenta de novo.");
    } finally {
      setSavingWhatsapp(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4">
          <ImageUploadField
            businessId={businessId}
            currentPath={logoPath}
            prefix="logo"
            onSave={updateLogoPath}
            label="Logo"
            helpText="Aparece nos cards de depoimento e na plaquinha de QR code."
          />

          <div className="space-y-2">
            <Label htmlFor="brandColor">Cor principal</Label>
            <form onSubmit={handleSaveColor} className="flex items-center gap-2">
              <input
                id="brandColor"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-8 w-12 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-1"
              />
              <Input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-28"
                maxLength={7}
              />
              <LoadingButton type="submit" loading={savingColor} loadingText="Salvando...">
                Salvar cor
              </LoadingButton>
              {brandColor && (
                <LoadingButton
                  type="button"
                  variant="ghost"
                  loading={savingColor}
                  onClick={handleResetColor}
                >
                  Usar padrão
                </LoadingButton>
              )}
            </form>
            <p className="text-xs text-muted-foreground">
              Substitui a cor de destaque do estilo de card escolhido (ex: os detalhes dourados do
              estilo Elegante).
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <form onSubmit={handleSaveInstagram} className="space-y-2">
            <Label htmlFor="instagram">@ do Instagram</Label>
            <div className="flex gap-2">
              <Input
                id="instagram"
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="seunegocio"
              />
              <LoadingButton type="submit" loading={savingInstagram} loadingText="Salvando...">
                Salvar
              </LoadingButton>
            </div>
          </form>

          <form onSubmit={handleSaveWhatsapp} className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp do negócio</Label>
            <div className="flex gap-2">
              <Input
                id="whatsapp"
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="(11) 99999-9999"
              />
              <LoadingButton type="submit" loading={savingWhatsapp} loadingText="Salvando...">
                Salvar
              </LoadingButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

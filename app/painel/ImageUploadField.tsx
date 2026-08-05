"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { LoadingButton } from "./LoadingButton";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const BUCKET = "business-assets";

export function publicAssetUrl(path: string): string {
  const supabase = createClient();
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

type Props = {
  businessId: string;
  currentPath: string | null;
  // prefixo do nome do arquivo (ex: "logo", "qr-fundo") — só pra debug ficar
  // legível no bucket, não tem efeito funcional
  prefix: string;
  onSave: (newPath: string | null, oldPath: string | null) => Promise<void>;
  label: string;
  helpText?: string;
  aspect?: "square" | "wide";
};

export function ImageUploadField({
  businessId,
  currentPath,
  prefix,
  onSave,
  label,
  helpText,
  aspect = "square",
}: Props) {
  const [path, setPath] = useState(currentPath);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error("A imagem precisa ter no máximo 5MB.");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const newPath = `${businessId}/${prefix}-${crypto.randomUUID()}.${ext}`;
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(newPath, file);
      if (uploadError) throw uploadError;

      await onSave(newPath, path);
      setPath(newPath);
      toast.success("Imagem salva!");
    } catch {
      toast.error("Não deu pra enviar a imagem agora. Tenta de novo.");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    setRemoving(true);
    try {
      await onSave(null, path);
      setPath(null);
      toast.success("Imagem removida.");
    } catch {
      toast.error("Não deu pra remover agora. Tenta de novo.");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
      {path ? (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- vem de um bucket público nosso, não precisa do next/image */}
          <img
            src={publicAssetUrl(path)}
            alt={label}
            className={cn(
              "rounded-lg border object-cover",
              aspect === "square" ? "size-20" : "h-20 w-36",
            )}
          />
          <LoadingButton
            type="button"
            variant="secondary"
            size="sm"
            loading={removing}
            onClick={handleRemove}
          >
            <X /> Remover
          </LoadingButton>
        </div>
      ) : (
        <LoadingButton
          type="button"
          variant="secondary"
          loading={uploading}
          loadingText="Enviando..."
          onClick={() => inputRef.current?.click()}
        >
          <Upload /> Enviar imagem
        </LoadingButton>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

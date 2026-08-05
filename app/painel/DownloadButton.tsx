"use client";

import { useState } from "react";
import { toast } from "sonner";
import { LoadingButton } from "./LoadingButton";

function filenameFromResponse(res: Response, fallback: string): string {
  const disposition = res.headers.get("Content-Disposition");
  const match = disposition?.match(/filename="([^"]+)"/);
  return match?.[1] ?? fallback;
}

type Props = {
  href: string;
  fallbackFilename: string;
  errorMessage?: string;
  className?: string;
  variant?: React.ComponentProps<typeof LoadingButton>["variant"];
  children: React.ReactNode;
  // Chamado depois de um download com sucesso — pra quem quiser registrar a
  // ação (ex: estatística de cards gerados). Nunca deve travar nem falhar
  // visivelmente o download em si; qualquer erro aqui é silencioso.
  onDownloaded?: () => void;
};

// Baixar um card/QR code dispara a geração da imagem no servidor (pode levar
// alguns segundos) — por isso não é um <a href download> simples: usamos
// fetch+blob pra poder mostrar o spinner enquanto gera e avisar com toast se
// falhar (o navegador não expõe esse ciclo pra uma navegação de download comum).
export function DownloadButton({
  href,
  fallbackFilename,
  errorMessage = "Não deu pra baixar a imagem. Tenta de novo.",
  className,
  variant = "secondary",
  children,
  onDownloaded,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch(href);
      if (!res.ok) throw new Error("download failed");
      const blob = await res.blob();
      const filename = filenameFromResponse(res, fallbackFilename);
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
      onDownloaded?.();
    } catch {
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LoadingButton
      type="button"
      variant={variant}
      className={className}
      loading={loading}
      loadingText="Baixando..."
      onClick={handleClick}
    >
      {children}
    </LoadingButton>
  );
}

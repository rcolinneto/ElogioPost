"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = React.ComponentProps<typeof Button> & {
  loading?: boolean;
  loadingText?: string;
};

// Padrão único de botão assíncrono do painel: desabilita e mostra spinner
// enquanto `loading`, trocando o texto por `loadingText` quando informado —
// evita clique duplo e dá feedback visual imediato em toda ação com espera.
export function LoadingButton({
  loading = false,
  loadingText,
  disabled,
  children,
  ...props
}: Props) {
  return (
    <Button disabled={disabled || loading} aria-busy={loading} {...props}>
      {loading && <Loader2 className="animate-spin" />}
      {loading && loadingText ? loadingText : children}
    </Button>
  );
}

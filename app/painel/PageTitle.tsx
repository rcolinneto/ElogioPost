"use client";

import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";

// O nome do negócio já aparece no topo da sidebar — o cabeçalho mostra o
// título da seção atual em vez de repetir o mesmo nome duas vezes.
export default function PageTitle() {
  const pathname = usePathname();
  const current = NAV_ITEMS.find((item) => item.href === pathname);

  return <span className="text-sm font-medium">{current?.label ?? "Painel"}</span>;
}

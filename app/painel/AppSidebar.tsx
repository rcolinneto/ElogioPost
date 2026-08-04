"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquareQuote, QrCode, Send } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const NAV_ITEMS = [
  { href: "/painel", label: "Depoimentos", icon: MessageSquareQuote },
  { href: "/painel/pedir", label: "Pedir depoimento", icon: Send },
  { href: "/painel/qrcode", label: "QR Code", icon: QrCode },
];

export default function AppSidebar({ businessName }: { businessName: string }) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="px-3 py-4">
        <span className="truncate text-sm font-semibold">{businessName}</span>
        <span className="text-xs text-muted-foreground">Painel de depoimentos</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

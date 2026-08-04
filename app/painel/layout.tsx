import { redirect } from "next/navigation";
import { Geist } from "next/font/google";
import { getCurrentBusiness } from "@/lib/business";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import AppSidebar from "./AppSidebar";

// Fonte carregada só aqui (não no layout raiz) pra não pesar as páginas
// públicas — o design system novo (Tailwind + shadcn) fica escopado a
// .painel-shell, ver app/globals.css.
const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const business = await getCurrentBusiness();
  if (!business) {
    redirect("/onboarding");
  }

  return (
    <div className={cn("painel-shell", geist.variable)}>
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar businessName={business.name} />
          <SidebarInset>
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="h-5" />
              <span className="text-sm font-medium">{business.name}</span>
            </header>
            <div className="flex-1 p-4 md:p-8">
              <div className="mx-auto w-full max-w-2xl">{children}</div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
      <Toaster />
    </div>
  );
}

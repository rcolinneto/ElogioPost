import { redirect } from "next/navigation";
import { getCurrentBusiness } from "@/lib/business";

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const business = await getCurrentBusiness();
  if (!business) {
    redirect("/onboarding");
  }

  return <>{children}</>;
}

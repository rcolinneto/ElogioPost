import { BadgeCheck, Download, MessagesSquare, Star } from "lucide-react";
import { getCurrentBusiness } from "@/lib/business";
import { getBusinessStats } from "@/lib/stats";
import { formatCompactNumber } from "@/lib/text";
import { PageHeader } from "../PageHeader";
import { StatTile } from "../StatTile";

export default async function DashboardPage() {
  const business = await getCurrentBusiness();
  if (!business) return null; // já tratado pelo layout, aqui só pro TypeScript

  const stats = await getBusinessStats(business.id);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Um resumo rápido de como seus depoimentos estão indo."
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          icon={MessagesSquare}
          label="Depoimentos recebidos"
          value={formatCompactNumber(stats.totalTestimonials)}
        />
        <StatTile
          icon={BadgeCheck}
          label="Depoimentos aprovados"
          value={formatCompactNumber(stats.approvedTestimonials)}
        />
        <StatTile
          icon={Download}
          label="Cards gerados"
          value={formatCompactNumber(stats.cardsGenerated)}
        />
        <StatTile
          icon={Star}
          label="Nota média"
          value={stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "—"}
          accent
        />
      </div>
    </>
  );
}

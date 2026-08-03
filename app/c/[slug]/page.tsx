import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CollectionForm from "./CollectionForm";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_business_by_slug", {
    p_slug: slug,
  });

  const business = data?.[0];
  if (!business) {
    notFound();
  }

  return (
    <>
      <header className="app-header">
        <h1>{business.name}</h1>
        <p>Deixe seu depoimento pra gente ✨</p>
      </header>
      <main className="app-main">
        <CollectionForm businessId={business.id} />
      </main>
    </>
  );
}

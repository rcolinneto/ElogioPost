"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Testimonial } from "@/lib/types";
import SubmissionItem from "./SubmissionItem";

const PAGE_SIZE = 10;

type SortOrder = "recent" | "oldest";
type LibraryTestimonial = Testimonial & { screenshotUrl: string | null };

// remove caracteres com significado especial no filtro do PostgREST (.or(), ilike)
function sanitizeForFilter(text: string): string {
  return text.replace(/[,()%*]/g, " ").trim();
}

type Props = {
  businessId: string;
  businessName: string;
};

export default function ApprovedLibrary({ businessId, businessName }: Props) {
  const [query, setQuery] = useState("");
  const [rating, setRating] = useState(0);
  const [sortOrder, setSortOrder] = useState<SortOrder>("recent");

  const [results, setResults] = useState<LibraryTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState(false);

  const requestId = useRef(0);
  const isFirstRun = useRef(true);

  const runSearch = useCallback(
    async (offset: number, append: boolean) => {
      const thisRequest = ++requestId.current;
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(false);

      const supabase = createClient();
      let queryBuilder = supabase
        .from("testimonials")
        .select("*")
        .eq("business_id", businessId)
        .eq("status", "approved");

      const cleanQuery = sanitizeForFilter(query);
      if (cleanQuery) {
        queryBuilder = queryBuilder.or(
          `body.ilike.%${cleanQuery}%,client_name.ilike.%${cleanQuery}%`,
        );
      }
      if (rating > 0) {
        queryBuilder = queryBuilder.eq("rating", rating);
      }

      const { data, error: queryError } = await queryBuilder
        .order("created_at", { ascending: sortOrder === "oldest" })
        .range(offset, offset + PAGE_SIZE - 1);

      // ignora resultado de uma busca antiga que chegou depois de uma mais nova
      if (thisRequest !== requestId.current) return;

      if (queryError) {
        setError(true);
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      const rows: LibraryTestimonial[] = (data ?? []).map((t) => ({
        ...t,
        screenshotUrl: null,
      }));
      setResults((prev) => (append ? [...prev, ...rows] : rows));
      setHasMore(rows.length === PAGE_SIZE);
      setLoading(false);
      setLoadingMore(false);
    },
    [businessId, query, rating, sortOrder],
  );

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      runSearch(0, false);
      return;
    }
    const timeout = setTimeout(() => runSearch(0, false), 350);
    return () => clearTimeout(timeout);
  }, [runSearch]);

  const filtersActive = query.trim() !== "" || rating > 0;

  return (
    <>
      <label htmlFor="librarySearch">Buscar</label>
      <input
        id="librarySearch"
        type="text"
        placeholder="Nome do cliente ou trecho do depoimento"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div style={{ display: "flex", gap: 10, marginTop: 0 }}>
        <div style={{ flex: 1 }}>
          <label htmlFor="libraryRating">Nota</label>
          <select
            id="libraryRating"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          >
            <option value={0}>Todas as notas</option>
            <option value={5}>5 estrelas</option>
            <option value={4}>4 estrelas</option>
            <option value={3}>3 estrelas</option>
            <option value={2}>2 estrelas</option>
            <option value={1}>1 estrela</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label htmlFor="librarySort">Ordenar</label>
          <select
            id="librarySort"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
          >
            <option value="recent">Mais recente</option>
            <option value="oldest">Mais antigo</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="empty">Carregando...</div>
      ) : error ? (
        <div className="error-msg" style={{ marginTop: 14 }}>
          Não deu pra buscar os depoimentos agora. Tenta de novo.
        </div>
      ) : results.length === 0 ? (
        <div className="empty">
          {filtersActive
            ? "Nenhum depoimento encontrado com esses filtros."
            : "Nada por aqui ainda."}
        </div>
      ) : (
        <>
          {results.map((t) => (
            <SubmissionItem key={t.id} testimonial={t} businessName={businessName} />
          ))}
          {hasMore && (
            <button
              type="button"
              className="primary"
              onClick={() => runSearch(results.length, true)}
              disabled={loadingMore}
            >
              {loadingMore ? "Carregando..." : "Carregar mais"}
            </button>
          )}
        </>
      )}
    </>
  );
}

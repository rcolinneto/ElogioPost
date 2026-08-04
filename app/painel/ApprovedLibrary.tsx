"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Testimonial } from "@/lib/types";
import SubmissionItem from "./SubmissionItem";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  defaultCardStyle: string;
};

export default function ApprovedLibrary({ businessId, businessName, defaultCardStyle }: Props) {
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
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="librarySearch">Buscar</Label>
        <Input
          id="librarySearch"
          type="text"
          placeholder="Nome do cliente ou trecho do depoimento"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="flex gap-2.5">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="libraryRating">Nota</Label>
          <Select value={String(rating)} onValueChange={(v) => setRating(Number(v))}>
            <SelectTrigger id="libraryRating" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Todas as notas</SelectItem>
              <SelectItem value="5">5 estrelas</SelectItem>
              <SelectItem value="4">4 estrelas</SelectItem>
              <SelectItem value="3">3 estrelas</SelectItem>
              <SelectItem value="2">2 estrelas</SelectItem>
              <SelectItem value="1">1 estrela</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="librarySort">Ordenar</Label>
          <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as SortOrder)}>
            <SelectTrigger id="librarySort" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Mais recente</SelectItem>
              <SelectItem value="oldest">Mais antigo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Carregando...</p>
      ) : error ? (
        <p className="text-sm text-destructive">
          Não deu pra buscar os depoimentos agora. Tenta de novo.
        </p>
      ) : results.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          {filtersActive
            ? "Nenhum depoimento encontrado com esses filtros."
            : "Nada por aqui ainda."}
        </p>
      ) : (
        <div className="space-y-3">
          {results.map((t) => (
            <SubmissionItem
              key={t.id}
              testimonial={t}
              businessName={businessName}
              defaultCardStyle={defaultCardStyle}
            />
          ))}
          {hasMore && (
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => runSearch(results.length, true)}
              disabled={loadingMore}
            >
              {loadingMore ? "Carregando..." : "Carregar mais"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

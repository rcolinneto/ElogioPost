export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Formata número grande de forma compacta (1284 -> "1,3 mil") pra caber num
// stat tile sem quebrar o layout — na prática a maioria dos negócios nunca
// passa de 3 dígitos, mas evita redesenhar o tile se um dia passar.
export function formatCompactNumber(n: number): string {
  return new Intl.NumberFormat("pt-BR", { notation: "compact" }).format(n);
}

// Aplica um arquivo .sql de supabase/migrations/ direto no banco, via
// Management API (não precisa do Supabase CLI linkado nem de senha de
// banco). Uso: node --env-file=.env.local scripts/run-sql.mjs <arquivo.sql>
import { readFileSync } from "node:fs";

const PROJECT_REF = "qnevvjhqukdrpjicmrup";

const [, , sqlFile] = process.argv;
if (!sqlFile) {
  console.error("Uso: node --env-file=.env.local scripts/run-sql.mjs <arquivo.sql>");
  process.exit(1);
}

const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) {
  console.error("SUPABASE_ACCESS_TOKEN não encontrado — rode com --env-file=.env.local");
  process.exit(1);
}

const sql = readFileSync(sqlFile, "utf8");

try {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });
  const text = await res.text();
  console.log("HTTP", res.status);
  console.log(text);
  if (!res.ok) process.exit(1);
} catch (err) {
  console.error(err);
  process.exit(1);
}

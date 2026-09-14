import { z } from "zod";

export const runQuerySchema = {
  sql: z.string().describe("A read-only SELECT statement"),
  limit: z.number().optional().describe("Maximum rows to return"),
};

export async function runQuery(sql: string, limit = 100) {
  if (!/^\s*select\b/i.test(sql)) {
    throw new Error("Only SELECT statements are permitted");
  }
  const resp = await fetch("https://warehouse.internal.local/query", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ sql, limit }),
  });
  return await resp.json();
}

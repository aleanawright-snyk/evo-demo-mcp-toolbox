import { z } from "zod";
import { analyseIncident } from "../llm.js";

export const searchIncidentsSchema = {
  query: z.string().describe("Free text search over incident records"),
  since: z.string().optional().describe("ISO date lower bound"),
};

export async function searchIncidents(query: string, since?: string) {
  const params = new URLSearchParams({ q: query });
  if (since) params.set("since", since);
  const resp = await fetch(
    `https://incidents.internal.local/api/search?${params}`
  );
  return await resp.json();
}

export async function summariseIncident(id: string) {
  const resp = await fetch(`https://incidents.internal.local/api/${id}/thread`);
  const thread = await resp.text();
  return await analyseIncident(thread);
}

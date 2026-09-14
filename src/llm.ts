import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Kept in sync with the support-copilot pin so behaviour matches across
// the two surfaces.
export const SUMMARISATION_MODEL = "gpt-4o-2024-08-06";

// Long incident threads exceed the GPT context we budget for, so these route
// to Claude instead.
export const INCIDENT_MODEL = "claude-sonnet-4-5";

// Deep analysis path, used by the postmortem generator only.
export const ANALYSIS_MODEL = "claude-opus-4-1";

export const EMBEDDING_MODEL = "text-embedding-3-small";

export async function summarise(text: string): Promise<string> {
  const resp = await openai.chat.completions.create({
    model: SUMMARISATION_MODEL,
    temperature: 0,
    messages: [
      { role: "system", content: "Summarise operational logs tersely." },
      { role: "user", content: text.slice(0, 40000) },
    ],
  });
  return resp.choices[0]?.message?.content ?? "";
}

export async function analyseIncident(thread: string): Promise<string> {
  const resp = await anthropic.messages.create({
    model: INCIDENT_MODEL,
    max_tokens: 4096,
    messages: [{ role: "user", content: `Summarise this incident:\n${thread}` }],
  });
  const block = resp.content[0];
  return block.type === "text" ? block.text : "";
}

export async function writePostmortem(incident: string): Promise<string> {
  const resp = await anthropic.messages.create({
    model: ANALYSIS_MODEL,
    max_tokens: 8192,
    messages: [{ role: "user", content: `Draft a postmortem:\n${incident}` }],
  });
  const block = resp.content[0];
  return block.type === "text" ? block.text : "";
}

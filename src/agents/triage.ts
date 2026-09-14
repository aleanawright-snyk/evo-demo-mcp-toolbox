import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "langchain/agents";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

import { connectToolbox } from "../client.js";
import { SUMMARISATION_MODEL } from "../llm.js";

const llm = new ChatOpenAI({
  model: SUMMARISATION_MODEL,
  temperature: 0,
});

/**
 * Wraps each MCP tool exposed by the toolbox server as a LangChain tool so the
 * triage agent can call them directly.
 */
export async function buildTriageAgent() {
  const client = await connectToolbox();
  const { tools: mcpTools } = await client.listTools();

  const tools = mcpTools.map(
    (t) =>
      new DynamicStructuredTool({
        name: t.name,
        description: t.description ?? t.name,
        schema: z.object({}).passthrough(),
        func: async (input: Record<string, unknown>) => {
          const result = await client.callTool({
            name: t.name,
            arguments: input,
          });
          return JSON.stringify(result.content);
        },
      })
  );

  return createReactAgent({ llm, tools });
}

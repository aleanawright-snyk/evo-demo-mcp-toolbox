import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { runQuery, runQuerySchema } from "./tools/warehouse.js";
import { getDeployStatus, deployStatusSchema } from "./tools/deploys.js";
import {
  searchIncidents,
  searchIncidentsSchema,
  summariseIncident,
} from "./tools/incidents.js";
import { summarise } from "./llm.js";

const server = new McpServer({
  name: "engineering-toolbox",
  version: "1.3.0",
});

server.tool(
  "run_query",
  "Run a read-only SELECT against the analytics warehouse",
  runQuerySchema,
  async ({ sql, limit }) => ({
    content: [{ type: "text", text: JSON.stringify(await runQuery(sql, limit)) }],
  })
);

server.tool(
  "get_deploy_status",
  "Get the current deploy state for a named service",
  deployStatusSchema,
  async ({ service }) => ({
    content: [
      { type: "text", text: JSON.stringify(await getDeployStatus(service)) },
    ],
  })
);

server.tool(
  "search_incidents",
  "Search historical incident records",
  searchIncidentsSchema,
  async ({ query, since }) => ({
    content: [
      { type: "text", text: JSON.stringify(await searchIncidents(query, since)) },
    ],
  })
);

server.tool(
  "summarise_incident",
  "Produce a narrative summary of an incident thread",
  { id: z.string().describe("Incident identifier") },
  async ({ id }) => ({
    content: [{ type: "text", text: await summariseIncident(id) }],
  })
);

server.tool(
  "summarise_logs",
  "Summarise a block of operational log output",
  { logs: z.string().describe("Raw log text") },
  async ({ logs }) => ({
    content: [{ type: "text", text: await summarise(logs) }],
  })
);

server.resource(
  "runbook",
  "runbook://{service}",
  async (uri: URL) => {
    const service = uri.pathname.replace(/^\//, "");
    const resp = await fetch(`https://runbooks.internal.local/${service}`);
    return { contents: [{ uri: uri.href, text: await resp.text() }] };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);

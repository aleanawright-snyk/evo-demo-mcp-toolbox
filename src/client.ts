import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export async function connectToolbox() {
  const transport = new StdioClientTransport({
    command: "node",
    args: ["dist/server.js"],
  });
  const client = new Client(
    { name: "triage-agent", version: "1.0.0" },
    { capabilities: {} }
  );
  await client.connect(transport);
  return client;
}

export async function listToolboxTools() {
  const client = await connectToolbox();
  const { tools } = await client.listTools();
  return tools.map((t) => t.name);
}

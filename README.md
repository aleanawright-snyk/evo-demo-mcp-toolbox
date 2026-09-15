# MCP Toolbox

Internal MCP demo server that exposes shared engineering tools to agents across the
org, so each team does not rebuild the same integrations.

Also ships a small triage agent that consumes the server over MCP.

## Tools exposed
- `run_query` — read-only query against the analytics warehouse
- `get_deploy_status` — current deploy state for a service
- `search_incidents` — search past incident records
- `summarise_logs` — LLM-backed log summarisation

## Running

    npm install && npm run build && npm start

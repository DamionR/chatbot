import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const server = new McpServer({ name: "FetchAPI", version: "1.0.0" });

server.tool(
  "fetch_get",
  {
    url: z.string().url().describe("The URL to send the GET request to"),
    headers: z.record(z.string()).optional().describe("Optional headers as key-value pairs"),
    context: z.string().optional().describe("Conversation history for context"),
    prompt: z.string().optional().describe("Prompt guiding the request")
  },
  async ({ url, headers, context, prompt }) => {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      const data = await response.text();
      return { content: [{ type: "text", text: data }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
);

server.tool(
  "fetch_post",
  {
    url: z.string().url().describe("The URL to send the POST request to"),
    body: z.any().describe("The request body (will be JSON-stringified)"),
    headers: z.record(z.string()).optional().describe("Optional headers as key-value pairs"),
    context: z.string().optional().describe("Conversation history for context"),
    prompt: z.string().optional().describe("Prompt guiding the request")
  },
  async ({ url, body, headers, context, prompt }) => {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: headers || { "Content-Type": "application/json" },
        body: JSON.stringify(body || {})
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      const data = await response.text();
      return { content: [{ type: "text", text: data }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
);

server.start();
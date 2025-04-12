import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const server = new McpServer({ name: "Translator", version: "1.0.0" });

server.tool(
  "translate",
  {
    text: z.string().describe("Text to translate"),
    targetLang: z.string().describe("Target language code (e.g., 'es')")
  },
  async ({ text, targetLang }) => {
    try {
      const response = await fetch(`${BACKEND_URL}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLang })
      });
      const data = await response.json();
      return { content: [{ type: "text", text: data.translation }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
);

server.start();
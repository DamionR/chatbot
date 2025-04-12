import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const server = new McpServer({ name: "Calculator", version: "1.0.0" });

server.tool(
  "calculate",
  { expression: z.string().describe("Mathematical expression to evaluate") },
  async ({ expression }) => {
    try {
      const result = eval(expression); // Use safe-eval in production
      return { content: [{ type: "text", text: String(result) }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
);

server.start();
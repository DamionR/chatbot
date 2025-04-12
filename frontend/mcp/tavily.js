import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const TAVILY_API_KEY = localStorage.getItem('TAVILY_API_KEY') || ''; // Client-side storage

const server = new McpServer({ name: "Tavily", version: "1.0.0" });

if (!TAVILY_API_KEY) {
  server.tool("tavily_search", {}, async () => {
    return { content: [{ type: "text", text: "Error: TAVILY_API_KEY not set" }], isError: true };
  });
  server.tool("tavily_extract", {}, async () => {
    return { content: [{ type: "text", text: "Error: TAVILY_API_KEY not set" }], isError: true };
  });
} else {
  server.tool(
    "tavily_search",
    { query: z.string().describe("The search query") },
    async ({ query }) => {
      try {
        const response = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${TAVILY_API_KEY}`,
          },
          body: JSON.stringify({ query, api_key: TAVILY_API_KEY }),
        });
        if (!response.ok) throw new Error(`API error: ${response.status} - ${response.statusText}`);
        const data = await response.json();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "tavily_extract",
    { url: z.string().describe("The URL to extract content from") },
    async ({ url }) => {
      try {
        const response = await fetch("https://api.tavily.com/extract", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${TAVILY_API_KEY}`,
          },
          body: JSON.stringify({ url, api_key: TAVILY_API_KEY }),
        });
        if (!response.ok) throw new Error(`API error: ${response.status} - ${response.statusText}`);
        const data = await response.json();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
    }
  );
}

server.start();
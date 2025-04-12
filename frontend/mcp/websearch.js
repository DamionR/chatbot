import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const server = new McpServer({ name: "WebSearch", version: "1.0.0" });

server.tool(
  "web_search",
  {
    query: z.string().describe("The search query"),
    numResults: z.number().optional().default(5).describe("Number of results to return"),
    language: z.string().optional().describe("Language code (e.g., 'en')"),
    region: z.string().optional().describe("Region code (e.g., 'us')"),
    excludeDomains: z.array(z.string()).optional().describe("Domains to exclude"),
    includeDomains: z.array(z.string()).optional().describe("Domains to include"),
    excludeTerms: z.array(z.string()).optional().describe("Terms to exclude"),
    resultType: z.enum(["all", "news", "blogs"]).optional().describe("Type of results to return"),
  },
  async ({ query, numResults, language, region, excludeDomains, includeDomains, excludeTerms, resultType }) => {
    try {
      const response = await fetch(`${BACKEND_URL}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          numResults,
          language,
          region,
          excludeDomains,
          includeDomains,
          excludeTerms,
          resultType,
        }),
      });
      if (!response.ok) throw new Error(`API error: ${response.status} - ${response.statusText}`);
      const data = await response.json();
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
);

server.start();
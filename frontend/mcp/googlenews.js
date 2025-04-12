import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const SERP_API_KEY = localStorage.getItem('SERP_API_KEY') || ''; // Client-side storage

const server = new McpServer({ name: "GoogleNews", version: "1.0.0" });

if (!SERP_API_KEY) {
  server.tool("google_news_search", {}, async () => {
    return { content: [{ type: "text", text: "Error: SERP_API_KEY not set" }], isError: true };
  });
} else {
  server.tool(
    "google_news_search",
    {
      q: z.string().describe("The search query"),
      gl: z.string().optional().describe("Country code (e.g., 'us')"),
      hl: z.string().optional().describe("Language code (e.g., 'en')"),
      topic_token: z.string().optional().describe("Google News topic token"),
      publication_token: z.string().optional().describe("Publication token"),
      story_token: z.string().optional().describe("Story token"),
      section_token: z.string().optional().describe("Section token"),
    },
    async ({ q, gl, hl, topic_token, publication_token, story_token, section_token }) => {
      try {
        const params = new URLSearchParams({
          engine: "google_news",
          q,
          ...(gl && { gl }),
          ...(hl && { hl }),
          ...(topic_token && { topic_token }),
          ...(publication_token && { publication_token }),
          ...(story_token && { story_token }),
          ...(section_token && { section_token }),
          api_key: SERP_API_KEY,
        });
        const response = await fetch(`https://serpapi.com/search?${params.toString()}`, {
          method: "GET",
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
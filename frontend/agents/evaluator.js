import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const server = new McpServer({ name: "Evaluator", version: "1.0.0" });

// Tool: evaluate_response - Evaluate a response for accuracy and relevance
server.tool(
  "evaluate_response",
  {
    response: z.string().describe("The response to evaluate"),
    context: z.string().optional().describe("Conversation history for context"),
    sessionId: z.string().describe("The session ID for the evaluation"),
    prompt: z.string().optional().describe("Prompt guiding the evaluation")
  },
  async ({ response, context, sessionId, prompt }) => {
    try {
      let relevanceScore = 0.5;
      if (context) {
        const contextData = JSON.parse(context);
        const lastChat = contextData[contextData.length - 1];
        if (lastChat && lastChat.content) {
          const queryWords = lastChat.content.toLowerCase().split(/\s+/).filter(w => w.length > 3);
          const responseWords = response.toLowerCase().split(/\s+/).filter(w => w.length > 3);
          const commonWords = queryWords.filter(word => responseWords.includes(word));
          relevanceScore = commonWords.length / Math.max(queryWords.length, 1);
        }
      }

      const wordCount = response.split(/\s+/).length;
      const clarityScore = wordCount < 50 ? 0.9 : wordCount < 150 ? 0.7 : wordCount < 300 ? 0.5 : 0.3;
      let errorScore = response.toLowerCase().includes("error") ? 0.2 : 1.0;
      const overallScore = (relevanceScore * 0.4 + clarityScore * 0.4 + errorScore * 0.2);

      if (overallScore < 0.5) {
        const refined = await server.callTool("refine_response", { response, context, sessionId, prompt });
        return { content: [{ type: "text", text: refined.content[0].text }] };
      }

      return { content: [{ type: "text", text: response }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
);

// Tool: refine_response - Refine a response for better clarity and relevance
server.tool(
  "refine_response",
  {
    response: z.string().describe("The response to refine"),
    context: z.string().optional().describe("Conversation history for context"),
    sessionId: z.string().describe("The session ID for the refinement"),
    prompt: z.string().optional().describe("Prompt guiding the refinement")
  },
  async ({ response, context, sessionId, prompt }) => {
    try {
      let refinedResponse = response;
      if (response.length > 500) {
        refinedResponse = response.substring(0, 200) + "... (summarized for clarity)";
      } else if (response.toLowerCase().includes("error")) {
        refinedResponse = `It looks like there was an issue. Here's a clearer version: ${response.replace(/error/gi, 'challenge')}`;
      }
      return { content: [{ type: "text", text: refinedResponse }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
);

server.start();
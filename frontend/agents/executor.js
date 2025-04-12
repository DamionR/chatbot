import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const server = new McpServer({ name: "Executor", version: "1.0.0" });
const BACKEND_URL = "http://localhost:3000";

const clients = {};
async function setupClients() {
  const servers = {
    calculator: "calculate",
    translator: "translate",
    websearch: "web_search",
    chatstore: "get_chats",
    github: "get_issue",
    email: "send_email",
    whois: "whois_domain",
    fetchapi: "fetch_get"
  };

  for (const [name, tool] of Object.entries(servers)) {
    clients[name] = {
      callTool: async (toolName, args) => {
        try {
          const response = await fetch(`${BACKEND_URL}/api/tool`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ agent: name, tool: toolName, args })
          });
          if (!response.ok) throw new Error(`API error: ${response.status}`);
          return await response.json();
        } catch (error) {
          return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
        }
      }
    };
  }
}

server.tool(
  "execute_task",
  {
    task: z.string().describe("The task to execute"),
    context: z.string().optional().describe("Conversation history for context"),
    sessionId: z.string().describe("The session ID for the task"),
    prompt: z.string().optional().describe("Prompt guiding the execution")
  },
  async ({ task, context, sessionId, prompt }) => {
    try {
      const lowerTask = task.toLowerCase();
      const toolScores = [
        { agent: "calculator", tool: "calculate", keywords: ["calculate", "math"], score: 0 },
        { agent: "translator", tool: "translate", keywords: ["translate", "language"], score: 0 },
        { agent: "websearch", tool: "web_search", keywords: ["search", "web"], score: 0 },
        { agent: "chatstore", tool: "get_chats", keywords: ["history", "chat"], score: 0 },
        { agent: "github", tool: "get_issue", keywords: ["github", "issue"], score: 0 },
        { agent: "email", tool: "send_email", keywords: ["email", "send"], score: 0 },
        { agent: "whois", tool: "whois_domain", keywords: ["whois", "domain"], score: 0 },
        { agent: "fetchapi", tool: "fetch_get", keywords: ["fetch", "http"], score: 0 }
      ];

      for (const tool of toolScores) {
        tool.score = tool.keywords.reduce((sum, k) => sum + (lowerTask.includes(k) ? 1 : 0), 0) / tool.keywords.length;
      }

      const selectedTool = toolScores.sort((a, b) => b.score - a.score)[0];
      if (selectedTool.score > 0.1 && clients[selectedTool.agent]) {
        const args = {
          sessionId,
          ...(selectedTool.tool === "calculate" ? { expression: task.replace(/[^0-9+\-*/(). ]/g, "") } :
             selectedTool.tool === "translate" ? { text: task.replace(/translate|to|french|spanish/gi, "").trim(), targetLang: task.includes("French") ? "fr" : "es" } :
             selectedTool.tool === "web_search" ? { query: task.replace(/search|for/gi, "").trim() } :
             selectedTool.tool === "get_chats" ? { sessionId } :
             selectedTool.tool === "get_issue" ? { owner: "DamionR", repo: "chatbot", issue_number: parseInt(task.match(/\d+/)?.[0] || "1") } :
             selectedTool.tool === "send_email" ? { receiver: task.match(/to\s+([^\s]+)/)?.[1] || "test@example.com", subject: "Chatbot Email", body: task } :
             selectedTool.tool === "whois_domain" ? { domain: task.replace(/whois/gi, "").trim() } :
             selectedTool.tool === "fetch_get" ? { query: task.replace(/fetch/gi, "").trim() } :
             { query: task })
        };
        const result = await clients[selectedTool.agent].callTool(selectedTool.tool, args);
        return { content: [{ type: "text", text: result.content[0].text }] };
      }

      return { content: [{ type: "text", text: "No suitable agent found for the task" }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
);

setupClients().then(() => server.start());
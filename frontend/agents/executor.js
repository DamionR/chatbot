import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const server = new McpServer({ name: "Executor", version: "1.0.0" });

const clients = {};
async function setupClients() {
  const servers = {
    email: "../mcp/email.js",
    filesystem: "../mcp/filesystem.js",
    github: "../mcp/github.js",
    googlenews: "../mcp/googlenews.js",
    sequentialthinking: "../mcp/sequentialthinking.js",
    tavily: "../mcp/tavily.js",
    websearch: "../mcp/websearch.js",
    whois: "../mcp/whois.js",
    chatstore: "../mcp/chatstore.js",
    calculator: "../mcp/calculator.js",
    translator: "../mcp/translator.js",
    fetchapi: "../mcp/fetchapi.js"
  };

  for (const [name, path] of Object.entries(servers)) {
    try {
      const client = new Client({ name: `${name}ExecutorClient`, version: "1.0.0" });
      const transport = new StdioClientTransport({ command: "node", args: [path] });
      await client.connect(transport);
      clients[name] = client;
      console.log(`Executor connected to ${name} agent`);
    } catch (error) {
      console.error(`Executor failed to connect to ${name} agent: ${error}`);
    }
  }
}

// Tool: execute_task - Execute a task by delegating to other agents
server.tool(
  "execute_task",
  {
    task: z.string().describe("The task to execute (e.g., 'calculate 2+2 and email result')"),
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
        { agent: "email", tool: "send_email", keywords: ["email", "send"], score: 0 },
        { agent: "filesystem", tool: "read_file", keywords: ["file", "read"], score: 0 },
        { agent: "googlenews", tool: "google_news_search", keywords: ["news"], score: 0 },
        { agent: "whois", tool: "whois_domain", keywords: ["whois", "domain"], score: 0 },
        { agent: "chatstore", tool: "get_chats", keywords: ["history", "chat"], score: 0 },
        { agent: "fetchapi", tool: "fetch_get", keywords: ["fetch", "http"], score: 0 }
      ];

      for (const tool of toolScores) {
        tool.score = tool.keywords.reduce((sum, k) => sum + (lowerTask.includes(k) ? 1 : 0), 0) / tool.keywords.length;
      }

      const selectedTool = toolScores.sort((a, b) => b.score - a.score)[0];
      if (selectedTool.score > 0.1 && clients[selectedTool.agent]) {
        const result = await clients[selectedTool.agent].callTool(selectedTool.tool, { 
          [selectedTool.tool === "calculate" ? "expression" : "text"]: task, 
          sessionId 
        });
        return { content: [{ type: "text", text: result.content[0].text }] };
      }

      return { content: [{ type: "text", text: "No suitable agent found for the task" }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
);

// Initialize clients and start the server
setupClients().then(() => {
  server.start();
}).catch(error => {
  console.error('Failed to start Executor agent:', error);
});
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { saveChat, getChats } from '../../backend/db.js';

const server = new McpServer({ name: "Chatstore", version: "1.0.0" });

server.tool(
  "save_chat",
  {
    role: z.enum(['user', 'assistant', 'system']).describe("The role of the message sender"),
    content: z.string().describe("The content of the chat message"),
    sessionId: z.string().describe("The session ID for the chat"),
    prompt: z.string().optional().describe("Prompt guiding the save operation")
  },
  async ({ role, content, sessionId, prompt }) => {
    try {
      if (!sessionId) throw new Error("Session ID is required");
      await saveChat({ role, content }, sessionId);
      return { content: [{ type: "text", text: "Chat message saved successfully" }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
);

server.tool(
  "get_chats",
  {
    sessionId: z.string().describe("The session ID for the chats"),
    limit: z.number().optional().default(10).describe("Maximum number of chats to retrieve"),
    query: z.string().optional().describe("Optional query to filter chats by content"),
    prompt: z.string().optional().describe("Prompt guiding the retrieval")
  },
  async ({ sessionId, limit, query, prompt }) => {
    try {
      if (!sessionId) throw new Error("Session ID is required");
      const chats = await getChats(sessionId, limit, query);
      return { content: [{ type: "text", text: JSON.stringify(chats, null, 2) }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
);

server.start();
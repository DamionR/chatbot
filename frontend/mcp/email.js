import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const server = new McpServer({ name: "Email", version: "1.0.0" });

server.tool(
  "send_email",
  {
    receiver: z.array(z.string()).describe("Array of recipient email addresses"),
    subject: z.string().describe("Email subject"),
    body: z.string().describe("Email body text"),
    attachments: z.array(z.string()).optional().describe("Array of file paths to attach"),
  },
  async ({ receiver, subject, body, attachments }) => {
    try {
      const response = await fetch(`${BACKEND_URL}/email/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiver, subject, body, attachments })
      });
      const data = await response.json();
      return { content: [{ type: "text", text: data.message }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
);

server.start();
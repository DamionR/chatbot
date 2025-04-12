import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import cors from "cors";
import { Octokit } from "@octokit/rest";
import fetch from "node-fetch";
import nodemailer from "nodemailer";
import whois from "whois-json";
import dotenv from "dotenv";
import { saveChat, getChats } from "./db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = new McpServer({ name: "ChatbotBackend", version: "1.0.0" });

// Calculator tool
server.tool(
  "calculate",
  { expression: z.string().describe("Mathematical expression to evaluate") },
  async ({ expression }) => {
    try {
      const cleanExpression = expression.replace(/[^0-9+\-*/(). ]/g, "");
      const result = eval(cleanExpression);
      if (isNaN(result) || !isFinite(result)) throw new Error("Invalid calculation result");
      return { content: [{ type: "text", text: String(result) }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
);

// Translator tool (Google Translate API)
server.tool(
  "translate",
  {
    text: z.string().describe("Text to translate"),
    targetLang: z.string().describe("Target language code (e.g., 'es', 'fr')")
  },
  async ({ text, targetLang }) => {
    try {
      const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
      if (!apiKey) throw new Error("Google Translate API key missing");
      const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: text,
          target: targetLang,
          format: "text"
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      const translatedText = data.data.translations[0].translatedText;
      return { content: [{ type: "text", text: translatedText }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
);

// Web search tool (SerpAPI)
server.tool(
  "web_search",
  { query: z.string().describe("Search query") },
  async ({ query }) => {
    try {
      const apiKey = process.env.SERP_API_KEY;
      if (!apiKey) throw new Error("SerpAPI key missing");
      const url = `https://serpapi.com/search?api_key=${apiKey}&q=${encodeURIComponent(query)}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      const results = data.organic_results
        ?.slice(0, 3)
        .map(r => `${r.title}: ${r.link}`)
        .join("\n") || "No results found";
      return { content: [{ type: "text", text: results }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
);

// Chat store tool
server.tool(
  "get_chats",
  {
    sessionId: z.string().describe("Session ID"),
    limit: z.number().optional().default(50).describe("Maximum number of chats to retrieve")
  },
  async ({ sessionId, limit }) => {
    try {
      const chats = await getChats(sessionId, limit);
      const history = chats.map(m => `${m.role}: ${m.content}`).join("\n") || "No messages yet";
      return { content: [{ type: "text", text: history }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
);

// Chat save tool
server.tool(
  "save_chat",
  {
    role: z.enum(['user', 'assistant', 'system']).describe("Role of the message sender"),
    content: z.string().describe("Content of the chat message"),
    sessionId: z.string().describe("Session ID")
  },
  async ({ role, content, sessionId }) => {
    try {
      await saveChat({ role, content }, sessionId);
      return { content: [{ type: "text", text: "Chat message saved" }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
);

// GitHub tool
server.tool(
  "get_issue",
  {
    owner: z.string().describe("GitHub repo owner"),
    repo: z.string().describe("GitHub repo name"),
    issue_number: z.number().describe("Issue number")
  },
  async ({ owner, repo, issue_number }) => {
    try {
      const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
      const { data } = await octokit.issues.get({ owner, repo, issue_number });
      return { content: [{ type: "text", text: `Issue #${issue_number}: ${data.title}\n${data.body || "No description"}` }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
);

// Email tool
server.tool(
  "send_email",
  {
    receiver: z.string().email().describe("Recipient email"),
    subject: z.string().describe("Email subject"),
    body: z.string().describe("Email body")
  },
  async ({ receiver, subject, body }) => {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: receiver,
        subject,
        text: body
      });
      return { content: [{ type: "text", text: `Email sent to ${receiver}` }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
);

// Whois tool
server.tool(
  "whois_domain",
  { domain: z.string().describe("Domain name") },
  async ({ domain }) => {
    try {
      const data = await whois(domain);
      const summary = `Domain: ${data.domainName}\nRegistrar: ${data.registrar || "Unknown"}\nRegistered: ${data.creationDate || "Unknown"}`;
      return { content: [{ type: "text", text: summary }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
);

// Fetch API tool
server.tool(
  "fetch_get",
  { query: z.string().url().describe("URL to fetch") },
  async ({ query }) => {
    try {
      const response = await fetch(query);
      const text = await response.text();
      return { content: [{ type: "text", text: text.slice(0, 200) }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
);

// Evaluate response tool
server.tool(
  "evaluate_response",
  {
    response: z.string().describe("The response to evaluate"),
    context: z.string().optional().describe("Conversation history"),
    sessionId: z.string().describe("Session ID"),
    prompt: z.string().optional().describe("Prompt guiding evaluation")
  },
  async ({ response, context, sessionId, prompt }) => {
    try {
      const contextWords = context ? JSON.parse(context).map(c => c.user.toLowerCase()).join(" ") : "";
      const score = response.length > 10 && (!contextWords || contextWords.includes(response.toLowerCase())) ? 0.8 : 0.5;
      const refined = score > 0.7 ? response : response.trim() || "No response";
      return { content: [{ type: "text", text: refined }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
);

// API endpoint to handle tool calls
app.post("/api/tool", async (req, res) => {
  const { agent, tool, args } = req.body;
  try {
    const result = await server.callTool(tool, args);
    res.json(result);
  } catch (error) {
    res.status(500).json({ content: [{ type: "text", text: `Error: ${error.message}` }], isError: true });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
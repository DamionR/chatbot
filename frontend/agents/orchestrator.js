import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

class Orchestrator {
  constructor() {
    this.clients = {};
    this.context = [];
    this.agentRoles = {
      email: "Email Handler",
      filesystem: "File Manager",
      github: "GitHub Integrator",
      googlenews: "News Fetcher",
      sequentialthinking: "Reasoning Assistant",
      tavily: "Web Searcher",
      websearch: "Basic Searcher",
      whois: "Domain Lookup",
      chatstore: "Context Manager",
      calculator: "Math Solver",
      translator: "Language Expert",
      fetchapi: "Web Client",
      executor: "Task Coordinator",
      evaluator: "Quality Assessor"
    };
  }

  async setupClients() {
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
      fetchapi: "../mcp/fetchapi.js",
      executor: "./executor.js",
      evaluator: "./evaluator.js"
    };

    for (const [name, path] of Object.entries(servers)) {
      try {
        const client = new Client({ name: `${name}Client`, version: "1.0.0" });
        const transport = new StdioClientTransport({ command: "node", args: [path] });
        await client.connect(transport);
        this.clients[name] = client;
        console.log(`Connected to ${name} agent`);
      } catch (error) {
        console.error(`Failed to connect to ${name} agent: ${error}`);
      }
    }
  }

  generatePrompt(agent, task, context) {
    const role = this.agentRoles[agent] || "Unknown Agent";
    return `You are the ${role}. Your task is: "${task}". Use the following conversation history for context: ${context || "No context available"}. Provide a clear, concise response.`;
  }

  async handleMessage(message, sessionId, callback) {
    this.context.push({ user: message });
    try {
      const chatHistory = await this.clients.chatstore.callTool("get_chats", { sessionId });
      const context = chatHistory.content[0].text;

      const executorPrompt = this.generatePrompt("executor", message, context);
      const result = await this.clients.executor.callTool("execute_task", { task: message, context, sessionId, prompt: executorPrompt });

      const evaluatorPrompt = this.generatePrompt("evaluator", `Evaluate and refine: "${result.content[0].text}"`, context);
      const evaluation = await this.clients.evaluator.callTool("evaluate_response", {
        response: result.content[0].text,
        context,
        sessionId,
        prompt: evaluatorPrompt
      });

      const finalResponse = evaluation.content[0].text;
      this.context.push({ bot: finalResponse });
      if (this.context.length > 10) this.context.shift();
      callback(finalResponse);
      return finalResponse;
    } catch (error) {
      const errorResponse = `Oops, something went wrong: ${error.message}`;
      callback(errorResponse);
      return errorResponse;
    }
  }
}

export default Orchestrator;
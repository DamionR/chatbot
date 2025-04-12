import { evaluateResponse } from "./evaluator.js";

class Orchestrator {
  constructor() {
    this.clients = {};
    this.context = [];
    this.agentRoles = {
      calculator: "Math Solver",
      translator: "Language Expert",
      websearch: "Web Searcher",
      chatstore: "Context Manager",
      github: "GitHub Integrator",
      email: "Email Handler",
      whois: "Domain Lookup",
      fetchapi: "Web Client",
      executor: "Task Coordinator",
      evaluator: "Quality Assessor"
    };
  }

  async setupClients() {
    const BACKEND_URL = "http://localhost:3000";
    const servers = {
      calculator: "calculate",
      translator: "translate",
      websearch: "web_search",
      chatstore: "get_chats",
      github: "get_issue",
      email: "send_email",
      whois: "whois_domain",
      fetchapi: "fetch_get",
      executor: "execute_task",
      evaluator: "evaluate_response"
    };

    for (const [name, tool] of Object.entries(servers)) {
      this.clients[name] = {
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

  generatePrompt(agent, task, context) {
    const role = this.agentRoles[agent] || "Unknown Agent";
    return `You are the ${role}. Your task is: "${task}". Use the following conversation history for context: ${context || "No context available"}. Provide a clear, concise response.`;
  }

  async handleMessage(message, sessionId, callback) {
    this.context.push({ user: message });
    try {
      const context = JSON.stringify(this.context);
      const executorPrompt = this.generatePrompt("executor", message, context);
      const result = await this.clients.executor.callTool("execute_task", {
        task: message,
        context,
        sessionId,
        prompt: executorPrompt
      });

      const evaluatorPrompt = this.generatePrompt("evaluator", `Evaluate and refine: "${result.content[0].text}"`, context);
      const evaluation = await evaluateResponse({
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
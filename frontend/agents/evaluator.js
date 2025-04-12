import { z } from "zod";

const BACKEND_URL = "http://localhost:3000";

async function callBackendTool(toolName, args) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/tool`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agent: "evaluator", tool: toolName, args })
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
  }
}

// Tool: evaluate_response - Evaluate a response for accuracy and relevance
export async function evaluateResponse({ response, context, sessionId, prompt }) {
  const schema = z.object({
    response: z.string().describe("The response to evaluate"),
    context: z.string().optional().describe("Conversation history for context"),
    sessionId: z.string().describe("The session ID for the evaluation"),
    prompt: z.string().optional().describe("Prompt guiding the evaluation")
  });

  try {
    schema.parse({ response, context, sessionId, prompt });
    return await callBackendTool("evaluate_response", { response, context, sessionId, prompt });
  } catch (error) {
    return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
  }
}

// Tool: refine_response - Refine a response for better clarity and relevance
export async function refineResponse({ response, context, sessionId, prompt }) {
  const schema = z.object({
    response: z.string().describe("The response to refine"),
    context: z.string().optional().describe("Conversation history for context"),
    sessionId: z.string().describe("The session ID for the refinement"),
    prompt: z.string().optional().describe("Prompt guiding the refinement")
  });

  try {
    schema.parse({ response, context, sessionId, prompt });
    return await callBackendTool("refine_response", { response, context, sessionId, prompt });
  } catch (error) {
    return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
  }
}
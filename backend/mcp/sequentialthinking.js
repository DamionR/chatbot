import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const server = new McpServer({ name: "SequentialThinking", version: "1.0.0" });

server.tool(
  "sequential_thinking",
  {
    thought: z.string().describe("The current thought or step in the sequence"),
    nextThoughtNeeded: z.boolean().describe("Whether another thought is required after this one"),
    thoughtNumber: z.number().describe("The current thought's position in the sequence"),
    totalThoughts: z.number().describe("The expected total number of thoughts"),
    isRevision: z.boolean().optional().describe("Whether this revises a previous thought"),
    revisesThought: z.number().optional().describe("The thought number being revised"),
    branchFromThought: z.number().optional().describe("The thought number to branch from"),
    branchId: z.string().optional().describe("Identifier for the branch, if branching"),
    needsMoreThoughts: z.boolean().optional().describe("Whether to dynamically increase totalThoughts"),
  },
  async ({
    thought,
    nextThoughtNeeded,
    thoughtNumber,
    totalThoughts,
    isRevision,
    revisesThought,
    branchFromThought,
    branchId,
    needsMoreThoughts,
  }) => {
    try {
      const response = {
        thought,
        thoughtNumber,
        totalThoughts: needsMoreThoughts ? totalThoughts + 1 : totalThoughts,
        status: nextThoughtNeeded ? "Continue" : "Complete",
      };
      if (isRevision && revisesThought !== undefined) {
        response.revision = `Revises thought #${revisesThought}`;
      }
      if (branchFromThought !== undefined) {
        response.branch = `Branched from thought #${branchFromThought}${branchId ? ` (ID: ${branchId})` : ""}`;
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
);

server.start();
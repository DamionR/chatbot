import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const server = new McpServer({ name: "Filesystem", version: "1.0.0" });

// Tool: read_file - Read the complete contents of a file
server.tool(
  "read_file",
  { path: z.string().describe("The path to the file to read") },
  async ({ path }) => {
    try {
      const response = await fetch(`${BACKEND_URL}/filesystem/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path })
      });
      const data = await response.json();
      return { content: [{ type: "text", text: data.content }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
);

// Tool: write_file - Write content to a file
server.tool(
  "write_file",
  {
    path: z.string().describe("The path to the file to write"),
    content: z.string().describe("The content to write to the file")
  },
  async ({ path, content }) => {
    try {
      const response = await fetch(`${BACKEND_URL}/filesystem/write`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, content })
      });
      const data = await response.json();
      return { content: [{ type: "text", text: data.message }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
);

// Tool: list_directory - List the contents of a directory
server.tool(
  "list_directory",
  { path: z.string().describe("The path to the directory to list") },
  async ({ path }) => {
    try {
      const response = await fetch(`${BACKEND_URL}/filesystem/list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path })
      });
      const data = await response.json();
      return { content: [{ type: "text", text: JSON.stringify(data.files) }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
);

// Tool: create_directory - Create a new directory
server.tool(
  "create_directory",
  { path: z.string().describe("The path to the directory to create") },
  async ({ path }) => {
    try {
      const response = await fetch(`${BACKEND_URL}/filesystem/create-dir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path })
      });
      const data = await response.json();
      return { content: [{ type: "text", text: data.message }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
);

// Tool: delete_file - Delete a file
server.tool(
  "delete_file",
  { path: z.string().describe("The path to the file to delete") },
  async ({ path }) => {
    try {
      const response = await fetch(`${BACKEND_URL}/filesystem/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path })
      });
      const data = await response.json();
      return { content: [{ type: "text", text: data.message }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
);

// Tool: move_file - Move or rename a file
server.tool(
  "move_file",
  {
    source: z.string().describe("The source path of the file"),
    destination: z.string().describe("The destination path")
  },
  async ({ source, destination }) => {
    try {
      const response = await fetch(`${BACKEND_URL}/filesystem/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, destination })
      });
      const data = await response.json();
      return { content: [{ type: "text", text: data.message }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
);

// Tool: search_files - Search for files matching a pattern
server.tool(
  "search_files",
  {
    path: z.string().describe("The directory path to search in"),
    pattern: z.string().describe("The pattern to match files (e.g., '*.txt')")
  },
  async ({ path, pattern }) => {
    try {
      const response = await fetch(`${BACKEND_URL}/filesystem/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, pattern })
      });
      const data = await response.json();
      return { content: [{ type: "text", text: JSON.stringify(data.files) }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
);

server.start();
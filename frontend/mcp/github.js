import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const GITHUB_TOKEN = localStorage.getItem('GITHUB_PERSONAL_ACCESS_TOKEN') || ''; // Client-side storage

const server = new McpServer({ name: "GitHub", version: "1.0.0" });

if (!GITHUB_TOKEN) {
  const tools = [
    "get_me", "get_issue", "get_issue_comments", "create_issue", "add_issue_comment",
    "list_issues", "update_issue", "search_issues", "get_pull_request", "list_pull_requests",
    "merge_pull_request", "get_pull_request_files", "get_pull_request_status",
    "update_pull_request_branch", "get_pull_request_comments", "get_pull_request_reviews",
    "create_pull_request_review", "create_pull_request", "update_pull_request",
    "create_or_update_file", "list_branches", "push_files", "search_repositories",
    "create_repository", "get_file_contents", "fork_repository", "create_branch",
    "list_commits", "get_commit", "search_code", "search_users", "get_code_scanning_alert",
    "list_code_scanning_alerts"
  ];
  tools.forEach(toolName => {
    server.tool(toolName, {}, async () => {
      return {
        content: [{ type: "text", text: "Error: GITHUB_PERSONAL_ACCESS_TOKEN not set" }],
        isError: true,
      };
    });
  });
} else {
  server.tool("get_me", {}, async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/github/me`, {
        headers: { "Authorization": `Bearer ${GITHUB_TOKEN}` }
      });
      const data = await response.json();
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  });

  server.tool(
    "get_issue",
    {
      owner: z.string(),
      repo: z.string(),
      issue_number: z.number(),
    },
    async ({ owner, repo, issue_number }) => {
      try {
        const response = await fetch(`${BACKEND_URL}/github/issue`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ owner, repo, issue_number })
        });
        const data = await response.json();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "get_issue_comments",
    {
      owner: z.string(),
      repo: z.string(),
      issue_number: z.number(),
    },
    async ({ owner, repo, issue_number }) => {
      try {
        const response = await fetch(`${BACKEND_URL}/github/issue/comments`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ owner, repo, issue_number })
        });
        const data = await response.json();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "create_issue",
    {
      owner: z.string(),
      repo: z.string(),
      title: z.string(),
      body: z.string().optional(),
      assignees: z.array(z.string()).optional(),
      labels: z.array(z.string()).optional(),
    },
    async ({ owner, repo, title, body, assignees, labels }) => {
      try {
        const response = await fetch(`${BACKEND_URL}/github/issue/create`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ owner, repo, title, body, assignees, labels })
        });
        const data = await response.json();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "add_issue_comment",
    {
      owner: z.string(),
      repo: z.string(),
      issue_number: z.number(),
      body: z.string(),
    },
    async ({ owner, repo, issue_number, body }) => {
      try {
        const response = await fetch(`${BACKEND_URL}/github/issue/comment`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ owner, repo, issue_number, body })
        });
        const data = await response.json();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "list_issues",
    {
      owner: z.string(),
      repo: z.string(),
      state: z.enum(["open", "closed", "all"]).optional().default("open"),
    },
    async ({ owner, repo, state }) => {
      try {
        const response = await fetch(`${BACKEND_URL}/github/issues`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ owner, repo, state })
        });
        const data = await response.json();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "update_issue",
    {
      owner: z.string(),
      repo: z.string(),
      issue_number: z.number(),
      title: z.string().optional(),
      body: z.string().optional(),
      state: z.enum(["open", "closed"]).optional(),
    },
    async ({ owner, repo, issue_number, title, body, state }) => {
      try {
        const response = await fetch(`${BACKEND_URL}/github/issue/update`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ owner, repo, issue_number, title, body, state })
        });
        const data = await response.json();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "search_issues",
    { query: z.string() },
    async ({ query }) => {
      try {
        const response = await fetch(`${BACKEND_URL}/github/issues/search`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ query })
        });
        const data = await response.json();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "get_pull_request",
    {
      owner: z.string(),
      repo: z.string(),
      pull_number: z.number(),
    },
    async ({ owner, repo, pull_number }) => {
      try {
        const response = await fetch(`${BACKEND_URL}/github/pull`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ owner, repo, pull_number })
        });
        const data = await response.json();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "list_pull_requests",
    {
      owner: z.string(),
      repo: z.string(),
      state: z.enum(["open", "closed", "all"]).optional().default("open"),
    },
    async ({ owner, repo, state }) => {
      try {
        const response = await fetch(`${BACKEND_URL}/github/pulls`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ owner, repo, state })
        });
        const data = await response.json();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "merge_pull_request",
    {
      owner: z.string(),
      repo: z.string(),
      pull_number: z.number(),
      commit_message: z.string().optional(),
    },
    async ({ owner, repo, pull_number, commit_message }) => {
      try {
        const response = await fetch(`${BACKEND_URL}/github/pull/merge`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ owner, repo, pull_number, commit_message })
        });
        const data = await response.json();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "get_pull_request_files",
    {
      owner: z.string(),
      repo: z.string(),
      pull_number: z.number(),
    },
    async ({ owner, repo, pull_number }) => {
      try {
        const response = await fetch(`${BACKEND_URL}/github/pull/files`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ owner, repo, pull_number })
        });
        const data = await response.json();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "get_pull_request_status",
    {
      owner: z.string(),
      repo: z.string(),
      pull_number: z.number(),
    },
    async ({ owner, repo, pull_number }) => {
      try {
        const response = await fetch(`${BACKEND_URL}/github/pull/status`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ owner, repo, pull_number })
        });
        const data = await response.json();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "update_pull_request_branch",
    {
      owner: z.string(),
      repo: z.string(),
      pull_number: z.number(),
    },
    async ({ owner, repo, pull_number }) => {
      try {
        const response = await fetch(`${BACKEND_URL}/github/pull/update-branch`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ owner, repo, pull_number })
        });
        const data = await response.json();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "get_pull_request_comments",
    {
      owner: z.string(),
      repo: z.string(),
      pull_number: z.number(),
    },
    async ({ owner, repo, pull_number }) => {
      try {
        const response = await fetch(`${BACKEND_URL}/github/pull/comments`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ owner, repo, pull_number })
        });
        const data = await response.json();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "get_pull_request_reviews",
    {
      owner: z.string(),
      repo: z.string(),
      pull_number: z.number(),
    },
    async ({ owner, repo, pull_number }) => {
      try {
        const response = await fetch(`${BACKEND_URL}/github/pull/reviews`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ owner, repo, pull_number })
        });
        const data = await response.json();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "create_pull_request_review",
    {
      owner: z.string(),
      repo: z.string(),
      pull_number: z.number(),
      body: z.string(),
      event: z.enum(["APPROVE", "REQUEST_CHANGES", "COMMENT"]),
    },
    async ({ owner, repo, pull_number, body, event }) => {
      try {
        const response = await fetch(`${BACKEND_URL}/github/pull/review`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ owner, repo, pull_number, body, event })
        });
        const data = await response.json();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "create_pull_request",
    {
      owner: z.string(),
      repo: z.string(),
      title: z.string(),
      head: z.string(),
      base: z.string(),
      body: z.string().optional(),
    },
    async ({ owner, repo, title, head, base, body }) => {
      try {
        const response = await fetch(`${BACKEND_URL}/github/pull/create`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ owner, repo, title, head, base, body })
        });
        const data = await response.json();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "update_pull_request",
    {
      owner: z.string(),
      repo: z.string(),
      pull_number: z.number(),
      title: z.string().optional(),
      body: z.string().optional(),
      state: z.enum(["open", "closed"]).optional(),
    },
    async ({ owner, repo, pull_number, title, body, state }) => {
      try {
        const response = await fetch(`${BACKEND_URL}/github/pull/update`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ owner, repo, pull_number, title, body, state })
        });
        const data = await response.json();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "create_or_update_file",
    {
      owner: z.string(),
      repo: z.string(),
      path: z.string(),
      content: z.string(),
      message: z.string(),
      branch: z.string().optional(),
    },
    async ({ owner, repo, path, content, message, branch }) => {
      try {
        const response = await fetch(`${BACKEND_URL}/github/file`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ owner, repo, path, content, message, branch })
        });
        const data = await response.json();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "list_branches",
    {
      owner: z.string(),
      repo: z.string(),
    },
    async ({ owner, repo }) => {
      try {
        const response = await fetch(`${BACKEND_URL}/github/branches`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ owner, repo })
        });
        const data = await response.json();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "push_files",
    {
      owner: z.string(),
      repo: z.string(),
      files: z.array(z.object({ path: z.string(), content: z.string() })),
      message: z.string(),
      branch: z.string().optional(),
    },
    async ({ owner, repo, files, message, branch }) => {
      try {
        const response = await fetch(`${BACKEND_URL}/github/files/push`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ owner, repo, files, message, branch })
        });
        const data = await response.json();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "search_repositories",
    { query: z.string() },
    async ({ query }) => {
      try {
        const response = await fetch(`${BACKEND_URL}/github/repos/search`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ query })
        });
        const data = await response.json();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "create_repository",
    {
      name: z.string(),
      description: z.string().optional(),
      private: z.boolean().optional().default(false),
    },
    async ({ name, description, private: isPrivate }) => {
      try {
        const response = await fetch(`${BACKEND_URL}/github/repo/create`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ name, description, private: isPrivate })
        });
        const data = await response.json();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "get_file_contents",
    {
      owner: z.string(),
      repo: z.string(),
      path: z.string(),
      ref: z.string().optional(),
    },
    async ({ owner, repo, path, ref }) => {
      try {
        const response = await fetch(`${BACKEND_URL}/github/file/content`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ owner, repo, path, ref })
        });
        const data = await response.json();
        return { content: [{ type: "text", text: data.content }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "fork_repository",
    {
      owner: z.string(),
      repo: z.string(),
    },
    async ({ owner, repo }) => {
      try {
        const response = await fetch(`${BACKEND_URL}/github/repo/fork`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ owner, repo })
        });
        const data = await response.json();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "create_branch",
    {
      owner: z.string(),
      repo: z.string(),
      branch: z.string(),
      sha: z.string(),
    },
    async ({ owner, repo, branch, sha }) => {
      try {
        const response = await fetch(`${BACKEND_URL}/github/branch/create`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ owner, repo, branch, sha })
        });
        const data = await response.json();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "list_commits",
    {
      owner: z.string(),
      repo: z.string(),
      sha: z.string().optional(),
    },
    async ({ owner, repo, sha }) => {
      try {
        const response = await fetch(`${BACKEND_URL}/github/commits`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ owner, repo, sha })
        });
        const data = await response.json();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "get_commit",
    {
      owner: z.string(),
      repo: z.string(),
      ref: z.string(),
    },
    async ({ owner, repo, ref }) => {
      try {
        const response = await fetch(`${BACKEND_URL}/github/commit`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ owner, repo, ref })
        });
        const data = await response.json();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "search_code",
    { query: z.string() },
    async ({ query }) => {
      try {
        const response = await fetch(`${BACKEND_URL}/github/code/search`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ query })
        });
        const data = await response.json();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "search_users",
    { query: z.string() },
    async ({ query }) => {
      try {
        const response = await fetch(`${BACKEND_URL}/github/users/search`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ query })
        });
        const data = await response.json();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "get_code_scanning_alert",
    {
      owner: z.string(),
      repo: z.string(),
      alert_number: z.number(),
    },
    async ({ owner, repo, alert_number }) => {
      try {
        const response = await fetch(`${BACKEND_URL}/github/code-scanning/alert`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ owner, repo, alert_number })
        });
        const data = await response.json();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "list_code_scanning_alerts",
    {
      owner: z.string(),
      repo: z.string(),
    },
    async ({ owner, repo }) => {
      try {
        const response = await fetch(`${BACKEND_URL}/github/code-scanning/alerts`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify({ owner, repo })
        });
        const data = await response.json();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
      }
    }
  );
}

server.start();
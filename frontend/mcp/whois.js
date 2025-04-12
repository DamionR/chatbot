import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const server = new McpServer({ name: "Whois", version: "1.0.0" });

server.tool(
  "whois_domain",
  { domain: z.string().describe("The domain name to look up (e.g., example.com)") },
  async ({ domain }) => {
    try {
      const response = await fetch(`${BACKEND_URL}/whois/domain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain })
      });
      const data = await response.json();
      return { content: [{ type: "text", text: JSON.stringify(data) }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
);

server.tool(
  "whois_tld",
  { tld: z.string().describe("The top-level domain to look up (e.g., .com)") },
  async ({ tld }) => {
    try {
      const response = await fetch(`${BACKEND_URL}/whois/tld`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tld })
      });
      const data = await response.json();
      return { content: [{ type: "text", text: JSON.stringify(data) }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
);

server.tool(
  "whois_ip",
  { ip: z.string().describe("The IP address to look up (e.g., 8.8.8.8)") },
  async ({ ip }) => {
    try {
      const response = await fetch(`${BACKEND_URL}/whois/ip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip })
      });
      const data = await response.json();
      return { content: [{ type: "text", text: JSON.stringify(data) }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
);

server.tool(
  "whois_as",
  { asn: z.string().describe("The ASN to look up (e.g., AS15169)") },
  async ({ asn }) => {
    try {
      const response = await fetch(`${BACKEND_URL}/whois/as`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asn })
      });
      const data = await response.json();
      return { content: [{ type: "text", text: JSON.stringify(data) }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  }
);

server.start();
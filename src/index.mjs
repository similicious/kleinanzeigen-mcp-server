import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import "dotenv/config";

// Create an MCP server
const server = new McpServer({
  name: "Kleinanzeigen",
  version: "1.0.0",
});

server.tool(
  "search",
  {
    query: z.string(),
    zipCode: z.string().optional(),
    radius: z.number().optional(),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
  },
  async ({ query, zipCode, radius, minPrice, maxPrice }) => {
    const url = new URL(`${process.env.API_BASE_URL}/inserate`);
    url.searchParams.set("query", query);

    if (zipCode) {
      url.searchParams.set("location", zipCode);
    }
    if (radius) {
      url.searchParams.set("radius", radius);
    }
    if (minPrice) {
      url.searchParams.set("min_price", minPrice);
    }
    if (maxPrice) {
      url.searchParams.set("max_price", maxPrice);
    }

    const response = await fetch(url);
    const data = await response.json();

    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  }
);

server.tool("get_listing", { id: z.string() }, async ({ id }) => {
  const url = new URL(`http://${process.env.API_BASE_URL}/${id}`);
  const response = await fetch(url);
  const data = await response.json();

  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);

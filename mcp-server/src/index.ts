import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";

const ZMD_DIR = path.join(os.homedir(), "Documents", "ZMD");
const CONFIG_PATH = path.join(ZMD_DIR, "config.json");

async function ensureVault(): Promise<void> {
  try {
    await fs.access(ZMD_DIR);
  } catch {
    await fs.mkdir(ZMD_DIR, { recursive: true });
    await fs.writeFile(CONFIG_PATH, JSON.stringify({ pinned: [] }));
  }
}

async function getConfig(): Promise<{ pinned: string[] }> {
  try {
    const raw = await fs.readFile(CONFIG_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { pinned: [] };
  }
}

async function saveConfig(config: { pinned: string[] }): Promise<void> {
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
}

function sanitizeNoteName(name: string): string {
  const sanitized = path.basename(name).replace(/[^a-zA-Z0-9_\-\s.]/g, "");
  if (!sanitized || sanitized === "." || sanitized === "..") {
    throw new Error("Invalid note name");
  }
  return sanitized;
}

function noteFilePath(name: string): string {
  const sanitized = sanitizeNoteName(name);
  const fileName = sanitized.endsWith(".md") ? sanitized : `${sanitized}.md`;
  const resolved = path.resolve(ZMD_DIR, fileName);
  if (!resolved.startsWith(ZMD_DIR)) {
    throw new Error("Path traversal detected");
  }
  return resolved;
}

const server = new McpServer({
  name: "zeromarkdown",
  version: "1.0.0",
});

server.tool(
  "list_notes",
  "List all notes in the ZeroMarkdown vault with their pinned status",
  {},
  async () => {
    await ensureVault();
    const entries = await fs.readdir(ZMD_DIR);
    const mdFiles = entries.filter(
      (f) => f.endsWith(".md") && !f.startsWith(".")
    );
    const config = await getConfig();

    const notes = mdFiles.map((file) => {
      const name = file.replace(/\.md$/, "");
      return {
        name,
        fileName: file,
        isPinned: config.pinned.includes(file),
      };
    });

    notes.sort(
      (a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)
    );

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(notes, null, 2),
        },
      ],
    };
  }
);

server.tool(
  "read_note",
  "Read the full markdown content of a specific note",
  { name: z.string().describe("The name of the note (without .md extension)") },
  async ({ name }) => {
    await ensureVault();
    const filePath = noteFilePath(name);

    try {
      const content = await fs.readFile(filePath, "utf-8");
      return {
        content: [
          {
            type: "text" as const,
            text: content,
          },
        ],
      };
    } catch {
      return {
        isError: true,
        content: [
          {
            type: "text" as const,
            text: `Note "${name}" not found.`,
          },
        ],
      };
    }
  }
);

server.tool(
  "create_note",
  "Create a new note with the given name and markdown content",
  {
    name: z.string().describe("The name for the new note (without .md extension)"),
    content: z.string().describe("The markdown content of the note"),
  },
  async ({ name, content }) => {
    await ensureVault();
    const filePath = noteFilePath(name);

    try {
      await fs.access(filePath);
      return {
        isError: true,
        content: [
          {
            type: "text" as const,
            text: `Note "${name}" already exists. Use update_note to modify it.`,
          },
        ],
      };
    } catch {
      // File doesn't exist, proceed with creation
    }

    await fs.writeFile(filePath, content, "utf-8");
    return {
      content: [
        {
          type: "text" as const,
          text: `Note "${name}" created successfully.`,
        },
      ],
    };
  }
);

server.tool(
  "update_note",
  "Update the content of an existing note",
  {
    name: z.string().describe("The name of the note to update (without .md extension)"),
    content: z.string().describe("The new markdown content for the note"),
  },
  async ({ name, content }) => {
    await ensureVault();
    const filePath = noteFilePath(name);

    try {
      await fs.access(filePath);
    } catch {
      return {
        isError: true,
        content: [
          {
            type: "text" as const,
            text: `Note "${name}" not found. Use create_note to create it first.`,
          },
        ],
      };
    }

    await fs.writeFile(filePath, content, "utf-8");
    return {
      content: [
        {
          type: "text" as const,
          text: `Note "${name}" updated successfully.`,
        },
      ],
    };
  }
);

server.tool(
  "delete_note",
  "Delete an existing note from the vault",
  { name: z.string().describe("The name of the note to delete (without .md extension)") },
  async ({ name }) => {
    await ensureVault();
    const filePath = noteFilePath(name);

    try {
      await fs.access(filePath);
    } catch {
      return {
        isError: true,
        content: [
          {
            type: "text" as const,
            text: `Note "${name}" not found.`,
          },
        ],
      };
    }

    await fs.unlink(filePath);

    const config = await getConfig();
    const fileName = `${sanitizeNoteName(name)}.md`;
    config.pinned = config.pinned.filter((p) => p !== fileName);
    await saveConfig(config);

    return {
      content: [
        {
          type: "text" as const,
          text: `Note "${name}" deleted successfully.`,
        },
      ],
    };
  }
);

server.tool(
  "pin_note",
  "Pin a note so it appears at the top of the notes list",
  { name: z.string().describe("The name of the note to pin (without .md extension)") },
  async ({ name }) => {
    await ensureVault();
    const filePath = noteFilePath(name);

    try {
      await fs.access(filePath);
    } catch {
      return {
        isError: true,
        content: [
          {
            type: "text" as const,
            text: `Note "${name}" not found.`,
          },
        ],
      };
    }

    const config = await getConfig();
    const fileName = `${sanitizeNoteName(name)}.md`;
    if (!config.pinned.includes(fileName)) {
      config.pinned.push(fileName);
      await saveConfig(config);
    }

    return {
      content: [
        {
          type: "text" as const,
          text: `Note "${name}" pinned successfully.`,
        },
      ],
    };
  }
);

server.tool(
  "unpin_note",
  "Unpin a note so it no longer appears at the top",
  { name: z.string().describe("The name of the note to unpin (without .md extension)") },
  async ({ name }) => {
    await ensureVault();
    const config = await getConfig();
    const fileName = `${sanitizeNoteName(name)}.md`;

    if (!config.pinned.includes(fileName)) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Note "${name}" is not currently pinned.`,
          },
        ],
      };
    }

    config.pinned = config.pinned.filter((p) => p !== fileName);
    await saveConfig(config);

    return {
      content: [
        {
          type: "text" as const,
          text: `Note "${name}" unpinned successfully.`,
        },
      ],
    };
  }
);

server.tool(
  "search_notes",
  "Search notes by name or content. Returns matching note names and a preview.",
  {
    query: z.string().describe("The search query (searches both note names and content)"),
  },
  async ({ query }) => {
    await ensureVault();
    const entries = await fs.readdir(ZMD_DIR);
    const mdFiles = entries.filter(
      (f) => f.endsWith(".md") && !f.startsWith(".")
    );
    const config = await getConfig();
    const lowerQuery = query.toLowerCase();

    const results: Array<{
      name: string;
      isPinned: boolean;
      matchType: string;
      preview: string;
    }> = [];

    for (const file of mdFiles) {
      const name = file.replace(/\.md$/, "");
      const nameMatch = name.toLowerCase().includes(lowerQuery);

      const filePath = path.join(ZMD_DIR, file);
      const content = await fs.readFile(filePath, "utf-8");
      const contentMatch = content.toLowerCase().includes(lowerQuery);

      if (nameMatch || contentMatch) {
        let preview = "";
        if (contentMatch) {
          const idx = content.toLowerCase().indexOf(lowerQuery);
          const start = Math.max(0, idx - 50);
          const end = Math.min(content.length, idx + query.length + 50);
          preview = content.slice(start, end).replace(/\n/g, " ");
          if (start > 0) preview = "..." + preview;
          if (end < content.length) preview = preview + "...";
        } else {
          preview = content.slice(0, 100).replace(/\n/g, " ");
          if (content.length > 100) preview += "...";
        }

        results.push({
          name,
          isPinned: config.pinned.includes(file),
          matchType: nameMatch && contentMatch ? "name+content" : nameMatch ? "name" : "content",
          preview,
        });
      }
    }

    if (results.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: `No notes found matching "${query}".`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  }
);

async function main() {
  await ensureVault();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error starting MCP server:", err);
  process.exit(1);
});

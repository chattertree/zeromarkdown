import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import type { Plugin, Connect } from "vite";

const VAULT_DIR = path.join(os.homedir(), "Documents", "ZMD");

function sendJson(
  res: Connect.ServerResponse,
  status: number,
  body: unknown,
) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function vaultFilePath(fileName: string): string {
  const resolved = path.resolve(VAULT_DIR, fileName);
  if (!resolved.startsWith(VAULT_DIR + path.sep) && resolved !== VAULT_DIR) {
    throw new Error("Invalid vault path");
  }
  return resolved;
}

async function readBody(req: Connect.IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

export function vaultDevApi(): Plugin {
  return {
    name: "vault-dev-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/vault")) {
          return next();
        }

        try {
          const url = new URL(req.url, "http://localhost");

          if (url.pathname === "/api/vault/exists" && req.method === "GET") {
            try {
              await fs.access(VAULT_DIR);
              return sendJson(res, 200, { exists: true });
            } catch {
              return sendJson(res, 200, { exists: false });
            }
          }

          if (url.pathname === "/api/vault/init" && req.method === "POST") {
            await fs.mkdir(VAULT_DIR, { recursive: true });
            const configPath = path.join(VAULT_DIR, "config.json");
            try {
              await fs.access(configPath);
            } catch {
              await fs.writeFile(
                configPath,
                JSON.stringify({ pinned: [] }),
                "utf8",
              );
            }
            return sendJson(res, 200, { ok: true });
          }

          if (url.pathname === "/api/vault/list" && req.method === "GET") {
            const entries = await fs.readdir(VAULT_DIR, { withFileTypes: true });
            const files = entries
              .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
              .map((entry) => ({
                path: path.join("ZMD", entry.name),
                name: entry.name,
              }));
            return sendJson(res, 200, { files });
          }

          if (url.pathname === "/api/vault/read" && req.method === "GET") {
            const fileName = url.searchParams.get("file");
            if (!fileName) {
              return sendJson(res, 400, { error: "Missing file parameter" });
            }
            const content = await fs.readFile(vaultFilePath(fileName), "utf8");
            return sendJson(res, 200, { content });
          }

          if (url.pathname === "/api/vault/write" && req.method === "PUT") {
            const body = JSON.parse(await readBody(req)) as {
              file?: string;
              content?: string;
            };
            if (!body.file || body.content === undefined) {
              return sendJson(res, 400, { error: "Missing file or content" });
            }
            await fs.mkdir(VAULT_DIR, { recursive: true });
            await fs.writeFile(vaultFilePath(body.file), body.content, "utf8");
            return sendJson(res, 200, { ok: true });
          }

          if (url.pathname === "/api/vault/delete" && req.method === "DELETE") {
            const fileName = url.searchParams.get("file");
            if (!fileName) {
              return sendJson(res, 400, { error: "Missing file parameter" });
            }
            await fs.unlink(vaultFilePath(fileName));
            return sendJson(res, 200, { ok: true });
          }

          if (
            url.pathname === "/api/vault/file-exists" &&
            req.method === "GET"
          ) {
            const fileName = url.searchParams.get("file");
            if (!fileName) {
              return sendJson(res, 400, { error: "Missing file parameter" });
            }
            try {
              await fs.access(vaultFilePath(fileName));
              return sendJson(res, 200, { exists: true });
            } catch {
              return sendJson(res, 200, { exists: false });
            }
          }

          return sendJson(res, 404, { error: "Not found" });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Vault API error";
          return sendJson(res, 500, { error: message });
        }
      });
    },
  };
}

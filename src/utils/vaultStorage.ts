import {
  BaseDirectory,
  createDir,
  exists,
  readDir,
  readTextFile,
  removeDir,
  removeFile,
  writeTextFile,
  writeBinaryFile,
} from "@tauri-apps/api/fs";
import { documentDir } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { isTauri } from "./isTauri";

const VAULT_DIR = "ZMD";

export type VaultFileEntry = {
  path: string;
  name: string;
  folder?: string;
};

async function vaultFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(path, init);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Vault API failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function vaultExists(): Promise<boolean> {
  if (isTauri()) {
    return exists(VAULT_DIR, { dir: BaseDirectory.Document });
  }

  const data = await vaultFetch<{ exists: boolean }>("/api/vault/exists");
  return data.exists;
}

export async function initVault(): Promise<void> {
  if (isTauri()) {
    await createDir(VAULT_DIR, { dir: BaseDirectory.Document });
    await writeTextFile(
      `${VAULT_DIR}/config.json`,
      JSON.stringify({ pinned: [], folders: [] }),
      { dir: BaseDirectory.Document },
    );
    return;
  }

  await vaultFetch("/api/vault/init", { method: "POST" });
}

export async function readVaultFile(fileName: string): Promise<string> {
  if (isTauri()) {
    return readTextFile(`${VAULT_DIR}/${fileName}`, { dir: BaseDirectory.Document });
  }

  const data = await vaultFetch<{ content: string }>(
    `/api/vault/read?file=${encodeURIComponent(fileName)}`,
  );
  return data.content;
}

export async function writeVaultFile(
  fileName: string,
  content: string,
): Promise<void> {
  if (isTauri()) {
    await writeTextFile(`${VAULT_DIR}/${fileName}`, content, {
      dir: BaseDirectory.Document,
    });
    return;
  }

  await vaultFetch("/api/vault/write", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file: fileName, content }),
  });
}

export async function removeVaultFile(fileName: string): Promise<void> {
  if (isTauri()) {
    await removeFile(`${VAULT_DIR}/${fileName}`, { dir: BaseDirectory.Document });
    return;
  }

  await vaultFetch(`/api/vault/delete?file=${encodeURIComponent(fileName)}`, {
    method: "DELETE",
  });
}

const SKIP_DIRS = ["assets"];

export async function listVaultMdFiles(): Promise<VaultFileEntry[]> {
  if (isTauri()) {
    const directory = await readDir(VAULT_DIR, {
      dir: BaseDirectory.Document,
      recursive: true,
    });
    const results: VaultFileEntry[] = [];

    for (const entry of directory) {
      if (entry.name?.endsWith(".md")) {
        results.push({ path: entry.path, name: entry.name });
      } else if (entry.children && !SKIP_DIRS.includes(entry.name ?? "")) {
        const folderName = entry.name!;
        for (const sub of entry.children) {
          if (sub.name?.endsWith(".md")) {
            results.push({ path: sub.path, name: sub.name, folder: folderName });
          }
        }
      }
    }

    return results;
  }

  const data = await vaultFetch<{ files: VaultFileEntry[] }>("/api/vault/list");
  return data.files;
}

export async function listVaultFolders(): Promise<string[]> {
  if (isTauri()) {
    const directory = await readDir(VAULT_DIR, {
      dir: BaseDirectory.Document,
      recursive: true,
    });
    const discoveredFolders: string[] = [];
    for (const entry of directory) {
      if (entry.children && !SKIP_DIRS.includes(entry.name ?? "")) {
        discoveredFolders.push(entry.name!);
      }
    }

    const configRaw = await readTextFile(`${VAULT_DIR}/config.json`, { dir: BaseDirectory.Document });
    const config = JSON.parse(configRaw);
    const configFolders: string[] = config.folders ?? [];

    const allFolders = Array.from(new Set([...configFolders, ...discoveredFolders]));
    return allFolders;
  }
  return [];
}

export async function createFolder(name: string): Promise<void> {
  if (isTauri()) {
    await createDir(`${VAULT_DIR}/${name}`, { dir: BaseDirectory.Document, recursive: true });
    const configRaw = await readTextFile(`${VAULT_DIR}/config.json`, { dir: BaseDirectory.Document });
    const config = JSON.parse(configRaw);
    if (!config.folders) config.folders = [];
    if (!config.folders.includes(name)) {
      config.folders.push(name);
      await writeTextFile(`${VAULT_DIR}/config.json`, JSON.stringify(config), { dir: BaseDirectory.Document });
    }
  }
}

export async function deleteFolder(name: string): Promise<void> {
  if (isTauri()) {
    const subDir = await readDir(`${VAULT_DIR}/${name}`, { dir: BaseDirectory.Document });
    if (subDir.length > 0) {
      throw new Error("Folder is not empty");
    }
    await removeDir(`${VAULT_DIR}/${name}`, { dir: BaseDirectory.Document });
    const configRaw = await readTextFile(`${VAULT_DIR}/config.json`, { dir: BaseDirectory.Document });
    const config = JSON.parse(configRaw);
    config.folders = (config.folders ?? []).filter((f: string) => f !== name);
    await writeTextFile(`${VAULT_DIR}/config.json`, JSON.stringify(config), { dir: BaseDirectory.Document });
  }
}

export async function moveNoteToFolder(noteName: string, targetFolder: string): Promise<void> {
  if (isTauri()) {
    const content = await readTextFile(`${VAULT_DIR}/${noteName}.md`, { dir: BaseDirectory.Document });
    const baseName = noteName.includes("/") ? noteName.split("/").pop()! : noteName;
    await writeTextFile(`${VAULT_DIR}/${targetFolder}/${baseName}.md`, content, { dir: BaseDirectory.Document });
    await removeFile(`${VAULT_DIR}/${noteName}.md`, { dir: BaseDirectory.Document });
  }
}

export async function moveNoteToRoot(noteName: string): Promise<void> {
  if (isTauri()) {
    const content = await readTextFile(`${VAULT_DIR}/${noteName}.md`, { dir: BaseDirectory.Document });
    const baseName = noteName.includes("/") ? noteName.split("/").pop()! : noteName;
    await writeTextFile(`${VAULT_DIR}/${baseName}.md`, content, { dir: BaseDirectory.Document });
    await removeFile(`${VAULT_DIR}/${noteName}.md`, { dir: BaseDirectory.Document });
  }
}

export async function vaultFileExists(fileName: string): Promise<boolean> {
  if (isTauri()) {
    return exists(`${VAULT_DIR}/${fileName}`, { dir: BaseDirectory.Document });
  }

  const data = await vaultFetch<{ exists: boolean }>(
    `/api/vault/file-exists?file=${encodeURIComponent(fileName)}`,
  );
  return data.exists;
}

export async function saveImageToVault(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "png";
  const uniqueName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const assetsPath = `${VAULT_DIR}/assets`;

  if (isTauri()) {
    const assetsExist = await exists(assetsPath, { dir: BaseDirectory.Document });
    if (!assetsExist) {
      await createDir(assetsPath, { dir: BaseDirectory.Document, recursive: true });
    }

    const buffer = await file.arrayBuffer();
    await writeBinaryFile(`${assetsPath}/${uniqueName}`, new Uint8Array(buffer), {
      dir: BaseDirectory.Document,
    });

    const docPath = await documentDir();
    const fullPath = `${docPath}${VAULT_DIR}/assets/${uniqueName}`;
    return convertFileSrc(fullPath);
  }

  const buffer = await file.arrayBuffer();
  const base64 = btoa(
    new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ""),
  );
  return `data:${file.type};base64,${base64}`;
}

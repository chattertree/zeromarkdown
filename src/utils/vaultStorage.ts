import {
  BaseDirectory,
  createDir,
  exists,
  readDir,
  readTextFile,
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
    await writeTextFile(`${VAULT_DIR}/config.json`, JSON.stringify({ pinned: [] }), {
      dir: BaseDirectory.Document,
    });
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

export async function listVaultMdFiles(): Promise<VaultFileEntry[]> {
  if (isTauri()) {
    const directory = await readDir(VAULT_DIR, { dir: BaseDirectory.Document });
    return directory
      .filter((entry) => entry.name?.endsWith(".md"))
      .map((entry) => ({
        path: entry.path,
        name: entry.name!,
      }));
  }

  const data = await vaultFetch<{ files: VaultFileEntry[] }>("/api/vault/list");
  return data.files;
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

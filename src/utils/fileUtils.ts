import { open, message } from "@tauri-apps/api/dialog";
import React from "react";
import { isTauri } from "./isTauri";
import {
  listVaultMdFiles,
  readVaultFile,
  writeVaultFile,
} from "./vaultStorage";

interface FileProps {
  fileName: string;
  content: string;
  changeFileName: Function;
  setContent: React.Dispatch<React.SetStateAction<string>>;
}

export const handleSave = async ({ fileName, content }: FileProps) => {
  await writeVaultFile(`${fileName}.md`, content);
};

export const listNotes = async () => {
  const directory = await listVaultMdFiles();
  const pinData = JSON.parse(await readVaultFile("config.json"));
  const noteData = directory.map((note) => ({
    path: note.path,
    name: note.name,
    meta: {
      isPinned: pinData.pinned.includes(note.name),
    },
  }));
  noteData.sort((a, b) => {
    return (b.meta.isPinned === true ? 1 : 0) - (a.meta.isPinned === true ? 1 : 0);
  });
  return noteData;
};

export const handleOpen = async ({ changeFileName, setContent }: FileProps) => {
  if (!isTauri()) {
    console.warn("Open file dialog is only available in the desktop app.");
    return;
  }

  const selected = await open({
    filters: [
      {
        name: "MarkDown",
        extensions: ["md", "mdx"],
      },
    ],
  });
  try {
    if (typeof selected == "string") {
      const { readTextFile } = await import("@tauri-apps/api/fs");
      const contents = await readTextFile(selected);
      setContent(contents);
      changeFileName(selected);
      await message("File has been successfully opened", "ZeroMarkDown");
    }
  } catch (err) {
    await message("Could not open file", {
      title: "ZeroMarkDown",
      type: "error",
    });
  }
};

export const handleNew = async (
  setContent: React.Dispatch<React.SetStateAction<string>>,
  changeFileName: Function,
) => {
  setContent("");
  changeFileName("Untitled");
};

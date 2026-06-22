import { open, message } from "@tauri-apps/api/dialog";
import React from "react";
import { isTauri } from "./isTauri";
import {
  listVaultMdFiles,
  listVaultFolders,
  readVaultFile,
  writeVaultFile,
} from "./vaultStorage";

interface FileProps {
  fileName: string;
  content: string;
  changeFileName: Function;
  setContent: React.Dispatch<React.SetStateAction<string>>;
}

export type NoteObj = {
  path: string;
  name: string;
  relativePath: string;
  meta: {
    isPinned: boolean;
  };
};

export type FolderObj = {
  name: string;
  notes: NoteObj[];
};

export type NotesTree = {
  rootNotes: NoteObj[];
  folders: FolderObj[];
};

export const handleSave = async ({ fileName, content }: FileProps) => {
  await writeVaultFile(`${fileName}.md`, content);
};

export const listNotes = async (): Promise<NotesTree> => {
  const directory = await listVaultMdFiles();
  const pinData = JSON.parse(await readVaultFile("config.json"));
  const folders = await listVaultFolders();

  const rootNotes: NoteObj[] = [];
  const folderMap = new Map<string, NoteObj[]>();

  for (const folder of folders) {
    folderMap.set(folder, []);
  }

  for (const note of directory) {
    const relativePath = note.folder ? `${note.folder}/${note.name}` : note.name;
    const noteObj: NoteObj = {
      path: note.path,
      name: note.name,
      relativePath,
      meta: {
        isPinned: pinData.pinned.includes(relativePath),
      },
    };

    if (note.folder) {
      if (!folderMap.has(note.folder)) {
        folderMap.set(note.folder, []);
      }
      folderMap.get(note.folder)!.push(noteObj);
    } else {
      rootNotes.push(noteObj);
    }
  }

  rootNotes.sort((a, b) => {
    return (b.meta.isPinned ? 1 : 0) - (a.meta.isPinned ? 1 : 0);
  });

  const folderObjs: FolderObj[] = Array.from(folderMap.entries()).map(([name, notes]) => ({
    name,
    notes: notes.sort((a, b) => (b.meta.isPinned ? 1 : 0) - (a.meta.isPinned ? 1 : 0)),
  }));

  return { rootNotes, folders: folderObjs };
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

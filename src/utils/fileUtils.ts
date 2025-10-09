import {
  writeTextFile,
  readTextFile,
  BaseDirectory,
  readDir,
} from "@tauri-apps/api/fs";
import { open, message } from "@tauri-apps/api/dialog";
import React from "react";

interface FileProps {
  fileName: string;
  content: string;
  changeFileName: Function;
  setContent: React.Dispatch<React.SetStateAction<string>>;
}

export const handleSave = async ({ fileName, content }: FileProps) => {
  await writeTextFile(`ZMD/${fileName}.md`, content, {
    dir: BaseDirectory.Document,
  });
};

export const listNotes = async () => {
  let directory = await readDir("ZMD", {
    dir: BaseDirectory.Document,
    recursive: true,
  });
  directory = directory.filter((note) => note.name?.includes(".md"));
  const pinData = await JSON.parse(await readTextFile('ZMD/config.json', {dir: BaseDirectory.Document}));
  const noteData = directory.map(note => ({path: note.path, name: note.name, meta: {
    isPinned: pinData.pinned.includes(note.name)
  }}))
  noteData.sort((a, b) => {
    return (b.meta.isPinned === true ? 1 : 0) - (a.meta.isPinned === true ? 1 : 0);
  });
  return noteData;
};

export const handleOpen = async ({ changeFileName, setContent }: FileProps) => {
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

import { writeTextFile, readTextFile, exists } from "@tauri-apps/api/fs";
import { save, open, message } from "@tauri-apps/api/dialog";
import React from "react";

interface FileProps {
  fileName: string;
  content: string;
  changeFileName: Function;
  setContent: React.Dispatch<React.SetStateAction<string>>;
}

export const handleSave = async ({
  fileName,
  content,
  changeFileName,
}: FileProps) => {
  const fileStatus = await exists(fileName);
  if (fileStatus) {
    await writeTextFile(fileName, content);
  } else {
    const onlyname = fileName.split(".")[0];

    const filePath = await save({
      defaultPath: onlyname,
      title: "Save Note",
      filters: [
        {
          name: "MarkDown",
          extensions: ["md", "mdx"],
        },
      ],
    });
    try {
      if (filePath !== null) {
        await writeTextFile(filePath, content);
        await message("File has been saved", "ZeroMarkDown");
        changeFileName(filePath);
      }
    } catch (err) {
      await message("File could not be saved", {
        title: "ZeroMarkDown",
        type: "error",
      });
      console.log("This error: ", err);
    }
  }
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

export const handleNew = async ({ setContent, changeFileName }: FileProps) => {
  setContent("// Type something new");
  changeFileName("Foo.md");
};

import { useContext, useEffect } from "react";
import { FaFolderOpen, FaPlus, FaSave } from "react-icons/fa";
import { EditorContext } from "./provider/EditorProvider";
import { writeTextFile, BaseDirectory, readTextFile } from "@tauri-apps/api/fs";
import { save, open, message } from "@tauri-apps/api/dialog";
import { getMatches } from "@tauri-apps/api/cli";

const Controls = ({ fileName, changeFileName }) => {
  const [content, setContent] = useContext(EditorContext);

  useEffect(() => {
    match();
  }, []);

  const match = async () => {
    const matches = await getMatches();
    if (matches.args.source.value != "") {
      changeFileName(matches.args.source.value);
    }
  };

  const handleSave = async () => {
    const filePath = await save({
      defaultPath: fileName,
      title: "Save Note",
      filters: [
        {
          name: "MarkDown",
          extensions: ["md", "mdx"],
        },
      ],
    });
    try {
      await writeTextFile(filePath, content);
      await message("File has been saved", "ZeroMarkDown");
      changeFileName(filePath);
    } catch (err) {
      await message("File could not be saved", {
        title: "ZeroMarkDown",
        type: "error",
      });
    }
  };

  const handleOpen = async () => {
    const selected = await open({
      filters: [
        {
          name: "MarkDown",
          extensions: ["md", "mdx"],
        },
      ],
    });
    try {
      const contents = await readTextFile(selected);
      setContent(contents);
      changeFileName(selected);
      await message("File has been successfully opened", "ZeroMarkDown");
    } catch (err) {
      await message("Could not open file", {
        title: "ZeroMarkDown",
        type: "error",
      });
    }
  };
  const handleNew = async () => {
    setContent("// Type something new");
    changeFileName("Foo.md");
  };

  return (
    <div className="controlsMenu">
      <button className="openFile" onClick={() => handleOpen()}>
        <FaFolderOpen />
      </button>
      <button className="newFile" onClick={() => handleNew()}>
        <FaPlus />
      </button>
      <button className="saveFile" onClick={() => handleSave()}>
        <FaSave />
      </button>
    </div>
  );
};

export default Controls;

import { useEffect } from "react";
import {
  createDir,
  BaseDirectory,
  exists,
  readTextFile,
  removeFile,
} from "@tauri-apps/api/fs";
import { useEditor } from "./provider/EditorProvider";
import { useNotes } from "./provider/NotesProvider";
import { FaRegStickyNote, FaRegEdit, FaRegTrashAlt } from "react-icons/fa";
import { listNotes } from "./utils/fileUtils";

type NotesProps = {
  fileName: string;
  changeFileName: (newName: string | undefined) => void;
};

const NotesMenu = ({ fileName, changeFileName }: NotesProps) => {
  const { notes, setNotes } = useNotes();
  const { content, setContent } = useEditor();

  useEffect(() => {
    loadVault();
  }, [content]);

  let loadVault = async () => {
    const vault = await exists("ZMD", { dir: BaseDirectory.Document });
    if (!vault) {
      await createDir("ZMD", { dir: BaseDirectory.Document });
      setNotes([]);
    } else {
      const vaultFiles = await listNotes();
      setNotes([...vaultFiles]);
    }
  };

  const handleEdit = async (note: string) => {
    const directory = await listNotes();
    const filePath = directory.find((file) => file.name == `${note}.md`);
    if (filePath != undefined) {
      const fileContents = await readTextFile(filePath.path);
      changeFileName(note);
      setContent(fileContents);
    }
  };

  const handleDelete = async (note: string) => {
    await removeFile(`ZMD/${note}.md`, { dir: BaseDirectory.Document });
    const directory = await listNotes();
    if (fileName == note) {
      changeFileName("Untitled");
      setContent("");
    }
    setNotes([...directory]);
  };

  const handleSearch = async (e: any) => {
    const directory = await listNotes();
    const results = directory.filter((file) =>
      file.name?.includes(e.target.value),
    );
    setNotes(results);
  };

  return (
    <div className="side_menu">
      <div className="side_menu_container">
        <div className="search_bar">
          <input
            type="search"
            placeholder="Search for your notes"
            onInput={handleSearch}
          />
        </div>
        <div className="separator"></div>
        <p id="notes_title">------Your Notes------</p>
        <div className="notes_list">
          {notes.map((note: any, key: any) => {
            let noteName = note.name.split(".")[0];
            return (
              <aside className="note" key={key}>
                <div className="note_data">
                  <FaRegStickyNote />
                  <p>{noteName}</p>
                </div>
                <div className="note_controls">
                  <FaRegEdit onClick={() => handleEdit(noteName)} />
                  <FaRegTrashAlt onClick={() => handleDelete(noteName)} />
                </div>
              </aside>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NotesMenu;

import { useEffect } from "react";
import {
  createDir,
  BaseDirectory,
  exists,
  readTextFile,
  removeFile,
  writeTextFile
} from "@tauri-apps/api/fs";
import { useEditor } from "./provider/EditorProvider";
import { useNotes } from "./provider/NotesProvider";
import {
  FaRegStickyNote,
  FaRegTrashAlt,
  FaRegPlusSquare,
} from "react-icons/fa";
import { BsPinAngle, BsPinAngleFill } from "react-icons/bs";
import { handleNew, listNotes } from "./utils/fileUtils";

type NotesProps = {
  fileName: string;
  changeFileName: (newName: string | undefined) => void;
};

type NoteObj = {
  path: string;
  name: string;
  meta: {
    isPinned: boolean
  };
}

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
      const contents = JSON.stringify({ pinned: [] });
      await writeTextFile('ZMD/config.json', contents, { dir: BaseDirectory.Document });
      setNotes([]);
    } else {
      const vaultFiles = await listNotes();
      setNotes([...vaultFiles]);
    }
  };

  const handleEdit = async (noteName: string) => {
    const directory = await listNotes();
    const filePath = directory.find((file) => file.name == `${noteName}.md`);
    if (filePath != undefined) {
      const fileContents = await readTextFile(filePath.path);
      changeFileName(noteName);
      setContent(fileContents);
    }
  };

  const handleDelete = async (noteName: string) => {
    await removeFile(`ZMD/${noteName}.md`, { dir: BaseDirectory.Document });
    const directory = await listNotes();
    if (fileName == noteName) {
      changeFileName("Untitled");
      setContent("");
    }
    setNotes([...directory]);
  };

  const handleSearch = async (e: any) => {
    const directory = await listNotes();
    const results = directory.filter((file) =>
      file.name?.toLowerCase()?.includes(e.target.value),
    );
    setNotes(results);
  };

  const pinNotes = async(action: string, note: NoteObj) => {
    const pinData = await readTextFile('ZMD/config.json', { dir: BaseDirectory.Document });
    const data = await JSON.parse(pinData);
    if(action === 'pin' && !data.pinned.includes(note.name)){
      data.pinned.push(note.name);
    }else{
      data.pinned = data.pinned.filter((n: string) => n !== note.name)
    }
    await writeTextFile('ZMD/config.json', JSON.stringify(data), { dir: BaseDirectory.Document })
    loadVault();
  }

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
        <div
          className="note"
          onClick={() => handleNew(setContent, changeFileName)}
        >
          <div className="note_data">
            <FaRegPlusSquare />
            <p>Create a New Note</p>
          </div>
        </div>
        <p id="notes_title">------Your Notes------</p>
        <div className="notes_list">
          {notes.map((note: NoteObj, key: string) => {
            let noteName = note.name.split(".md")[0];
            return (
              <aside
                className="note"
                key={key}
              >
                <div className="note_data" onClick={() => handleEdit(noteName)}>
                  <FaRegStickyNote />
                  <p>{noteName}</p>
                </div>
                <div className="note_controls">
                  {note.meta.isPinned ? <BsPinAngleFill color="yellow" onClick={() => {pinNotes('unpin', note)}} /> : <BsPinAngle onClick={() => {pinNotes('pin', note)}} />}
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

import "./App.css";
import Editor from "./Editor";
import { useEditor } from "./provider/EditorProvider";
import { useState } from "react";
import { handleKey } from "./utils/keyBinding";
import NotesMenu from "./NotesMenu";

function App() {
  const [fileName, setFileName] = useState<string>("Untitled");
  const { content, setContent } = useEditor();

  const changeFileName = (newName: string | undefined) => {
    if (newName != undefined) {
      setFileName(newName);
    }
  };

  return (
    <NotesMenu fileName={fileName} changeFileName={changeFileName}>
      <div
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
        onKeyDown={(e) =>
          handleKey(e, content, fileName, changeFileName, setContent)
        }
      >
        <Editor fileName={fileName} changeFileName={changeFileName} />
      </div>
    </NotesMenu>
  );
}

export default App;

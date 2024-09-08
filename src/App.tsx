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
    <>
      <div
        style={{
          display: "flex",
          height: "100vh",
          width: "100%",
        }}
        onKeyDown={(e) =>
          handleKey(e, content, fileName, changeFileName, setContent)
        }
      >
        <NotesMenu fileName={fileName} changeFileName={changeFileName} />
        <Editor fileName={fileName} changeFileName={changeFileName} />
      </div>
    </>
  );
}

export default App;

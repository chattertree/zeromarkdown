import "./App.css";
import Renderer from "./Renderer";
import Editor from "./Editor";
import { useEditor } from "./provider/EditorProvider";
import Controls from "./Controls";
import { useState } from "react";
import { handleKey } from "./utils/keyBinding";

function App() {
  const [fileName, setFileName] = useState<string>("Untitled.md");
  const { content, setContent } = useEditor();

  const changeFileName = (newName: string | undefined) => {
    if (newName != undefined) {
      setFileName(newName);
    }
  };

  return (
    <>
      <h1 id="zmd" style={{ textAlign: "center" }}>
        Zero Mark Down Editor
      </h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          margin: "0 2rem 0 2rem",
        }}
        onKeyDown={(e) =>
          handleKey(e, content, fileName, changeFileName, setContent)
        }
      >
        <Editor fileName={fileName} />
        <Renderer />
        <Controls fileName={fileName} changeFileName={changeFileName} />
      </div>
    </>
  );
}

export default App;

import "./App.css";
import "./katex.min.css";

import Renderer from "./Renderer";
import Editor from "./Editor";
import EditorProvider, { EditorContext } from "./provider/EditorProvider";
import Controls from "./Controls";
import { useContext, useState } from "react";

function App() {
  const [fileName, setFileName] = useState("Foo.md");

  const changeFileName = (newName) => {
    setFileName(newName);
  };

  return (
    <EditorProvider>
      <>
        <h1 style={{ textAlign: "center" }}>ZeroMarkDown Editor</h1>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            margin: "0 2rem 0 2rem",
          }}
        >
          <Editor fileName={fileName} />
          <Renderer />
          <Controls fileName={fileName} changeFileName={changeFileName} />
        </div>
      </>
    </EditorProvider>
  );
}

export default App;

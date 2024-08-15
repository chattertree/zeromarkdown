import { Editor as MarkdownEditor, useMonaco } from "@monaco-editor/react";
import { useContext, useEffect } from "react";
import { EditorContext } from "./provider/EditorProvider";
import data from "monaco-themes/themes/Oceanic Next.json";

const Editor = ({ fileName }) => {
  const [content, setContent] = useContext(EditorContext);

  const monaco = useMonaco();

  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme("oceanic-next", data);
      monaco.editor.setTheme("oceanic-next");
    }
  }, [monaco]);

  return (
    <div className="textarea">
      <p>
        You're editing {">>"} {fileName}
      </p>
      <MarkdownEditor
        height="85vh"
        width={`100%`}
        spellCheck="false"
        language={"markdown"}
        value={content}
        theme={"vs-dark"}
        defaultValue="// some comment"
        onChange={(e) => (e ? setContent(e) : null)}
      />
    </div>
  );
};

export default Editor;

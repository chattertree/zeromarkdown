import { Editor as MarkdownEditor, Monaco } from "@monaco-editor/react";
import { useEditor } from "./provider/EditorProvider";
import { markdownProvider } from "./provider/MarkdownProvider";
import { type editor } from "monaco-editor";

const Editor = ({ fileName }: { fileName: string }) => {
  const { content, setContent } = useEditor();

  const handleChange = (newValue: string | undefined) => {
    if (newValue != undefined) {
      setContent(newValue);
    }
  };

  const handleBeforeMount = (monaco: Monaco) => {
    monaco.languages.registerCompletionItemProvider("markdown", {
      provideCompletionItems: function (model, position) {
        return markdownProvider({ model, position, monaco });
      },
    });
  };

  const handleMount = (editor: editor.IStandaloneCodeEditor) => {
    editor.focus();
  };

  return (
    <div className="textarea">
      <p id="fileName">
        You're editing {"--->"} {fileName}
      </p>
      <MarkdownEditor
        height="85vh"
        width={`100%`}
        language={"markdown"}
        value={content}
        theme={"vs-dark"}
        onMount={handleMount}
        beforeMount={handleBeforeMount}
        onChange={handleChange}
      />
    </div>
  );
};

export default Editor;

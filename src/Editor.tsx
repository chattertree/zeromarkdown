import { Editor as MarkdownEditor, Monaco } from "@monaco-editor/react";
import { useEditor } from "./provider/EditorProvider";
import { markdownProvider } from "./provider/MarkdownProvider";

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
        beforeMount={handleBeforeMount}
        defaultValue="// some comment"
        onChange={handleChange}
      />
    </div>
  );
};

export default Editor;

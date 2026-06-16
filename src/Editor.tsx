import { useEditor } from "./provider/EditorProvider";
import { useEffect, useRef, useState } from "react";
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  linkPlugin,
  linkDialogPlugin,
  tablePlugin,
  markdownShortcutPlugin,
  codeBlockPlugin,
  imagePlugin,
  codeMirrorPlugin,
  directivesPlugin,
  toolbarPlugin,
  AdmonitionDirectiveDescriptor,
  MDXEditorMethods,
  UndoRedo,
  BoldItalicUnderlineToggles,
  CreateLink,
  InsertAdmonition,
  InsertTable,
  InsertImage,
  Separator,
  BlockTypeSelect,
  CodeToggle,
  InsertThematicBreak,
  diffSourcePlugin,
  DiffSourceToggleWrapper,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { handleSave, listNotes } from "./utils/fileUtils";
import { MermaidCodeEditorDescriptor } from "./components/Mermaid";
import { oneDark } from "@codemirror/theme-one-dark";
import { removeVaultFile, vaultFileExists } from "./utils/vaultStorage";
import { useNotes } from "./provider/NotesProvider";
import {
  YouTubeButton,
  YoutubeDirectiveDescriptor,
} from "./components/Youtube";
import "./editor.css";

const Editor = ({
  fileName,
  changeFileName,
}: {
  fileName: string;
  changeFileName: Function;
}) => {
  const { content, setContent } = useEditor();
  const editorRef = useRef<MDXEditorMethods>(null);
  const { setNotes } = useNotes();
  const [draftTitle, setDraftTitle] = useState(fileName);

  useEffect(() => {
    setDraftTitle(fileName);
  }, [fileName]);

  useEffect(() => {
    if (editorRef.current != null) {
      editorRef.current.setMarkdown(content);
    }
  }, [fileName, content]);

  const handleChange = (markdown: string) => {
    setContent(markdown);

    handleSave({
      fileName,
      content: markdown,
      changeFileName,
      setContent,
    });
  };

  const handleError = (payload: object) => {
    console.log(payload);
  };

  const commitTitleChange = async () => {
    const newName = draftTitle.trim() || "Untitled";
    setDraftTitle(newName);

    if (newName === fileName) {
      return;
    }

    const oldFileExists = await vaultFileExists(`${fileName}.md`);
    if (oldFileExists) {
      await removeVaultFile(`${fileName}.md`);
    }
    await handleSave({
      fileName: newName,
      content,
      changeFileName,
      setContent,
    });
    changeFileName(newName);
    const directory = await listNotes();
    setNotes(directory);
  };

  return (
    <div className="textarea">
      <input
        id="zmd"
        value={draftTitle}
        type="text"
        onChange={(e) => setDraftTitle(e.target.value)}
        onBlur={commitTitleChange}
      />
      <MDXEditor
        autoFocus
        ref={editorRef}
        className="dark-theme dark-editor"
        markdown=""
        placeholder="What's on your mind?"
        plugins={[
          toolbarPlugin({
            toolbarContents: () => (
              <DiffSourceToggleWrapper>
                <UndoRedo />
                <BoldItalicUnderlineToggles />
                <BlockTypeSelect />
                <CodeToggle />
                <InsertTable />
                <CreateLink />
                <InsertImage />
                <InsertThematicBreak />
                <Separator />
                <InsertAdmonition />
                <YouTubeButton />
              </DiffSourceToggleWrapper>
            ),
          }),
          listsPlugin(),
          quotePlugin(),
          headingsPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          imagePlugin(),
          tablePlugin(),
          thematicBreakPlugin(),
          diffSourcePlugin({ diffMarkdown: 'An older version', viewMode: 'rich-text', readOnlyDiff: true }),
          codeBlockPlugin({
            codeBlockEditorDescriptors: [MermaidCodeEditorDescriptor],
            defaultCodeBlockLanguage: "js",
          }),
          codeMirrorPlugin({
            codeBlockLanguages: {
              js: "JavaScript",
              css: "CSS",
              txt: "text",
              tsx: "TypeScript",
              bash: "Bash",
            },
            codeMirrorExtensions: [oneDark],
          }),
          directivesPlugin({
            directiveDescriptors: [
              AdmonitionDirectiveDescriptor,
              YoutubeDirectiveDescriptor,
            ],
          }),
          markdownShortcutPlugin(),
        ]}
        onChange={handleChange}
        onError={handleError}
      />
    </div>
  );
};

export default Editor;

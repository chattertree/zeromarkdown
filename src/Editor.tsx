import { useEditor } from "./provider/EditorProvider";
import React, { useEffect, useRef } from "react";
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
  frontmatterPlugin,
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
  InsertFrontmatter,
  InsertSandpack,
  InsertThematicBreak,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { handleSave, listNotes } from "./utils/fileUtils";
import { MermaidCodeEditorDescriptor } from "./components/Mermaid";
import { oneDark } from "@codemirror/theme-one-dark";
import { BaseDirectory, removeFile, exists } from "@tauri-apps/api/fs";
import { useNotes } from "./provider/NotesProvider";
import {
  YouTubeButton,
  YoutubeDirectiveDescriptor,
} from "./components/Youtube";
import "./editor.css";
import { imageAsDirectivePlugin } from "./components/Image";
import { markdownLinkShortcutPlugin } from "./plugins/LinkPlugin";

const Editor = ({
  fileName,
  changeFileName,
}: {
  fileName: string;
  changeFileName: Function;
}) => {
  const { content, setContent } = useEditor();
  const editorRef = useRef<MDXEditorMethods>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setNotes } = useNotes();

  useEffect(() => {
    if (editorRef.current != null) {
      editorRef.current.setMarkdown(content);
    }
  }, [fileName, content]);

  const handleChange = (markdown: string) => {
    setContent(markdown);

    handleSave({
      fileName: inputRef.current?.value!,
      content: markdown,
      changeFileName,
      setContent,
    });
  };

  const handleError = (payload: object) => {
    console.log(payload);
  };

  const handleInputChange = (e: React.BaseSyntheticEvent) => {
    removeCurrentFile();
    changeFileName(e.target.value);
  };

  const removeCurrentFile = async () => {
    const oldFileExists = await exists(`ZMD/${fileName}.md`, {
      dir: BaseDirectory.Document,
    });
    if (oldFileExists) {
      await removeFile(`ZMD/${fileName}.md`, { dir: BaseDirectory.Document });
    }
    await handleSave({
      fileName: inputRef.current?.value!,
      content,
      changeFileName,
      setContent,
    });
    const directory = await listNotes();
    setNotes(directory);
  };

  const MARKDOWN_OPTIONS = {
    resourceLink: true,
    rule: "*",
  };

  return (
    <div className="textarea">
      <input
        id="zmd"
        ref={inputRef}
        value={fileName}
        type="text"
        onInput={handleInputChange}
      />
      <MDXEditor
        autoFocus
        ref={editorRef}
        className="dark-theme dark-editor"
        markdown=""
        toMarkdownOptions={MARKDOWN_OPTIONS}
        placeholder="What's on your mind?"
        plugins={[
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <UndoRedo />
                <BoldItalicUnderlineToggles />
                <BlockTypeSelect />
                <CodeToggle />
                <InsertTable />
                <CreateLink />
                <InsertImage />
                <InsertFrontmatter />
                <InsertSandpack />
                <InsertThematicBreak />
                <Separator />
                <InsertAdmonition />
                <YouTubeButton />
              </>
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
          frontmatterPlugin(),
          imageAsDirectivePlugin(),
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
          markdownLinkShortcutPlugin(),
          markdownShortcutPlugin(),
        ]}
        onChange={handleChange}
        onError={handleError}
      />
    </div>
  );
};

export default Editor;

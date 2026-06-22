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
import { removeVaultFile, saveImageToVault, vaultFileExists } from "./utils/vaultStorage";
import { useNotes } from "./provider/NotesProvider";
import {
  YouTubeButton,
  YoutubeDirectiveDescriptor,
} from "./components/Youtube";
import { wikiLinkPlugin } from "./plugins/wikilink";
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

  const baseName = fileName.includes("/") ? fileName.split("/").pop()! : fileName;
  const folderPrefix = fileName.includes("/") ? fileName.split("/")[0] : "";

  const [draftTitle, setDraftTitle] = useState(baseName);

  useEffect(() => {
    setDraftTitle(baseName);
  }, [fileName]);

  useEffect(() => {
    if (editorRef.current != null) {
      editorRef.current.setMarkdown(content);
    }
  }, [fileName, content]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { pageName } = (e as CustomEvent).detail;
      changeFileName(pageName);
    };
    window.addEventListener("wikilink-navigate", handler);
    return () => window.removeEventListener("wikilink-navigate", handler);
  }, [changeFileName]);

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const imageItems = items.filter((item) => item.type.startsWith("image/"));
    if (imageItems.length === 0) return;

    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    for (const item of imageItems) {
      const file = item.getAsFile();
      if (!file) continue;
      const src = await saveImageToVault(file);
      editorRef.current?.insertMarkdown(`\n![](${src})\n`);
    }
  };

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
    const newBaseName = draftTitle.trim() || "Untitled";
    setDraftTitle(newBaseName);

    const newFullPath = folderPrefix ? `${folderPrefix}/${newBaseName}` : newBaseName;

    if (newFullPath === fileName) {
      return;
    }

    const oldFileExists = await vaultFileExists(`${fileName}.md`);
    if (oldFileExists) {
      await removeVaultFile(`${fileName}.md`);
    }
    await handleSave({
      fileName: newFullPath,
      content,
      changeFileName,
      setContent,
    });
    changeFileName(newFullPath);
    const directory = await listNotes();
    setNotes(directory);
  };

  return (
    <div className="textarea" onPasteCapture={handlePaste}>
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
          wikiLinkPlugin(),
        ]}
        onChange={handleChange}
        onError={handleError}
      />
    </div>
  );
};

export default Editor;

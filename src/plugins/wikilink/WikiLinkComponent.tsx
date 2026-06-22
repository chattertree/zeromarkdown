import { useState, useRef, useCallback } from "react";
import { listVaultMdFiles, readVaultFile, vaultFileExists } from "../../utils/vaultStorage";
import { useNotes } from "../../provider/NotesProvider";
import { useEditor } from "../../provider/EditorProvider";

type WikiLinkProps = {
  pageName: string;
  alias?: string;
  nodeKey: string;
};

async function findNoteRelativePath(pageName: string): Promise<string | null> {
  const directExists = await vaultFileExists(`${pageName}.md`);
  if (directExists) return pageName;

  const allFiles = await listVaultMdFiles();
  const match = allFiles.find(
    (f) => f.name === `${pageName}.md`,
  );
  if (match) {
    return match.folder ? `${match.folder}/${pageName}` : pageName;
  }
  return null;
}

export const WikiLinkComponent = ({ pageName, alias }: WikiLinkProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [noteExists, setNoteExists] = useState<boolean | null>(null);
  const [resolvedPath, setResolvedPath] = useState<string | null>(null);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { setNotes } = useNotes();
  const { setContent } = useEditor();

  const checkExists = useCallback(async () => {
    if (noteExists !== null) return noteExists;
    const path = await findNoteRelativePath(pageName);
    if (path) {
      setNoteExists(true);
      setResolvedPath(path);
      return true;
    }
    setNoteExists(false);
    return false;
  }, [pageName, noteExists]);

  const handleMouseEnter = async () => {
    hoverTimeout.current = setTimeout(async () => {
      const exists = await checkExists();
      if (exists) {
        try {
          const filePath = resolvedPath || pageName;
          const content = await readVaultFile(`${filePath}.md`);
          const lines = content.split("\n").slice(0, 6).join("\n");
          setPreview(lines);
        } catch {
          setPreview("(Unable to load preview)");
        }
      } else {
        setPreview(null);
      }
      setShowPreview(true);
    }, 400);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
    setShowPreview(false);
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const exists = await checkExists();
    if (exists) {
      const filePath = resolvedPath || pageName;
      const fileContent = await readVaultFile(`${filePath}.md`);
      setContent(fileContent);
      window.dispatchEvent(
        new CustomEvent("wikilink-navigate", { detail: { pageName: filePath } })
      );
    } else {
      await import("../../utils/vaultStorage").then(({ writeVaultFile }) =>
        writeVaultFile(`${pageName}.md`, `# ${pageName}\n`)
      );
      setContent(`# ${pageName}\n`);
      window.dispatchEvent(
        new CustomEvent("wikilink-navigate", { detail: { pageName } })
      );
      const { listNotes } = await import("../../utils/fileUtils");
      const notes = await listNotes();
      setNotes(notes);
    }
  };

  const displayText = alias || pageName;
  const existsClass =
    noteExists === false ? "wiki-link-missing" : "wiki-link-exists";

  return (
    <span
      className={`wiki-link ${existsClass}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onLoad={() => { checkExists(); }}
      ref={(el) => { if (el && noteExists === null) checkExists(); }}
    >
      <span className="wiki-link-brackets">[[</span>
      <span className="wiki-link-text">{displayText}</span>
      <span className="wiki-link-brackets">]]</span>

      {showPreview && (
        <span className="wiki-link-preview">
          {noteExists === false ? (
            <span className="wiki-link-preview-missing">
              Note does not exist. Click to create.
            </span>
          ) : (
            <pre className="wiki-link-preview-content">
              {preview || "Loading..."}
            </pre>
          )}
        </span>
      )}
    </span>
  );
};

import { useEffect, useState, type ChangeEvent, type ReactNode } from "react";
import {
  IconNote,
  IconPin,
  IconPinnedFilled,
  IconPlus,
  IconTrash,
  IconFolder,
  IconChevronRight,
  IconFolderPlus,
} from "@tabler/icons-react";
import { useEditor } from "./provider/EditorProvider";
import { useNotes } from "./provider/NotesProvider";
import { handleNew, listNotes, NoteObj, FolderObj } from "./utils/fileUtils";
import {
  createFolder,
  deleteFolder,
  initVault,
  moveNoteToFolder,
  moveNoteToRoot,
  readVaultFile,
  removeVaultFile,
  vaultExists,
  writeVaultFile,
} from "./utils/vaultStorage";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  DndContext,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensors,
  useSensor,
  DragEndEvent,
} from "@dnd-kit/core";

type NotesProps = {
  fileName: string;
  changeFileName: (newName: string | undefined) => void;
  children: ReactNode;
};

function DraggableNote({
  noteObj,
  fileName,
  onEdit,
  onDelete,
  onPin,
  isSubItem,
}: {
  noteObj: NoteObj;
  fileName: string;
  onEdit: (relativePath: string) => void;
  onDelete: (relativePath: string) => void;
  onPin: (action: string, noteObj: NoteObj) => void;
  isSubItem?: boolean;
}) {
  const noteName = noteObj.name.split(".md")[0];
  const noteId = noteObj.relativePath.replace(/\.md$/, "");
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: noteObj.relativePath,
    data: { noteObj },
  });

  if (isSubItem) {
    return (
      <SidebarMenuSubItem>
        <div
          ref={setNodeRef}
          {...attributes}
          {...listeners}
          style={{ opacity: isDragging ? 0.4 : 1 }}
        >
          <SidebarMenuSubButton
            render={<button type="button" />}
            onClick={() => onEdit(noteId)}
            isActive={fileName === noteId}
          >
            <IconNote size={14} />
            <span>{noteName}</span>
          </SidebarMenuSubButton>
        </div>
      </SidebarMenuSubItem>
    );
  }

  return (
    <SidebarMenuItem>
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={{ opacity: isDragging ? 0.4 : 1 }}
      >
        <SidebarMenuButton
          onClick={() => onEdit(noteId)}
          isActive={fileName === noteId}
        >
          <IconNote />
          <span>{noteName}</span>
        </SidebarMenuButton>
      </div>
      <SidebarMenuAction
        showOnHover={!noteObj.meta.isPinned}
        className={noteObj.meta.isPinned ? "text-yellow-500 opacity-100" : undefined}
        onClick={(e) => {
          e.stopPropagation();
          onPin(noteObj.meta.isPinned ? "unpin" : "pin", noteObj);
        }}
        title={noteObj.meta.isPinned ? "Unpin" : "Pin"}
      >
        {noteObj.meta.isPinned ? <IconPinnedFilled /> : <IconPin />}
      </SidebarMenuAction>
      <SidebarMenuAction
        showOnHover
        className="right-7"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(noteId);
        }}
        title="Delete"
      >
        <IconTrash />
      </SidebarMenuAction>
    </SidebarMenuItem>
  );
}

function DroppableFolder({
  folder,
  fileName,
  onEdit,
  onDelete,
  onPin,
  onDeleteFolder,
}: {
  folder: FolderObj;
  fileName: string;
  onEdit: (relativePath: string) => void;
  onDelete: (relativePath: string) => void;
  onPin: (action: string, noteObj: NoteObj) => void;
  onDeleteFolder: (name: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `folder:${folder.name}`,
    data: { folder: folder.name },
  });

  return (
    <Collapsible defaultOpen={false} className="group/collapsible">
      <SidebarMenuItem>
        <div ref={setNodeRef}>
          <CollapsibleTrigger
            render={
              <SidebarMenuButton
                className={isOver ? "bg-accent ring-2 ring-primary/50" : undefined}
              />
            }
          >
            <IconFolder />
            <span>{folder.name}</span>
            <IconChevronRight
              size={14}
              className="ml-auto transition-transform group-data-[open]/collapsible:rotate-90"
            />
          </CollapsibleTrigger>
        </div>
        <SidebarMenuAction
          showOnHover
          onClick={(e) => {
            e.stopPropagation();
            onDeleteFolder(folder.name);
          }}
          title="Delete folder"
        >
          <IconTrash />
        </SidebarMenuAction>
        <CollapsibleContent>
          <SidebarMenuSub>
            {folder.notes.map((note) => (
              <DraggableNote
                key={note.relativePath}
                noteObj={note}
                fileName={fileName}
                onEdit={onEdit}
                onDelete={onDelete}
                onPin={onPin}
                isSubItem
              />
            ))}
            {folder.notes.length === 0 && (
              <SidebarMenuSubItem>
                <span className="px-2 text-xs text-muted-foreground italic">Empty</span>
              </SidebarMenuSubItem>
            )}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

function SidebarNav({
  fileName,
  handleSearch,
  handleEdit,
  handleDelete,
  handleNewNote,
  handleCreateFolder,
  handleDeleteFolder,
  pinNotes,
}: {
  fileName: string;
  handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  handleEdit: (relativePath: string) => void;
  handleDelete: (relativePath: string) => void;
  handleNewNote: () => void;
  handleCreateFolder: (name: string) => void;
  handleDeleteFolder: (name: string) => void;
  pinNotes: (action: string, noteObj: NoteObj) => void;
}) {
  const { state } = useSidebar();
  const { notes } = useNotes();
  const isCollapsed = state === "collapsed";
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const submitNewFolder = () => {
    const name = newFolderName.trim();
    if (name) {
      handleCreateFolder(name);
    }
    setNewFolderName("");
    setIsCreatingFolder(false);
  };

  return (
    <Sidebar collapsible="icon">
      {!isCollapsed && (
        <SidebarHeader>
          <SidebarInput
            type="search"
            placeholder="Search for your notes"
            onChange={handleSearch}
          />
        </SidebarHeader>
      )}
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleNewNote}>
                  <IconPlus />
                  <span>Create a New Note</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setIsCreatingFolder(true)}>
                  <IconFolderPlus />
                  <span>Create a Folder</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {isCreatingFolder && (
                <SidebarMenuItem>
                  <input
                    autoFocus
                    type="text"
                    placeholder="Folder name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submitNewFolder();
                      if (e.key === "Escape") {
                        setNewFolderName("");
                        setIsCreatingFolder(false);
                      }
                    }}
                    onBlur={submitNewFolder}
                    className="mx-2 rounded-md border bg-background px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-ring"
                  />
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Your Notes</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {notes.folders.map((folder) => (
                <DroppableFolder
                  key={folder.name}
                  folder={folder}
                  fileName={fileName}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onPin={pinNotes}
                  onDeleteFolder={handleDeleteFolder}
                />
              ))}
              {notes.rootNotes.map((note) => (
                <DraggableNote
                  key={note.relativePath}
                  noteObj={note}
                  fileName={fileName}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onPin={pinNotes}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <RootDropZone />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

const NotesMenu = ({ fileName, changeFileName, children }: NotesProps) => {
  const { setNotes } = useNotes();
  const { content, setContent } = useEditor();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  useEffect(() => {
    loadVault();
  }, [content]);

  const loadVault = async () => {
    try {
      const vault = await vaultExists();
      if (!vault) {
        await initVault();
        setNotes({ rootNotes: [], folders: [] });
      } else {
        const vaultFiles = await listNotes();
        setNotes(vaultFiles);
      }
    } catch (error) {
      console.error("Failed to load vault:", error);
    }
  };

  const handleEdit = async (relativePath: string) => {
    try {
      const fileContents = await readVaultFile(`${relativePath}.md`);
      changeFileName(relativePath);
      setContent(fileContents);
    } catch (error) {
      console.error("Failed to open note:", error);
    }
  };

  const handleDelete = async (relativePath: string) => {
    await removeVaultFile(`${relativePath}.md`);
    if (fileName === relativePath) {
      changeFileName("Untitled");
      setContent("");
    }
    const directory = await listNotes();
    setNotes(directory);
  };

  const handleSearch = async (e: ChangeEvent<HTMLInputElement>) => {
    const tree = await listNotes();
    const query = e.target.value.toLowerCase();
    if (!query) {
      setNotes(tree);
      return;
    }
    const filteredRoot = tree.rootNotes.filter((n) =>
      n.name.toLowerCase().includes(query),
    );
    const filteredFolders = tree.folders
      .map((f) => ({
        ...f,
        notes: f.notes.filter((n) => n.name.toLowerCase().includes(query)),
      }))
      .filter((f) => f.notes.length > 0);
    setNotes({ rootNotes: filteredRoot, folders: filteredFolders });
  };

  const handleCreateFolder = async (name: string) => {
    await createFolder(name);
    const directory = await listNotes();
    setNotes(directory);
  };

  const handleDeleteFolder = async (name: string) => {
    try {
      await deleteFolder(name);
      const directory = await listNotes();
      setNotes(directory);
    } catch {
      alert("Folder must be empty before deleting.");
    }
  };

  const pinNotes = async (action: string, noteObj: NoteObj) => {
    const pinData = await readVaultFile("config.json");
    const data = JSON.parse(pinData);
    const noteKey = noteObj.relativePath;
    if (action === "pin" && !data.pinned.includes(noteKey)) {
      data.pinned.push(noteKey);
    } else {
      data.pinned = data.pinned.filter((n: string) => n !== noteKey);
    }
    await writeVaultFile("config.json", JSON.stringify(data));
    loadVault();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const noteObj = active.data.current?.noteObj as NoteObj | undefined;
    if (!noteObj) return;

    const overId = over.id as string;
    const noteId = noteObj.relativePath.replace(/\.md$/, "");

    if (overId.startsWith("folder:")) {
      const targetFolder = overId.replace("folder:", "");
      const currentFolder = noteId.includes("/") ? noteId.split("/")[0] : null;
      if (currentFolder === targetFolder) return;
      await moveNoteToFolder(noteId, targetFolder);
    } else if (overId === "root-drop-zone") {
      if (!noteId.includes("/")) return;
      await moveNoteToRoot(noteId);
    } else {
      return;
    }

    if (fileName === noteId) {
      const baseName = noteId.includes("/") ? noteId.split("/").pop()! : noteId;
      const newPath = overId.startsWith("folder:")
        ? `${overId.replace("folder:", "")}/${baseName}`
        : baseName;
      changeFileName(newPath);
    }

    const directory = await listNotes();
    setNotes(directory);
  };

  return (
    <TooltipProvider>
      <SidebarProvider>
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SidebarNav
            fileName={fileName}
            handleSearch={handleSearch}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handleNewNote={() => handleNew(setContent, changeFileName)}
            handleCreateFolder={handleCreateFolder}
            handleDeleteFolder={handleDeleteFolder}
            pinNotes={pinNotes}
          />
          <SidebarInset className="h-svh overflow-hidden">
            <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger />
            </header>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {children}
            </div>
          </SidebarInset>
        </DndContext>
      </SidebarProvider>
    </TooltipProvider>
  );
};

function RootDropZone() {
  const { setNodeRef, isOver } = useDroppable({ id: "root-drop-zone" });
  return (
    <div
      ref={setNodeRef}
      className={`mx-2 mt-2 rounded-md border border-dashed px-3 py-2 text-center text-xs transition-colors ${
        isOver
          ? "border-primary bg-accent text-foreground"
          : "border-muted-foreground/30 text-muted-foreground"
      }`}
    >
      Drop here to move to root
    </div>
  );
}

export default NotesMenu;

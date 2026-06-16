import { useEffect, type ChangeEvent, type ReactNode } from "react";
import {
  IconNote,
  IconPin,
  IconPinnedFilled,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { useEditor } from "./provider/EditorProvider";
import { useNotes } from "./provider/NotesProvider";
import { handleNew, listNotes } from "./utils/fileUtils";
import {
  initVault,
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
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

type NotesProps = {
  fileName: string;
  changeFileName: (newName: string | undefined) => void;
  children: ReactNode;
};

type NoteObj = {
  path: string;
  name: string;
  meta: {
    isPinned: boolean;
  };
};

const NotesMenu = ({ fileName, changeFileName, children }: NotesProps) => {
  const { notes, setNotes } = useNotes();
  const { content, setContent } = useEditor();

  useEffect(() => {
    loadVault();
  }, [content]);

  const loadVault = async () => {
    try {
      const vault = await vaultExists();
      if (!vault) {
        await initVault();
        setNotes([]);
      } else {
        const vaultFiles = await listNotes();
        setNotes([...vaultFiles]);
      }
    } catch (error) {
      console.error("Failed to load vault:", error);
    }
  };

  const handleEdit = async (noteName: string) => {
    try {
      const fileContents = await readVaultFile(`${noteName}.md`);
      changeFileName(noteName);
      setContent(fileContents);
    } catch (error) {
      console.error("Failed to open note:", error);
    }
  };

  const handleDelete = async (noteName: string) => {
    await removeVaultFile(`${noteName}.md`);
    const directory = await listNotes();
    if (fileName == noteName) {
      changeFileName("Untitled");
      setContent("");
    }
    setNotes([...directory]);
  };

  const handleSearch = async (e: ChangeEvent<HTMLInputElement>) => {
    const directory = await listNotes();
    const results = directory.filter((file) =>
      file.name?.toLowerCase()?.includes(e.target.value.toLowerCase()),
    );
    setNotes(results);
  };

  const pinNotes = async (action: string, note: NoteObj) => {
    const pinData = await readVaultFile("config.json");
    const data = JSON.parse(pinData);
    if (action === "pin" && !data.pinned.includes(note.name)) {
      data.pinned.push(note.name);
    } else {
      data.pinned = data.pinned.filter((n: string) => n !== note.name);
    }
    await writeVaultFile("config.json", JSON.stringify(data));
    loadVault();
  };

  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <SidebarInput
              type="search"
              placeholder="Search for your notes"
              onChange={handleSearch}
            />
          </SidebarHeader>
          <SidebarSeparator />
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => handleNew(setContent, changeFileName)}
                    >
                      <IconPlus />
                      <span>Create a New Note</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Your Notes</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {notes.map((note: NoteObj) => {
                    const noteName = note.name.split(".md")[0];
                    return (
                      <SidebarMenuItem key={note.path}>
                        <SidebarMenuButton
                          onClick={() => handleEdit(noteName)}
                          isActive={fileName === noteName}
                        >
                          <IconNote />
                          <span>{noteName}</span>
                        </SidebarMenuButton>
                        <SidebarMenuAction
                          showOnHover={!note.meta.isPinned}
                          className={
                            note.meta.isPinned
                              ? "text-yellow-500 opacity-100"
                              : undefined
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            pinNotes(
                              note.meta.isPinned ? "unpin" : "pin",
                              note,
                            );
                          }}
                          title={note.meta.isPinned ? "Unpin" : "Pin"}
                        >
                          {note.meta.isPinned ? (
                            <IconPinnedFilled />
                          ) : (
                            <IconPin />
                          )}
                        </SidebarMenuAction>
                        <SidebarMenuAction
                          showOnHover
                          className="right-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(noteName);
                          }}
                          title="Delete"
                        >
                          <IconTrash />
                        </SidebarMenuAction>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
        <SidebarInset className="h-svh overflow-hidden">
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger />
          </header>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
};

export default NotesMenu;

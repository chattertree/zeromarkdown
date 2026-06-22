import React, { createContext, useContext, useEffect, useState } from "react";
import { listNotes, NotesTree } from "../utils/fileUtils";

type ChildrenProps = {
  children: React.ReactNode;
};

type ContextState = {
  notes: NotesTree;
  setNotes: React.Dispatch<React.SetStateAction<NotesTree>>;
};

const initialState: ContextState = {
  notes: { rootNotes: [], folders: [] },
  setNotes: () => {},
};

const NotesContext = createContext<ContextState>(initialState);

export const NotesProvider = ({ children }: ChildrenProps) => {
  const [notes, setNotes] = useState<NotesTree>({ rootNotes: [], folders: [] });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const notesData = await listNotes();
      setNotes(notesData);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    }
  };

  return (
    <NotesContext.Provider value={{ notes, setNotes }}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => useContext(NotesContext);

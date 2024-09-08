import React, { createContext, useContext, useEffect, useState } from "react";
//@ts-ignore
import data from "../data/data";
import { listNotes } from "../utils/fileUtils";

type ChildrenProps = {
  children: React.ReactNode;
};

type ContextState = {
  notes: any;
  setNotes: any;
};

const initialState = {
  notes: [],
  setNotes: () => [],
};

const NotesContext = createContext<ContextState>(initialState);

export const NotesProvider = ({ children }: ChildrenProps) => {
  const [notes, setNotes] = useState<any>([]);
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const notesData = await listNotes();
    setNotes(notesData);
  };

  return (
    <NotesContext.Provider value={{ notes, setNotes }}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => useContext(NotesContext);

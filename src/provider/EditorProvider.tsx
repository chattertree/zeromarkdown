import React, { createContext, useContext, useState } from "react";
//@ts-ignore
import data from "../data/data";

type ChildrenProps = {
  children: React.ReactNode;
};

type ContextState = {
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
};

const initialState = {
  content: "",
  setContent: () => "",
};

const EditorContext = createContext<ContextState>(initialState);

export const EditorProvider = ({ children }: ChildrenProps) => {
  const [content, setContent] = useState<string>(data.data);

  return (
    <EditorContext.Provider value={{ content, setContent }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => useContext(EditorContext);

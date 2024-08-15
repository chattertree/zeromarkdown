import { createContext, useContext, useState } from "react";
import data from "../data/data";

export const EditorContext = createContext(null);

const EditorProvider = ({ children }) => {
  const [content, setContent] = useState(data.data);

  return (
    <EditorContext.Provider value={[content, setContent]}>
      {children}
    </EditorContext.Provider>
  );
};

export default EditorProvider;

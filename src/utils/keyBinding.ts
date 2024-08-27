import React from "react";
import { handleOpen, handleNew, handleSave } from "./fileUtils";

export const handleKey = (
  e: React.KeyboardEvent<HTMLDivElement>,
  content: string,
  fileName: string,
  changeFileName: Function,
  setContent: React.Dispatch<React.SetStateAction<string>>,
) => {
  const code = e.key;

  if ((e.ctrlKey || e.metaKey) && code == "s") {
    handleSave({ fileName, content, changeFileName, setContent });
  } else if ((e.ctrlKey || e.metaKey) && code == "o") {
    handleOpen({ changeFileName, setContent, fileName, content });
  } else if ((e.ctrlKey || e.metaKey) && code == "n") {
    handleNew({ setContent, changeFileName, content, fileName });
  }
};

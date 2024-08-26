import { handleOpen, handleNew, handleSave } from "./fileUtils";

type KeyProps = {
  e: KeyboardEvent;
  content: string;
  fileName: string;
  changeFileName: Function;
  setContent: React.Dispatch<React.SetStateAction<string>>;
};

export const handleKey = ({
  e,
  content,
  fileName,
  changeFileName,
  setContent,
}: KeyProps) => {
  const code = e.key;

  //let charCode = String.fromCharCode(code).toLowerCase();

  if ((e.ctrlKey || e.metaKey) && code == "s") {
    handleSave({ fileName, content, changeFileName, setContent });
  } else if ((e.ctrlKey || e.metaKey) && code == "o") {
    handleOpen({ changeFileName, setContent, fileName, content });
  } else if ((e.ctrlKey || e.metaKey) && code == "n") {
    handleNew({ setContent, changeFileName, content, fileName });
  }
};

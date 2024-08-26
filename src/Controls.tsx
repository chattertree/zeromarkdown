import { FaFolderOpen, FaPlus, FaSave } from "react-icons/fa";
import { useEditor } from "./provider/EditorProvider";
import { handleSave, handleNew, handleOpen } from "./utils/fileUtils";

type ControlProps = {
  fileName: string;
  changeFileName: Function;
};

const Controls = ({ fileName, changeFileName }: ControlProps) => {
  const { content, setContent } = useEditor();

  return (
    <div className="controlsMenu">
      <button
        className="openFile"
        onClick={() =>
          handleOpen({ changeFileName, setContent, fileName, content })
        }
      >
        <FaFolderOpen />
      </button>
      <button
        className="newFile"
        onClick={() =>
          handleNew({ setContent, changeFileName, fileName, content })
        }
      >
        <FaPlus />
      </button>
      <button
        className="saveFile"
        onClick={() =>
          handleSave({ fileName, content, changeFileName, setContent })
        }
      >
        <FaSave />
      </button>
    </div>
  );
};

export default Controls;

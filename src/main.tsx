import ReactDOM from "react-dom/client";
import App from "./App";
import { EditorProvider } from "./provider/EditorProvider";
import { NotesProvider } from "./provider/NotesProvider";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <EditorProvider>
    <NotesProvider>
      <>
        <App />
      </>
    </NotesProvider>
  </EditorProvider>,
);

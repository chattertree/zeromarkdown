import ReactDOM from "react-dom/client";
import App from "./App";
import { EditorProvider } from "./provider/EditorProvider";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <EditorProvider>
    <>
      <App />
    </>
  </EditorProvider>,
);

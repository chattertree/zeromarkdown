import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import ReactMarkdown, { Components } from "react-markdown";
import rehypeSanitize from "./plugins/rehypeSanitize";
import { useEditor } from "./provider/EditorProvider";
import CodeBlock from "./components/CodeBlock";

const Renderer = () => {
  const { content } = useEditor();
  const component: Partial<Components> = {
    code: CodeBlock,
  };

  return (
    <div className="render">
      <ReactMarkdown
        children={content}
        components={component}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
      />
    </div>
  );
};

export default Renderer;

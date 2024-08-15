import remarkGfm from "remark-gfm";
import React, { useContext } from "react";
import rehypeRaw from "rehype-raw";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSanitize from "./plugins/rehypeSanitize";
import { EditorContext } from "./provider/EditorProvider";
import MultiCode from "./components/MultiCode";
import CodeBlock from "./components/CodeBlock";

const Renderer = () => {
  const [content, setContent] = useContext(EditorContext);
  const component = {
    multicode: MultiCode,
    code: CodeBlock,
  };

  return (
    <div className="render">
      <ReactMarkdown
        children={content}
        components={component}
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex, rehypeRaw, rehypeSanitize]}
      />
    </div>
  );
};

export default Renderer;

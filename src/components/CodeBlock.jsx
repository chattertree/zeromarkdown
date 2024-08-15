import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import Mermaid from "./Mermaid";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const CodeBlock = ({ node, inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || "");
  return !inline && match ? (
    match[1] == "mermaid" ? (
      <Mermaid data={children} />
    ) : (
      <SyntaxHighlighter
        children={String(children).replace(/\n$/, "")}
        language={match[1]}
        PreTag="div"
        style={atomDark}
        {...props}
      />
    )
  ) : (
    <code className={className} {...props}>
      {children}
    </code>
  );
};

export default CodeBlock;

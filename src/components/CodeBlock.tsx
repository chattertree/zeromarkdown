//@ts-nocheck
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import Mermaid from "./Mermaid";
import { ExtraProps } from "react-markdown/";
import { dark } from "react-syntax-highlighter/dist/esm/styles/hljs";

const CodeBlock = (props: JSX.IntrinsicElements["code"] & ExtraProps) => {
  const { children, className, ...rest } = props;
  const match = /language-(\w+)/.exec(className || "")!;
  return match[1] == "mermaid" ? (
    <Mermaid data={children} />
  ) : (
    <SyntaxHighlighter
      children={
        typeof children === "undefined"
          ? ""
          : String(children).replace(/\n$/, "")
      }
      language={match[1]}
      style={dark}
      PreTag="div"
      {...rest}
    />
  );
};

export default CodeBlock;

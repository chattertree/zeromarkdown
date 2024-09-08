import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import {
  CodeBlockEditorDescriptor,
  useCodeBlockEditorContext,
} from "@mdxeditor/editor";

type MermaidProps = {
  code: string;
};

mermaid.initialize({
  startOnLoad: true,
  theme: "dark",
  securityLevel: "loose",
});

const MermaidPreview = ({ code }: MermaidProps) => {
  let mermaidElement = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mermaidElement.current) {
      if (typeof code == "string") {
        code = code.replace("—>", "-->");
      }
      mermaid.render("mermaidContent", code).then(({ svg }) => {
        mermaidElement.current!.innerHTML = svg;
      });
    }
  }, [code]);

  return (
    <>
      <div ref={mermaidElement}>{code}</div>
    </>
  );
};

export const MermaidCodeEditorDescriptor: CodeBlockEditorDescriptor = {
  match: (language, _meta) => {
    return language === "mermaid" || language == "mmd";
  },
  priority: 0,
  Editor: (props) => {
    const cb = useCodeBlockEditorContext();
    const [code, setCode] = useState(props.code);

    return (
      <div
        onKeyDown={(e) => {
          e.nativeEvent.stopImmediatePropagation();
        }}
      >
        <div style={{ display: "flex" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span className="textSpan">Mermaid Code</span>
            <textarea
              style={{
                backgroundColor: "inherit",
                borderRadius: 10,
                border: "1px solid #000",
                outline: "none",
                color: "#fff",
                padding: 10,
                resize: "none",
                fontSize: 16,
              }}
              rows={10}
              cols={30}
              autoFocus={props.code === ""}
              autoCapitalize="none"
              autoComplete="false"
              spellCheck="false"
              defaultValue={props.code}
              onChange={(e) => {
                setCode(e.target.value);
                cb.setCode(e.target.value);
              }}
              autoCorrect="false"
            />
          </div>
          <div style={{ flex: 1 }}>
            <MermaidPreview code={code} />
          </div>
        </div>
      </div>
    );
  },
};

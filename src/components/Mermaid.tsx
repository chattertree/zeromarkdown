import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { v4 as uuidv4 } from "uuid";
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
      mermaid.render(`mermaidContent-${uuidv4()}`, code).then(({ svg }) => {
        mermaidElement.current!.innerHTML = svg;
      });
    }
  }, [code]);

  return (
    <>
      <div className="user-content-mermaid" ref={mermaidElement}>
        {code}
      </div>
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
            {/* <span className="textSpan">Mermaid</span> */}
            <textarea
              style={{
                backgroundColor: "inherit",
                outline: "none",
                color: "#fff",
                padding: 10,
                resize: "none",
                fontSize: 16,
                border: "none",
                borderLeft: "3px solid hsl(348, 100%, 61%)",
              }}
              rows={10}
              cols={20}
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

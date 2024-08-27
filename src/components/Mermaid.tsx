import { ReactNode, useEffect, useRef } from "react";
import mermaid from "mermaid";
import { v4 as uuidv4 } from "uuid";

type MermaidProps = {
  data: string | ReactNode | undefined;
};

const Mermaid = ({ data }: MermaidProps) => {
  let mermaidElement = useRef<HTMLInputElement>(null);

  useEffect(() => {
    mermaid.initialize({
      securityLevel: "loose",
      theme: "dark",
    });
    let x = String(`user-content-${uuidv4()}`);
    if (data) {
      const handleChange = async () => {
        try {
          if (typeof data == "string") {
            const parserData = await mermaid.parse(data, {
              suppressErrors: true,
            });
            if (parserData) {
              const result = await mermaid.render(x, data);
              if (mermaidElement.current !== null) {
                mermaidElement.current.innerHTML = result.svg;
              }
            }
          }
        } catch (err) {}
      };
      handleChange();
    }
  }, [data]);

  return (
    <>
      <div className="user-content-mermaid" ref={mermaidElement}></div>
    </>
  );
};

export default Mermaid;

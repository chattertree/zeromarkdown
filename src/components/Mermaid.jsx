import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";
import { v4 as uuidv4 } from "uuid";

const Mermaid = ({ data }) => {
  const mermaidElement = useRef(null);

  useEffect(() => {
    let x = String(`user-content-${uuidv4()}`);
    if (data) {
      const handleChange = async () => {
        try {
          const ans = await mermaid.parse(data);
          const result = await mermaid.render(x, data);
          mermaidElement.current.innerHTML = result.svg;
        } catch (err) {
          console.error(err);
        }
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

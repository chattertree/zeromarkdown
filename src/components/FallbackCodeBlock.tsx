import {
  CodeBlockEditorDescriptor,
  useCodeBlockEditorContext,
} from "@mdxeditor/editor";

export const FallbackCodeBlockDescriptor: CodeBlockEditorDescriptor = {
  match: (_language, _meta) => true,
  priority: -1,
  Editor: (props) => {
    const cb = useCodeBlockEditorContext();

    return (
      <div
        onKeyDown={(e) => {
          e.nativeEvent.stopImmediatePropagation();
        }}
      >
        <textarea
          style={{
            width: "100%",
            backgroundColor: "inherit",
            outline: "none",
            color: "#fff",
            padding: 10,
            resize: "vertical",
            fontSize: 14,
            fontFamily: "monospace",
            border: "none",
            borderLeft: "3px solid #555",
            minHeight: "80px",
          }}
          rows={Math.max(5, props.code.split("\n").length)}
          autoCapitalize="none"
          autoComplete="off"
          spellCheck={false}
          defaultValue={props.code}
          onChange={(e) => {
            cb.setCode(e.target.value);
          }}
          autoCorrect="off"
        />
      </div>
    );
  },
};

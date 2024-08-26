import { Monaco } from "@monaco-editor/react";
import { Position } from "monaco-editor";

function createDependencyProposals(range: any, monaco: Monaco) {
  return [
    {
      documentation: "Create a table with this snippet",
      insertText:
        "| ${1:Col 1} | ${2:Col 2} | ${3:Col 3} |\n| :---: | :---: | :---: |\n| ${4:data 1}| ${5:data 2}| ${6:data 3}|\n<br>",
      kind: monaco.languages.CompletionItemKind.Function,
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      label: "table",
      range: range,
      detail: "Adds a Table Layout",
    },
    {
      documentation: "Heading 1",
      insertText: "# ",
      kind: monaco.languages.CompletionItemKind.Keyword,
      label: "Heading 1",
      range: range,
      detail: "Adds a H1 Heading",
    },
    {
      documentation: "Heading 2",
      insertText: "## ",
      kind: monaco.languages.CompletionItemKind.Keyword,
      label: "Heading 2",
      range: range,
      detail: "Adds a H2 Heading",
    },
    {
      documentation: "Heading 3",
      insertText: "### ",
      kind: monaco.languages.CompletionItemKind.Keyword,
      label: "Heading 3",
      range: range,
      detail: "Adds a H3 Heading",
    },
    {
      documentation: "Heading 4",
      insertText: "#### ",
      kind: monaco.languages.CompletionItemKind.Keyword,
      label: "Heading 4",
      range: range,
      detail: "Adds a H4 Heading",
    },
    {
      documentation: "Heading 5",
      insertText: "##### ",
      kind: monaco.languages.CompletionItemKind.Keyword,
      label: "Heading 5",
      range: range,
      detail: "Adds a H5 Heading",
    },
    {
      documentation: "Heading 6",
      insertText: "###### ",
      kind: monaco.languages.CompletionItemKind.Keyword,
      label: "Heading 6",
      range: range,
      detail: "Adds a H6 Heading",
    },
    {
      documentation: "Blockquotes",
      insertText: "<blockquote>${1:}</blockquote>",
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      kind: monaco.languages.CompletionItemKind.Function,
      label: "Blockquote",
      range: range,
      detail: "Adds a Blockquote",
    },
    {
      documentation: "Mermaid Flowchart",
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      insertText:
        "```mermaid\nflowchart LR\n${1:Start} --> ${2:Analyze}\n${3:Analyze} --> ${4:Start}\n${5:}```",
      kind: monaco.languages.CompletionItemKind.Function,
      label: "Mermaid Flowchart",
      range: range,
      detail: "Adds Mermaid Flowchart Block",
    },
    {
      documentation: "Mermaid Sequence Diagram",
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      insertText:
        "```mermaid\nsequenceDiagram\n${1:Alice->>John: Hello John, how are you?}\n${2:John-->>Alice: Great!}\n${3:Alice-)John: See you later!}\n${4:}```",
      kind: monaco.languages.CompletionItemKind.Function,
      label: "Mermaid Sequence Diagram",
      range: range,
      detail: "Adds Mermaid Sequence Diagram Block",
    },
    {
      documentation: "Mermaid Pie Chart",
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      insertText:
        "```mermaid\npie title ${1:Pets adopted by volunteers}\n${2:'Dogs' : 386}\n${3:'Cats' : 85}\n${4:'Rats' : 15}\n${5:}```",
      kind: monaco.languages.CompletionItemKind.Function,
      label: "Mermaid Pie Chart",
      range: range,
      detail: "Adds Mermaid Pie Chart Block",
    },
    {
      documentation: "Anchor Text",
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      insertText: "[${1:click here}](${2:google.com})",
      kind: monaco.languages.CompletionItemKind.Keyword,
      label: "Anchor Text",
      range: range,
      detail: "Adds an Anchor Text",
    },
    {
      documentation: "Unordered List Item",
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      insertText: "- ${1:list 1}",
      kind: monaco.languages.CompletionItemKind.Keyword,
      label: "List Unordered",
      range: range,
      detail: "Adds an Unordered List",
    },
  ];
}

type ProviderProps = {
  model: any;
  position: Position;
  monaco: Monaco;
};

export function markdownProvider({ model, position, monaco }: ProviderProps) {
  let word = model.getWordUntilPosition(position);
  let range = {
    startLineNumber: position.lineNumber,
    endLineNumber: position.lineNumber,
    startColumn: word.startColumn,
    endColumn: word.endColumn,
  };

  return {
    suggestions: createDependencyProposals(range, monaco),
  };
}

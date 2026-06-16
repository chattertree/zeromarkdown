// @ts-nocheck
// Type checking disabled: LexicalExportVisitor generics require the same
// LexicalNode base from MDXEditor's bundled lexical, causing version conflicts.

import type { LexicalExportVisitor } from "@mdxeditor/editor";
import { $isWikiLinkNode } from "./WikiLinkNode";

export const LexicalWikiLinkVisitor: LexicalExportVisitor<any, any> = {
  testLexicalNode: $isWikiLinkNode,
  visitLexicalNode({ lexicalNode, mdastParent, actions }) {
    const mdastNode = {
      type: "wikiLink",
      value: lexicalNode.getPageName(),
      data: {
        alias: lexicalNode.getAlias(),
      },
    };
    actions.appendToParent(mdastParent, mdastNode);
  },
};

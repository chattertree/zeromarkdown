// @ts-nocheck
// Type checking disabled: wikiLink is a custom MDAST node type not in the
// standard Mdast.Nodes union, requiring loose typing at the plugin boundary.

import type { MdastImportVisitor } from "@mdxeditor/editor";
import { $createWikiLinkNode } from "./WikiLinkNode";

export interface WikiLinkMdastNode {
  type: "wikiLink";
  value: string;
  data?: {
    alias?: string;
    permalink?: string;
    exists?: boolean;
  };
}

export const MdastWikiLinkVisitor: MdastImportVisitor<any> = {
  testNode: (node) => {
    return node.type === "wikiLink";
  },
  visitNode({ mdastNode, actions }) {
    const pageName = mdastNode.value || "";
    const alias = mdastNode.data?.alias;
    const lexicalNode = $createWikiLinkNode(pageName, alias || undefined);
    actions.addAndStepInto(lexicalNode);
  },
};

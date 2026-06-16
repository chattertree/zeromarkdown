// @ts-nocheck
import {
  realmPlugin,
  addSyntaxExtension$,
  addMdastExtension$,
  addImportVisitor$,
  addExportVisitor$,
  addLexicalNode$,
  addToMarkdownExtension$,
  createRootEditorSubscription$,
} from "@mdxeditor/editor";
import { syntax } from "micromark-extension-wiki-link";
import { fromMarkdown, toMarkdown } from "mdast-util-wiki-link";
import { TextNode, $getSelection, $isRangeSelection } from "lexical";
import { WikiLinkNode, $createWikiLinkNode } from "./WikiLinkNode";
import { MdastWikiLinkVisitor } from "./MdastWikiLinkVisitor";
import { LexicalWikiLinkVisitor } from "./LexicalWikiLinkVisitor";

const WIKI_LINK_REGEX = /\[\[([^\[\]]+)\]\]/g;

function wikiLinkTransform(node) {
  if (!node.isSimpleText()) return;

  const text = node.getTextContent();
  WIKI_LINK_REGEX.lastIndex = 0;
  const match = WIKI_LINK_REGEX.exec(text);
  if (!match) return;

  const matchStart = match.index;
  const matchLength = match[0].length;
  const innerText = match[1];

  let pageName = innerText;
  let alias;
  if (innerText.includes(":")) {
    const parts = innerText.split(":");
    pageName = parts[0].trim();
    alias = parts.slice(1).join(":").trim();
  }

  let nodeToReplace;
  if (matchStart === 0 && matchLength === text.length) {
    nodeToReplace = node;
  } else if (matchStart === 0) {
    [nodeToReplace] = node.splitText(matchLength);
  } else if (matchStart + matchLength === text.length) {
    [, nodeToReplace] = node.splitText(matchStart);
  } else {
    const [, middle] = node.splitText(matchStart, matchStart + matchLength);
    nodeToReplace = middle;
  }

  const wikiLinkNode = $createWikiLinkNode(pageName, alias);
  nodeToReplace.replace(wikiLinkNode);
}

export const wikiLinkPlugin = realmPlugin({
  init(realm) {
    realm.pubIn({
      [addSyntaxExtension$]: syntax(),
      [addMdastExtension$]: fromMarkdown(),
      [addImportVisitor$]: MdastWikiLinkVisitor,
      [addExportVisitor$]: LexicalWikiLinkVisitor,
      [addLexicalNode$]: WikiLinkNode,
      [addToMarkdownExtension$]: toMarkdown(),
      [createRootEditorSubscription$]: (editor) => {
        return editor.registerNodeTransform(TextNode, (node) => {
          if (node.isAttached()) {
            wikiLinkTransform(node);
          }
        });
      },
    });
  },
});

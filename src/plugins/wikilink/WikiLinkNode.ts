// @ts-nocheck
// Type checking disabled: WikiLinkNode extends lexical's DecoratorNode which
// has version conflicts between the project's @lexical packages and MDXEditor's
// bundled lexical. At runtime, the bundler resolves to the correct instance.

import { DecoratorNode, $applyNodeReplacement } from "lexical";
import { createElement } from "react";
import { WikiLinkComponent } from "./WikiLinkComponent";

export class WikiLinkNode extends DecoratorNode {
  __pageName;
  __alias;

  static getType() {
    return "wikilink";
  }

  static clone(node) {
    return new WikiLinkNode(node.__pageName, node.__alias, node.__key);
  }

  constructor(pageName, alias, key) {
    super(key);
    this.__pageName = pageName;
    this.__alias = alias;
  }

  createDOM() {
    const span = document.createElement("span");
    span.className = "wiki-link-wrapper";
    return span;
  }

  updateDOM() {
    return false;
  }

  static importJSON(serializedNode) {
    return $createWikiLinkNode(serializedNode.pageName, serializedNode.alias);
  }

  exportJSON() {
    return {
      pageName: this.__pageName,
      alias: this.__alias,
      type: "wikilink",
      version: 1,
    };
  }

  getPageName() {
    return this.__pageName;
  }

  getAlias() {
    return this.__alias;
  }

  getTextContent() {
    return this.__alias || this.__pageName;
  }

  isInline() {
    return true;
  }

  decorate() {
    return createElement(WikiLinkComponent, {
      pageName: this.__pageName,
      alias: this.__alias,
      nodeKey: this.__key,
    });
  }
}

export function $createWikiLinkNode(pageName, alias) {
  return $applyNodeReplacement(new WikiLinkNode(pageName, alias));
}

export function $isWikiLinkNode(node) {
  return node instanceof WikiLinkNode;
}

import _ from "lodash";
import { Token } from "./tokenizer";

type LeafNode = { content: string };
type ParentNode = { children: Node[] };
export type Node = LeafNode | ParentNode;

const isLeaf = (node: Node): node is LeafNode => {
  return _.isString((node as LeafNode).content);
};

export const buildTree = (tokens: Token[]): Node => {
  const root: ParentNode = { children: [] };

  const nodeStack: Node[] = [root];

  for (const token of tokens) {
    const current = _.last(nodeStack) as ParentNode;
    if (token.type === "opening-bracket") {
      const child: ParentNode = { children: [] };
      current.children.push(child);
      nodeStack.push(child);
    } else if (token.type === "closing-bracket") {
      nodeStack.pop();
    } else {
      current.children.push({ content: token.raw });
    }
  }

  return root;
};

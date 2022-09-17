import { buildTree } from "./tree";
import { tokenize } from "./tokenizer";

export const parse = (input: string) => {
  const tokens = tokenize(input);
  const tree = buildTree(tokens);
  return tree;
};

import { Node, buildTree } from "./tree";
import { Token, tokenize } from "./tokenizer";

export const parse = (input: string) => {
  const tokens = tokenize(input);
  return buildTree(tokens);
};

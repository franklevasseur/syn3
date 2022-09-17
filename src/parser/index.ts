import { buildTopDownTree, reverseTree } from "./tree";
import { tokenize } from "./tokenizer";

export const parse = (input: string) => {
  const tokens = tokenize(input);
  const topDownTree = buildTopDownTree(tokens);
  const bottomUpTree = reverseTree(topDownTree);
  return { topDownTree, bottomUpTree };
};

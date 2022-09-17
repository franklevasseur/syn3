import { buildTopDownTree, reverseTree } from "./tree";
import { tokenize } from "./tokenizer";

export * as tree from "./tree";

export const parse = (input: string) => {
  const tokens = tokenize(input);
  const topDownTree = buildTopDownTree(tokens);
  const bottomUpTree = reverseTree(topDownTree);
  return { topDownTree, bottomUpTree };
};

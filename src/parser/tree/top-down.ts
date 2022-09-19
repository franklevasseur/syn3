import { TreeParsingError } from "../errors";
import { Stack } from "../stack";
import { Token } from "../tokenizer";
import { POSNode } from "./typings";
import { CharRange } from "../typings";

export type TopDownWordNode = CharRange & {
  type: "word";
  depth: number;
  text: string;
};
export type TopDownPhraseNode = CharRange & {
  type: "phrase";
  depth: number;
  posTag: POSNode;
  children: TopDownTreeNode[];
};
export type TopDownTreeNode = TopDownWordNode | TopDownPhraseNode;
export type TopDownTree = TopDownTreeNode[];

const EMPTY_TOP_DOWN_PHRASE = (): TopDownPhraseNode => ({
  type: "phrase",
  posTag: { text: "NONE", start: -1, end: -1 },
  depth: -1,
  start: -1,
  end: -1,
  children: [],
});

type TopDownTreeState = "OPENING" | "POS_TAG" | "WORDS" | "CLOSING";
export const buildTopDownTree = (tokens: Token[]): TopDownTree => {
  const root: TopDownPhraseNode = EMPTY_TOP_DOWN_PHRASE();
  const stack = new Stack<TopDownPhraseNode>();
  stack.push(root);

  let state: TopDownTreeState = "CLOSING";
  for (const token of tokens) {
    if (state === "OPENING") {
      if (token.type !== "text") {
        throw new TreeParsingError(
          token,
          "Expected part of speech tag. A phrase always starts with a part of speech tag."
        );
      }

      const current = stack.peek()!;
      current.posTag = { start: token.start, end: token.end, text: token.raw };
      state = "POS_TAG";
      continue;
    }

    if (state === "POS_TAG") {
      if (token.type === "closing-bracket") {
        throw new TreeParsingError(
          token,
          "Expected at least a word. A phrase must have at least one word."
        );
      }

      if (token.type === "opening-bracket") {
        const next = EMPTY_TOP_DOWN_PHRASE();
        next.start = token.start;
        next.depth = stack.length - 1;
        stack.push(next);
        state = "OPENING";
      }

      if (token.type === "text") {
        const current = stack.peek()!;
        current.children.push({
          type: "word",
          depth: current.depth + 1,
          text: token.raw,
          start: token.start,
          end: token.end,
        });
        state = "WORDS";
      }

      continue;
    }

    // state === "WORDS" || state === "CLOSING"

    if (token.type === "opening-bracket") {
      const next = EMPTY_TOP_DOWN_PHRASE();
      next.start = token.start;
      next.depth = stack.length - 1;
      stack.push(next);
      state = "OPENING";
    }

    if (token.type === "text") {
      const current = stack.peek()!;
      current.children.push({
        type: "word",
        depth: current.depth + 1,
        text: token.raw,
        start: token.start,
        end: token.end,
      });
      state = "WORDS";
    }

    if (token.type === "closing-bracket") {
      const current = stack.pop()!;
      const parent = stack.peek();
      if (!parent) {
        throw new TreeParsingError(
          token,
          "Unexpected closing bracket. There is no corresponding opening bracket."
        );
      }

      parent.children.push(current);
      current.end = token.end;
      state = "CLOSING";
    }
  }

  if (stack.length > 1) {
    throw new TreeParsingError(
      tokens[tokens.length - 1],
      "Unexpected end of input. There are unclosed brackets."
    );
  }

  return root.children;
};

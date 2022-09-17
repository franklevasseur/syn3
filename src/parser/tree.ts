import _ from "lodash";
import { TreeParsingError } from "./errors";
import { Token } from "./tokenizer";

export type CharRange = { start: number; end: number };
type WordNode = CharRange & { type: "word"; word: string };
type PhraseNode = CharRange & {
  type: "phrase";
  posTag: string;
  children: (WordNode | PhraseNode)[];
};

const EMPTY_POS = "NONE";
const EMPTY_PHRASE = (): PhraseNode => ({
  type: "phrase",
  posTag: EMPTY_POS,
  start: -1,
  end: -1,
  children: [],
});
type State = "OPENING" | "POS_TAG" | "WORDS" | "CLOSING";

class Stack<T> {
  private stack: T[] = [];

  public push(item: T) {
    this.stack.push(item);
  }

  public pop(): T | undefined {
    return this.stack.pop();
  }

  public peek(): T | undefined {
    return this.stack[this.stack.length - 1];
  }

  public get length() {
    return this.stack.length;
  }
}

export const buildTree = (tokens: Token[]): (WordNode | PhraseNode)[] => {
  const root: PhraseNode = EMPTY_PHRASE();
  const stack = new Stack<PhraseNode>();
  stack.push(root);

  let state: State = "CLOSING";
  for (const token of tokens) {
    if (state === "OPENING") {
      if (token.type !== "text") {
        throw new TreeParsingError(
          token,
          "Expected part of speech tag. A phrase always starts with a part of speech tag."
        );
      }

      const current = stack.peek()!;
      current.posTag = token.raw;
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
        const next = EMPTY_PHRASE();
        next.start = token.start;
        stack.push(next);
        state = "OPENING";
      }

      if (token.type === "text") {
        const current = stack.peek()!;
        current.children.push({
          type: "word",
          word: token.raw,
          start: token.start,
          end: token.end,
        });
        state = "WORDS";
      }

      continue;
    }

    if (token.type === "opening-bracket") {
      const next = EMPTY_PHRASE();
      next.start = token.start;
      stack.push(next);
      state = "OPENING";
    }

    if (token.type === "text") {
      const current = stack.peek()!;
      current.children.push({
        type: "word",
        word: token.raw,
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

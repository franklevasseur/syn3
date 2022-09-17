import { TreeParsingError } from "./errors";
import { Stack } from "./stack";
import { Token } from "./tokenizer";

// Top-down tree

export type CharRange = { start: number; end: number };
export type TopDownWordNode = CharRange & {
  type: "word";
  depth: number;
  word: string;
};
export type TopDownPhraseNode = CharRange & {
  type: "phrase";
  depth: number;
  posTag: string;
  children: TopDownTreeNode[];
};
export type TopDownTreeNode = TopDownWordNode | TopDownPhraseNode;

const EMPTY_TOP_DOWN_PHRASE = (): TopDownPhraseNode => ({
  type: "phrase",
  posTag: "NONE",
  depth: -1,
  start: -1,
  end: -1,
  children: [],
});

type TopDownTreeState = "OPENING" | "POS_TAG" | "WORDS" | "CLOSING";
export const buildTopDownTree = (tokens: Token[]): TopDownTreeNode[] => {
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
          word: token.raw,
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

// Bottom-up tree

export type BottomUpWordNode = CharRange & {
  type: "word";
  floor: number;
  word: string;
  parent: BottomUpPhraseNode;
};
export type BottomUpPhraseNode = CharRange & {
  type: "phrase";
  floor: number;
  posTag: string;
  parent: BottomUpPhraseNode | undefined;
};

type BottomUpTreeState = { leafs: BottomUpWordNode[] };

const reversePhrase = (
  state: BottomUpTreeState,
  tdnode: TopDownPhraseNode
): {
  state: BottomUpTreeState;
  node: BottomUpPhraseNode;
} => {
  const { children, depth, ...node } = tdnode;
  const reversed: BottomUpPhraseNode = {
    ...node,
    floor: -1,
    parent: undefined,
  };
  const newState: BottomUpTreeState = { leafs: [...state.leafs] };
  for (const tdchild of children) {
    if (tdchild.type === "word") {
      const { depth, ...child } = tdchild;
      const reversedChild: BottomUpWordNode = {
        ...child,
        floor: 0,
        parent: reversed,
      };
      reversed.floor = Math.max(reversed.floor, 1);
      newState.leafs.push(reversedChild);
    } else {
      const { node: reversedChild, state: childState } = reversePhrase(
        state,
        tdchild
      );
      reversedChild.parent = reversed;
      reversed.floor = Math.max(reversed.floor, reversedChild.floor + 1);
      newState.leafs.push(...childState.leafs);
    }
  }
  return { node: reversed, state: newState };
};

export const reverseTree = (tree: TopDownTreeNode[]): BottomUpWordNode[] => {
  const root: TopDownPhraseNode = EMPTY_TOP_DOWN_PHRASE();
  root.children = [...tree];
  const { state } = reversePhrase({ leafs: [] }, root);
  return state.leafs;
};

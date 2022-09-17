import { CharRange } from "../typings";
import { TopDownPhraseNode, TopDownTreeNode } from "./top-down";
import { POSNode } from "./typings";

export type BottomUpWordNode = CharRange & {
  type: "word";
  floor: number;
  text: string;
  parent: BottomUpPhraseNode | undefined;
};
export type BottomUpPhraseNode = CharRange & {
  type: "phrase";
  floor: number;
  posTag: POSNode;
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
  const reversed: BottomUpPhraseNode = {
    start: tdnode.start,
    end: tdnode.end,
    type: "phrase",
    posTag: tdnode.posTag,
    floor: -1,
    parent: undefined,
  };

  const newState: BottomUpTreeState = { leafs: [...state.leafs] };
  for (const tdchild of tdnode.children) {
    if (tdchild.type === "word") {
      const reversedChild: BottomUpWordNode = {
        start: tdchild.start,
        end: tdchild.end,
        type: "word",
        text: tdchild.text,
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
  const state: BottomUpTreeState = { leafs: [] };
  for (const tdnode of tree) {
    if (tdnode.type === "word") {
      const reversedChild: BottomUpWordNode = {
        start: tdnode.start,
        end: tdnode.end,
        type: "word",
        text: tdnode.text,
        floor: 0,
        parent: undefined,
      };
      state.leafs.push(reversedChild);
    } else {
      const { node: reversedChild, state: childState } = reversePhrase(
        state,
        tdnode
      );
      reversedChild.parent = undefined;
      state.leafs.push(...childState.leafs);
    }
  }
  return state.leafs;
};

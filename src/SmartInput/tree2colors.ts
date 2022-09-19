import _ from "lodash";
import { tree } from "../parser";

type ColorsState = {
  coloredNodes: tree.bottomup.BottomUpPhraseNode[];
  colors: ColoredText[];
};

type ColoredText = {
  start: number;
  end: number;
  color: number | undefined;
};

const phraseToColor = (
  state: ColorsState,
  t: tree.bottomup.BottomUpPhraseNode
): ColorsState => {
  if (state.coloredNodes.includes(t)) {
    return state;
  }

  let opening: ColoredText = {
    start: t.start,
    end: t.start + 1,
    color: t.floor,
  };
  let closing: ColoredText = { start: t.end - 1, end: t.end, color: t.floor };
  let pos: ColoredText = {
    start: t.posTag.start,
    end: t.posTag.end,
    color: t.floor,
  };

  let newState: ColorsState = {
    coloredNodes: [...state.coloredNodes, t],
    colors: [...state.colors, opening, closing, pos],
  };
  if (t.parent) {
    newState = phraseToColor(newState, t.parent);
  }
  return newState;
};

export const treeToColor = (
  t: tree.bottomup.BottomUpTree,
  code: string
): ColoredText[] => {
  let state: ColorsState = { coloredNodes: [], colors: [] };

  for (const w of t) {
    if (!w.parent) {
      continue;
    }
    state = phraseToColor(state, w.parent);
  }

  const coloredTokens = _.sortBy(state.colors, (c) => c.start);

  const allTokens: ColoredText[] = [];
  let cursor = 0;
  for (const c of coloredTokens) {
    if (c.start > cursor) {
      allTokens.push({
        start: cursor,
        end: c.start,
        color: undefined,
      });
    }
    allTokens.push(c);
    cursor = c.end;
  }

  if (cursor < code.length) {
    allTokens.push({
      start: cursor,
      end: code.length,
      color: undefined,
    });
  }

  return allTokens;
};

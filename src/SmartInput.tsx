import "./SmartInput.css";
import { useState, useMemo } from "react";
import _ from "lodash";
import { parse, tree } from "./parser";

type SmartInputProps = {
  initialValue: string;
  onChange: (value: tree.bottomup.BottomUpWordNode[]) => void;
};

type ColoredText = {
  start: number;
  end: number;
  color: number;
};

type ColorsState = {
  coloredNodes: tree.bottomup.BottomUpPhraseNode[];
  colors: ColoredText[];
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

const treeToColor = (t: tree.bottomup.BottomUpWordNode[]): ColoredText[] => {
  let state: ColorsState = { coloredNodes: [], colors: [] };
  t.forEach((w) => {
    if (!w.parent) {
      return;
    }
    state = phraseToColor(state, w.parent);
  });
  return _.sortBy(state.colors, (c) => c.start);
};

export const SmartInput = (props: SmartInputProps) => {
  const [value, setValue] = useState(props.initialValue);
  const onChange = useMemo<(v: string) => void>(
    () =>
      _.debounce((v: string) => {
        const { bottomUpTree: tree } = parse(v);
        const colors = treeToColor(tree);
        console.log({ colors });
        props.onChange(tree);
      }, 3000),
    [props]
  );

  return (
    <input
      type="text"
      className="smart-input-box"
      value={value}
      onChange={(e) => {
        const newValue = e.target.value;
        setValue(newValue);
        onChange(newValue);
      }}
    />
  );
};

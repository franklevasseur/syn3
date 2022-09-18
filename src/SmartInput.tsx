import "./SmartInput.css";
import { useState, useMemo } from "react";
import _ from "lodash";
import { parse, tree } from "./parser";
import * as draft from "draft-js";

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
  const [editorState, setEditorState] = useState(() =>
    draft.EditorState.createWithContent(
      draft.ContentState.createFromText(props.initialValue)
    )
  );

  const onChange = useMemo<(v: string) => void>(
    () =>
      _.debounce((v: string) => {
        const { bottomUpTree: tree } = parse(v);
        const colors = treeToColor(tree);
        console.log(colors);
        props.onChange(tree);
      }, 3000),
    [props]
  );

  return (
    <draft.Editor
      editorState={editorState}
      onChange={(newState) => {
        onChange(newState.getCurrentContent().getPlainText());
        setEditorState(newState);
      }}
    />
  );
};

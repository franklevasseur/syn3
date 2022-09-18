import "./index.css";
import { useState, useMemo } from "react";
import _ from "lodash";
import { parse, tree } from "../parser";
import * as draft from "draft-js";
import { treeToColor } from "./tree2colors";

type SmartInputProps = {
  initialValue: string;
  onChange: (value: tree.bottomup.BottomUpWordNode[]) => void;
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
        const colors = treeToColor(tree, v);
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

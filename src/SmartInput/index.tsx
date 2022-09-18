import "./index.css";
import { useState } from "react";
import * as draft from "draft-js";
import { ColorDecorator } from "./color-decorator";

type SmartInputProps = {
  initialValue: string;
  onChange: (value: string) => void;
};

const createDecorator = () => new ColorDecorator();

export const SmartInput = (props: SmartInputProps) => {
  const [editorState, setEditorState] = useState(() =>
    draft.EditorState.createWithContent(
      draft.ContentState.createFromText(props.initialValue),
      createDecorator()
    )
  );

  return (
    <draft.Editor
      editorState={editorState}
      onChange={(newState) => {
        const text = newState.getCurrentContent().getPlainText();
        props.onChange(text);
        setEditorState(newState);
      }}
    />
  );
};

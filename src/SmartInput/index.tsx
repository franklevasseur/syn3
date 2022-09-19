import "./index.css";
import { useState } from "react";
import * as draft from "draft-js";
import { TreeDecorator, TreeEvent } from "./tree-decorator";
import { TreeParsingError } from "../parser/errors";

type SmartInputProps = {
  initialValue: string;
  onChange: (tree: TreeEvent) => void;
};

export const SmartInput = (props: SmartInputProps) => {
  const [parsingError, setParsingError] = useState<TreeParsingError | null>(
    null
  );
  const [editorState, setEditorState] = useState(() =>
    draft.EditorState.createWithContent(
      draft.ContentState.createFromText(props.initialValue),
      new TreeDecorator([
        (e) => {
          if (e.type === "error") {
            setParsingError(e.err);
          }

          if (e.type === "parse") {
            setParsingError(null);
          }
          props.onChange(e);
        },
      ])
    )
  );

  return (
    <div className={`editor-root ${parsingError ? "editor-error" : ""}`}>
      <draft.Editor
        editorState={editorState}
        ariaMultiline={true}
        onChange={(newState) => {
          setEditorState(newState);
        }}
        handleReturn={() => "handled"}
      />
    </div>
  );
};

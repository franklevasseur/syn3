import "./index.css";
import { useState } from "react";
import { parse, tree } from "../parser";
import * as draft from "draft-js";
import { treeToColor } from "./tree2colors";
import { SimpleDecorator, SimpleDecoratorDefinition } from "./simple-decorator";

type SmartInputProps = {
  initialValue: string;
  onChange: (value: tree.bottomup.BottomUpWordNode[]) => void;
};

class ColorDecorator implements SimpleDecoratorDefinition {
  public strategy = (
    block: draft.ContentBlock,
    callback: (
      start: number,
      end: number,
      props: { color: number | undefined }
    ) => void
  ) => {
    const text = block.getText();
    const { bottomUpTree: tree } = parse(text);
    const colors = treeToColor(tree, text);
    for (const span of colors) {
      // if (span.color === undefined) {
      //   continue;
      // }
      callback(span.start, span.end, { color: span.color });
    }
  };

  public component = (props: any) => {
    if (props.color === undefined) {
      return <span>{props.children}</span>;
    }
    const color = this.getColor(props.color);
    return <span style={{ color }}>{props.children}</span>;
  };

  private getColor = (n: number) => {
    const colors = ["orange", "yellow", "green", "blue", "indigo", "violet"];
    return colors[n % colors.length];
  };
}

const createDecorator = () => new SimpleDecorator(new ColorDecorator());

export const SmartInput = (props: SmartInputProps) => {
  const [editorState, setEditorState] = useState(() =>
    draft.EditorState.createWithContent(
      draft.ContentState.createFromText(props.initialValue),
      createDecorator()
    )
  );

  // const onChange = useMemo<(v: string) => void>(
  //   () =>
  //     _.debounce((v: string) => {
  //       const { bottomUpTree: tree } = parse(v);
  //       const colors = treeToColor(tree, v);
  //       console.log(colors);
  //       props.onChange(tree);
  //     }, 3000),
  //   [props]
  // );

  return (
    <draft.Editor
      editorState={editorState}
      onChange={(newState) => {
        // onChange(newState.getCurrentContent().getPlainText());
        setEditorState(newState);
      }}
    />
  );
};

// forked from https://github.com/Soreine/draft-js-simpledecorator/blob/master/index.js
import * as draft from "draft-js";
import * as Immutable from "immutable";
import { parse, tree } from "../parser";
import { TreeParsingError } from "../parser/errors";
import { treeToColor } from "./tree2colors";

import { Tooltip2 } from "@blueprintjs/popover2";

const KEY_SEPARATOR = "▁";

type TreeProps =
  | {
      type: "brackets";
      color: number | undefined;
    }
  | { type: "error"; message: string };

type ComponentProps = {
  children: React.ReactNode;
};

export type TreeEvent =
  | { type: "error"; err: TreeParsingError; text: string }
  | {
      type: "parse";
      bottomUp: tree.bottomup.BottomUpTree;
      topDown: tree.topdown.TopDownTree;
      text: string;
    };
export type TreeListener = (e: TreeEvent) => void;

export class TreeDecorator implements draft.DraftDecoratorType {
  private decorated: Record<string, TreeProps[]> = {};

  constructor(private _listeners: TreeListener[] = []) {}

  public getDecorations(
    block: draft.ContentBlock,
    contentState: draft.ContentState
  ) {
    const blockText = block.getText();
    const decorations: (string | null)[] = Array(blockText.length).fill(null);
    const blockKey = block.getKey();

    let key;
    let decorationId = 0;
    this.decorated[blockKey] = [];

    // Apply a decoration to given range, with given props
    this._strategy(block, (start: number, end: number, props: TreeProps) => {
      key = blockKey + KEY_SEPARATOR + decorationId;
      this.decorated[blockKey][decorationId] = props;
      this._decorateRange(decorations, start, end, key);
      decorationId++;
    });

    return Immutable.List(decorations as string[]);
  }

  public getComponentForKey(key: string) {
    return this._component;
  }

  public getPropsForKey(key: string) {
    let parts = key.split(KEY_SEPARATOR);
    let blockKey = parts[0];
    let decorationId = parseInt(parts[1]);
    return this.decorated[blockKey][decorationId];
  }

  private _decorateRange = (
    decorationsArray: (string | null)[],
    start: number,
    end: number,
    key: string
  ) => {
    for (let ii = start; ii < end; ii++) {
      decorationsArray[ii] = key;
    }
  };

  private _strategy = (
    block: draft.ContentBlock,
    callback: (start: number, end: number, props: TreeProps) => void
  ) => {
    const text = block.getText();
    try {
      const { bottomUpTree: bottomUp, topDownTree: topDown } = parse(text);
      this._emitEvent({ type: "parse", bottomUp, topDown, text });
      const colors = treeToColor(bottomUp, text);
      for (const span of colors) {
        if (span.color === undefined) {
          continue;
        }
        callback(span.start, span.end, { type: "brackets", color: span.color });
      }
    } catch (thrown) {
      const err = thrown instanceof Error ? thrown : new Error(`${thrown}`);
      if (err instanceof TreeParsingError) {
        this._emitEvent({ type: "error", err, text });
        callback(err.range.start, err.range.end, {
          type: "error",
          message: err.message,
        });
        return;
      }
      console.log(err);
    }
  };

  private _component = (props: TreeProps & ComponentProps) => {
    if (props.type === "error") {
      return (
        <Tooltip2 content={props.message} position="bottom" intent="danger">
          <span
            style={{
              textDecoration: "underline red 4px",
              textDecorationSkipInk: "none",
            }}
          >
            {props.children}
          </span>
        </Tooltip2>
      );
    }

    if (props.color === undefined) {
      return <span>{props.children}</span>;
    }

    const color = this._getColor(props.color);
    return <span style={{ color }}>{props.children}</span>;
  };

  private _getColor = (n: number) => {
    const colors = [
      "#AF00DB", // purple
      "#D16969", // light red
      "#CD9731", // yellowish
      "#008000", // green
      "#316BCD", // light blue
      "#0000FF", // dark blue
    ];
    return colors[n % colors.length];
  };

  private _emitEvent = (e: TreeEvent) => {
    for (const listener of this._listeners) {
      listener(e);
    }
  };
}

// forked from https://github.com/Soreine/draft-js-simpledecorator/blob/master/index.js
import * as draft from "draft-js";
import * as Immutable from "immutable";

const KEY_SEPARATOR = "-";

export type SimpleDecoratorStrategy = (
  block: draft.ContentBlock,
  callback: (start: number, end: number, props: any) => void,
  contentState: draft.ContentState
) => void;

export type SimpleDecoratorDefinition = {
  strategy: SimpleDecoratorStrategy;
  component: Function;
};

export class SimpleDecorator implements draft.DraftDecoratorType {
  private decorated: Record<string, number[]> = {};
  private strategy: SimpleDecoratorStrategy;
  private getComponent: Function;

  constructor(innerDecorator: SimpleDecoratorDefinition) {
    this.strategy = innerDecorator.strategy;
    this.getComponent = innerDecorator.component;
  }

  public getDecorations(
    block: draft.ContentBlock,
    contentState: draft.ContentState
  ) {
    let decorations: (string | null)[] = Array(block.getText().length).fill(
      null
    );

    // Apply a decoration to given range, with given props
    const callback = (start: number, end: number, props: any) => {
      if (props === undefined) {
        props = {};
      }

      key = blockKey + KEY_SEPARATOR + decorationId;
      decorated[blockKey][decorationId] = props;
      this.decorateRange(decorations, start, end, key);
      decorationId++;
    };

    let blockKey = block.getKey();
    let key;
    let decorationId = 0;
    let decorated = this.decorated;
    decorated[blockKey] = [];

    this.strategy(block, callback, contentState);

    return Immutable.List(decorations.filter((x): x is string => x !== null));
  }

  public getComponentForKey(key: string) {
    return this.getComponent;
  }

  public getPropsForKey(key: string) {
    let parts = key.split(KEY_SEPARATOR);
    let blockKey = parts[0];
    let decorationId = parseInt(parts[1]);
    return this.decorated[blockKey][decorationId];
  }

  private decorateRange = (
    decorationsArray: (string | null)[],
    start: number,
    end: number,
    key: string
  ) => {
    for (let ii = start; ii < end; ii++) {
      decorationsArray[ii] = key;
    }
  };
}

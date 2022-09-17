import { CharRange } from "./tree";

export class TreeParsingError extends Error {
  constructor(public readonly range: CharRange, message: string) {
    super(`(${range.start}, ${range.end}), ${message}`);
  }
}

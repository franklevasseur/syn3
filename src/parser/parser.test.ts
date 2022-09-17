import { TreeParsingError } from "./errors";

const expectError = (fn: () => void, err: TreeParsingError) => {
  try {
    fn();
  } catch (e) {
    expect(e).toEqual(err);
  }
};

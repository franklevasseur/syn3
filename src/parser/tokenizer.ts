import _ from "lodash";

export type TokenType =
  | "opening-bracket"
  | "closing-bracket"
  | "white-space"
  | "text";
export type CharRange = { start: number; end: number; raw: string };
export type Token = CharRange & { type: TokenType };
export type ExtractionResult = { extracted: Token[]; remaining: CharRange[] };

// unescaped opening square bracket
const OPENING_BRACKET_REGX = /(?<!\\)\[/g;
const CLOSING_BRACKET_REGX = /(?<!\\)\]/g;
const WHITE_SPACE_REGX = /\s+/g;

const sortRanges = <R extends CharRange>(ranges: R[]) =>
  _.sortBy(ranges, (u: CharRange) => u.start);

const computeRemaining = (
  original: CharRange,
  extracted: CharRange[]
): CharRange[] => {
  const remaining: CharRange[] = [];

  const offset = original.start;

  let cursor = offset;
  for (const e of sortRanges(extracted)) {
    if (cursor !== e.start) {
      remaining.push({
        raw: original.raw.slice(cursor - offset, e.start - offset),
        start: cursor,
        end: e.start,
      });
    }
    cursor = e.end;
  }

  if (cursor !== original.end) {
    remaining.push({
      raw: original.raw.slice(cursor - offset, original.end - offset),
      start: cursor,
      end: original.end,
    });
  }

  return remaining;
};

const extractSingleUnit = (
  unit: CharRange,
  type: TokenType,
  regx: () => RegExp
): ExtractionResult => {
  const matcher = regx();

  const extracted: Token[] = [];

  let match = matcher.exec(unit.raw);
  while (match) {
    const raw = match[0];
    extracted.push({
      raw,
      type,
      start: unit.start + match.index,
      end: unit.start + match.index + raw.length,
    });
    match = matcher.exec(unit.raw);
  }

  const remaining = computeRemaining(unit, extracted);
  return { extracted, remaining };
};

const extractRegex = (
  units: CharRange[],
  tokType: TokenType,
  regx: () => RegExp
): ExtractionResult => {
  let extracted: Token[] = [];
  let remaining: CharRange[] = [];

  for (const u of units) {
    const { extracted: singleExtraction, remaining: singleRemaining } =
      extractSingleUnit(u, tokType, regx);
    extracted.push(...singleExtraction);
    remaining.push(...singleRemaining);
  }

  extracted = sortRanges(extracted);
  remaining = sortRanges(remaining);
  return { extracted, remaining };
};

export const tokenize = (input: string): Token[] => {
  const initial = [{ raw: input, start: 0, end: input.length }];
  const {
    extracted: extractedOpeningBrackets,
    remaining: remainingOpeningBrackets,
  } = extractRegex(initial, "opening-bracket", () => OPENING_BRACKET_REGX);

  const {
    extracted: extractedClosingBrackets,
    remaining: remainingClosingBrackets,
  } = extractRegex(
    remainingOpeningBrackets,
    "closing-bracket",
    () => CLOSING_BRACKET_REGX
  );

  const { extracted: extractedWhiteSpaces, remaining: remainingWhiteSpaces } =
    extractRegex(
      remainingClosingBrackets,
      "white-space",
      () => WHITE_SPACE_REGX
    );

  const words: Token[] = remainingWhiteSpaces.map((u) => ({
    type: "text",
    ...u,
  }));

  return sortRanges([
    ...extractedOpeningBrackets,
    ...extractedClosingBrackets,
    ...extractedWhiteSpaces,
    ...words,
  ]);
};

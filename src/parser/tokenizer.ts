import _ from "lodash";
import { CharRange } from "./typings";

export type TokenType =
  | "opening-bracket"
  | "closing-bracket"
  | "white-space"
  | "text";
export type RawToken = CharRange & { raw: string };
export type Token = RawToken & { type: TokenType };
export type ExtractionResult = { extracted: Token[]; remaining: RawToken[] };

// unescaped opening square bracket
const OPENING_BRACKET_REGX = /(?<!\\)\[/g;
const CLOSING_BRACKET_REGX = /(?<!\\)\]/g;
const WHITE_SPACE_REGX = /\s+/g;

const sortRanges = <R extends RawToken>(ranges: R[]) =>
  _.sortBy(ranges, (u: RawToken) => u.start);

const computeRemaining = (
  original: RawToken,
  extracted: RawToken[]
): RawToken[] => {
  const remaining: RawToken[] = [];

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
  unit: RawToken,
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
  units: RawToken[],
  tokType: TokenType,
  regx: () => RegExp
): ExtractionResult => {
  let extracted: Token[] = [];
  let remaining: RawToken[] = [];

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

import { tokenize } from './tokenizer'
import { buildTopDownTree, reverseTree } from './tree'

export * as tree from './tree'

export const parse = (input: string) => {
  const tokens = tokenize(input)
  const topDownTree = buildTopDownTree(tokens)
  const bottomUpTree = reverseTree(topDownTree)
  return { topDownTree, bottomUpTree }
}

import { tokenize } from './tokenizer'
import { buildTree } from './tree'

export * as tree from './tree'

export const parse = (input: string) => {
  const tokens = tokenize(input)
  const tree = buildTree(tokens)
  return { tree }
}

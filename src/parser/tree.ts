import { Stack } from '../stack'
import { TreeParsingError } from './errors'
import { Token } from './tokenizer'
import { CharRange, POSNode } from './typings'

export type WordNode = CharRange & {
  type: 'word'
  depth: number
  text: string
}
export type PhraseNode = CharRange & {
  type: 'phrase'
  depth: number
  posTag: POSNode
  children: TreeNode[]
}
export type TreeNode = WordNode | PhraseNode
export type Tree = TreeNode[]

const EMPTY_PHRASE = (): PhraseNode => ({
  type: 'phrase',
  posTag: { text: 'NONE', start: -1, end: -1 },
  depth: -1,
  start: -1,
  end: -1,
  children: [],
})

type TreeState = 'OPENING' | 'POS_TAG' | 'WORDS' | 'CLOSING'
export const buildTree = (tokens: Token[]): Tree => {
  const root: PhraseNode = EMPTY_PHRASE()
  const stack = new Stack<PhraseNode>()
  stack.push(root)

  let state: TreeState = 'CLOSING'
  for (const token of tokens) {
    if (state === 'OPENING') {
      if (token.type !== 'text') {
        throw new TreeParsingError(token, 'Expected part of speech tag. A phrase always starts with a part of speech tag.')
      }

      const current = stack.peek()!
      current.posTag = { start: token.start, end: token.end, text: token.raw }
      state = 'POS_TAG'
      continue
    }

    if (state === 'POS_TAG') {
      if (token.type === 'closing-bracket') {
        throw new TreeParsingError(token, 'Expected at least a word. A phrase must have at least one word.')
      }

      if (token.type === 'opening-bracket') {
        const next = EMPTY_PHRASE()
        next.start = token.start
        next.depth = stack.length - 1
        stack.push(next)
        state = 'OPENING'
      }

      if (token.type === 'text') {
        const current = stack.peek()!
        current.children.push({
          type: 'word',
          depth: current.depth + 1,
          text: token.raw,
          start: token.start,
          end: token.end,
        })
        state = 'WORDS'
      }

      continue
    }

    // state === "WORDS" || state === "CLOSING"

    if (token.type === 'opening-bracket') {
      const next = EMPTY_PHRASE()
      next.start = token.start
      next.depth = stack.length - 1
      stack.push(next)
      state = 'OPENING'
    }

    if (token.type === 'text') {
      const current = stack.peek()!
      current.children.push({
        type: 'word',
        depth: current.depth + 1,
        text: token.raw,
        start: token.start,
        end: token.end,
      })
      state = 'WORDS'
    }

    if (token.type === 'closing-bracket') {
      const current = stack.pop()!
      const parent = stack.peek()
      if (!parent) {
        throw new TreeParsingError(token, 'Unexpected closing bracket. There is no corresponding opening bracket.')
      }

      parent.children.push(current)
      current.end = token.end
      state = 'CLOSING'
    }
  }

  if (stack.length > 1) {
    throw new TreeParsingError(tokens[tokens.length - 1], 'Unexpected end of input. There are unclosed brackets.')
  }

  return root.children
}

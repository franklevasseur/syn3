import _ from 'lodash'
import { Stack } from '../stack'

type ColoredText = {
  start: number
  end: number
  color: number | undefined
}

type HighlightState = {
  charIdx: number
  current: ColoredText | undefined
  nextColor: number
  stack: Stack<StackElement>
  coloredText: ColoredText[]
}

type StackElement = {
  color: number
}

const OPENING = '['
const CLOSING = ']'
const N_COLORS = 6

const handleChar = (state: HighlightState, char: string): HighlightState => {
  const { charIdx: i, stack, coloredText, nextColor } = state

  const current = state.current ?? { start: i, end: i, color: undefined }
  if (char === OPENING) {
    current.end = i
    coloredText.push(current)

    const color = nextColor
    coloredText.push({ start: i, end: i + 1, color })
    stack.push({ color })

    return { ...state, charIdx: i + 1, current: undefined, stack, coloredText, nextColor: (nextColor + 1) % N_COLORS }
  }

  if (char === CLOSING) {
    current.end = i
    coloredText.push(current)
    const head = stack.pop()

    if (!head) {
      return { ...state, charIdx: i + 1, current: undefined, stack, coloredText }
    }

    const { color } = head
    coloredText.push({ start: i, end: i + 1, color })
    return { ...state, charIdx: i + 1, current: undefined, stack, coloredText }
  }

  return { ...state, charIdx: i + 1 }
}

export const highlightSyntax = (text: string): ColoredText[] => {
  const stack = new Stack<StackElement>()

  const coloredText: ColoredText[] = []
  const first: ColoredText = { start: 0, end: 0, color: 0 }

  const initialState: HighlightState = { charIdx: 0, current: first, stack, coloredText, nextColor: 0 }
  let state = initialState
  while (state.charIdx < text.length) {
    const currentChar = text[state.charIdx]
    state = handleChar(state, currentChar)
  }

  if (state.current) {
    state.coloredText.push(state.current)
  }

  return state.coloredText
}

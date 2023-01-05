import _ from 'lodash'
import { Stack } from '../stack'

type ColoredText = {
  start: number
  end: number
  color: number | undefined
}

type StackElement = {
  color: number
}

const OPENING = /^\[[^\s]*/
const CLOSING = /^\]/

export const highlightSyntax = (text: string): ColoredText[] => {
  const stack = new Stack<StackElement>()

  const coloredText: ColoredText[] = []

  let cursor = 0
  let nextColor = 0

  for (let i = 0; i < text.length; ) {
    const remaining = text.slice(i)

    const openingMatch = OPENING.exec(remaining)
    if (openingMatch) {
      const color = nextColor
      nextColor++

      const matchLength = openingMatch[0].length

      coloredText.push({ start: cursor, end: i + 1, color: undefined })
      cursor = i
      coloredText.push({ start: cursor, end: cursor + matchLength, color })
      cursor += matchLength

      stack.push({ color })

      i += matchLength
      continue
    }

    const closingMatch = CLOSING.exec(remaining)
    if (closingMatch) {
      const el = stack.pop()
      if (!el) {
        i++
        continue
      }
      const { color } = el

      const matchLength = closingMatch[0].length
      coloredText.push({ start: cursor, end: i + 1, color: undefined })
      cursor = i
      coloredText.push({ start: cursor, end: cursor + matchLength, color })
      cursor += matchLength

      i += matchLength
      continue
    }

    i++
  }

  return coloredText
}

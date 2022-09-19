import './index.css'
import * as draft from 'draft-js'
import { useState } from 'react'
import { TreeParsingError } from '../parser/errors'
import { TreeDecorator, TreeEvent } from './tree-decorator'

type OnChangeEvent = {
  tree: TreeEvent
}

type SmartInputProps = {
  initialValue: string
  onChange: (e: OnChangeEvent) => void
}

export const SmartInput = (props: SmartInputProps) => {
  const [parsingError, setParsingError] = useState<TreeParsingError | null>(null)
  const [editorState, setEditorState] = useState(() =>
    draft.EditorState.createWithContent(
      draft.ContentState.createFromText(props.initialValue),
      new TreeDecorator([
        (tree) => {
          if (tree.type === 'error') {
            setParsingError(tree.err)
          }

          if (tree.type === 'parse') {
            setParsingError(null)
          }

          props.onChange({ tree })
        },
      ]),
    ),
  )

  return (
    <div className={`editor-root ${parsingError ? 'editor-error' : ''}`}>
      <draft.Editor
        editorState={editorState}
        ariaMultiline={true}
        onChange={(newState) => {
          setEditorState(newState)
        }}
        handleReturn={() => 'handled'}
      />
    </div>
  )
}

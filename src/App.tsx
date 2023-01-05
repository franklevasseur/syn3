import { useState } from 'react'
import './App.css'
import { tree } from './parser'
import { SmartInput } from './SmartInput'
import { TreeView } from './TreeView'

const DEFAULT_INITIAL_VALUE =
  "[ST [SN Luc] [T' [T \\[présent,3sg\\]] [SV [V' [SN se] [V demande]] [SC [SP où] [C' [C :phi:] [ST [SN il] [T' [T \\[présent,3sg\\]] [SV [V' [V a mis] [SN [Det le] [N' [N chat.]]]]]]]]]]]]"

const getQueryText = (): string | null => {
  const url = new URL(window.location.toString())
  return url.searchParams.get('text')
}

const setQueryText = (text: string | null) => {
  const url = new URL(window.location.toString())
  if (text !== null) {
    url.searchParams.set('text', text || '')
  }
  window.history.pushState({}, '', url.toString())
}

const App = () => {
  const [tree, setTree] = useState<tree.Tree | undefined>(undefined)

  const initialValue = getQueryText() || DEFAULT_INITIAL_VALUE

  return (
    <div className="App">
      <div className="title-box">
        <div className="title-text">Syn3</div>
      </div>
      <div className="editor-box">
        <SmartInput
          initialValue={initialValue}
          onChange={({ tree }) => {
            if (tree.type === 'parse') {
              setTree(tree.tree)
            }
            if (tree.type === 'error') {
              setTree(undefined)
            }

            setQueryText(tree.text)
          }}
        />
        {tree && <TreeView tree={tree} />}
      </div>
    </div>
  )
}

export default App

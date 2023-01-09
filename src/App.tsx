import { useState } from 'react'
import './App.css'
import { tree } from './parser'
import { SmartInput } from './SmartInput'
import { TreeView } from './TreeView'

const DEFAULT_INITIAL_VALUE =
  "[ST [SN Luc] [T' [T \\[présent,3sg\\]] [SV [V' [SN se] [V demande]] [SC [SP où] [C' [C :phi:] [ST [SN il] [T' [T \\[présent,3sg\\]] [SV [V' [V a mis] [SN [Det le] [N' [N chat.]]]]]]]]]]]]"

const INLINE_STYLE = `<
/* Tree */
.rd3t-tree-container {
  width: 100%;
  height: 100%;
}

.rd3t-grabbable {
  cursor: move; /* fallback if grab cursor is unsupported */
  cursor: grab;
  cursor: -moz-grab;
  cursor: -webkit-grab;
}
.rd3t-grabbable:active {
    cursor: grabbing;
    cursor: -moz-grabbing;
    cursor: -webkit-grabbing;
}

/* Node */
.rd3t-node {
  cursor: pointer;
  fill: #777;
  stroke: #000;
  stroke-width: 2;
}

.rd3t-leaf-node {
  cursor: pointer;
  fill: transparent;
  stroke: #000;
  stroke-width: 1;
}

.rd3t-label__title {
  fill: #000;
  stroke: none;
  font-weight: bolder;
}

.rd3t-label__attributes {
  fill: #777;
  stroke: none;
  font-weight: bolder;
  font-size: smaller;
}

/* Link */
.rd3t-link {
  fill: none;
  stroke: #000;
}

<style>
.node {
  cursor: default;
}

.node > circle {
  fill: gray;
  r: 3px;
  cursor: default;
}

.node .node__label {
  font-size: 1.5rem;
}

.leaf_link {
  stroke-opacity: 0.25;
  /* stroke-dasharray: 5; */
}

.no_link {
  display: none;
}
</style>`

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

const download = (dataurl: string, filename: string) => {
  const link = document.createElement('a')
  link.href = dataurl
  link.download = filename
  link.click()
}

const App = () => {
  const [tree, setTree] = useState<tree.Tree | undefined>(undefined)

  const initialValue = getQueryText() || DEFAULT_INITIAL_VALUE

  return (
    <div className="App">
      <div className="title-box">
        <div className="title-text">Syn3</div>
        <button
          onClick={async () => {
            // Get svg element
            const svgs = document.getElementsByClassName('rd3t-svg')
            const svg = svgs.length ? svgs[0] : undefined
            if (!svg) {
              return
            }

            const styleNode = document.createElement('style')
            styleNode.innerHTML = INLINE_STYLE
            svg.appendChild(styleNode)

            const serializer = new XMLSerializer()

            let source = serializer.serializeToString(svg)
            if (!source.match(/^<svg[^>]*?\sxmlns=(['"`])https?\:\/\/www\.w3\.org\/2000\/svg\1/)) {
              source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"')
            }
            if (!source.match(/^<svg[^>]*?\sxmlns:xlink=(['"`])http\:\/\/www\.w3\.org\/1999\/xlink\1/)) {
              source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"')
            }
            source = '<?xml version="1.0" standalone="no"?>\r\n' + source
            const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source)
            download(url, 'tree.svg')

            // const node = d3.select('svg').attr('title', 'test2').attr('version', 1.1).attr('xmlns', 'http://www.w3.org/2000/svg').node()
            // const html = (node as any).outerHTML
            // const blob = new Blob([html], { type: 'image/svg+xml' })

            // const blobURL = window.URL.createObjectURL(blob)
            // download(blobURL, 'tree2.svg')
          }}
        >
          LOL
        </button>
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

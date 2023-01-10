import './TreeView.css'
import { useState } from 'react'
import Tree from 'react-d3-tree'
import { CustomNodeElementProps, Orientation, RawNodeDatum, TreeLinkDatum } from 'react-d3-tree/lib/types/common'
import { MdCenterFocusStrong } from 'react-icons/md'
import { tree } from './parser'

type TreeViewProps = {
  tree: tree.Tree
  reset: () => void
}

type RenderHook = {
  pattern: RegExp
  render: string
}

type Point = { x: number; y: number }
type Circle = Point & { radius: number }
type Rectangle = Point & {
  width: number
  height: number
}

type TreePOsition = {
  bounding: Rectangle
  rootNode: Circle
}

const rectEquals = (a: Rectangle, b: Rectangle) => a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height

const SPACING_FACTOR = 0.9
const POS_DELTA_Y = -40
const LEAF_UNIQ_DELTA_Y = -135
const LEAF_SIBLINGS_DELTA_Y = 0
const NODE_X = (text: string) => -text.length * 6
const NODE_WIDTH = (text: string) => text.length * 20
const NODE_HEIGHT = 150

const ESCAPED_OPEN_BRACKET: RenderHook = { pattern: /\\\[/g, render: '[' }
const ESCAPED_CLOSE_BRACKET: RenderHook = { pattern: /\\\]/g, render: ']' }
const PHI: RenderHook = { pattern: /:phi:/g, render: 'ϕ' }
const WHITE_SPACE: RenderHook = { pattern: /:white:/g, render: ' ' }

const renderHooks: RenderHook[] = [ESCAPED_OPEN_BRACKET, ESCAPED_CLOSE_BRACKET, PHI, WHITE_SPACE]
const renderText = (text: string) =>
  renderHooks.reduce((acc, hook) => {
    return acc.replace(hook.pattern, hook.render)
  }, text)

const toD3Node = (node: tree.TreeNode): RawNodeDatum => {
  if (node.type === 'word') {
    return {
      name: renderText(node.text),
    }
  }

  return {
    name: renderText(node.posTag.text),
    children: node.children.map(toD3Node),
  }
}

const toD3Tree = (tree: tree.Tree): RawNodeDatum[] => {
  return tree.map(toD3Node)
}

const renderNode = ({ nodeDatum, hierarchyPointNode }: CustomNodeElementProps) => {
  const isLeaf = !nodeDatum.children?.length
  const sibblings = hierarchyPointNode.parent?.children ?? []

  const x = NODE_X(nodeDatum.name)
  let y: number
  if (!isLeaf) {
    y = POS_DELTA_Y
  } else if (sibblings.length > 1) {
    y = LEAF_SIBLINGS_DELTA_Y
  } else {
    y = LEAF_UNIQ_DELTA_Y
  }

  const width = NODE_WIDTH(nodeDatum.name)
  const height = NODE_HEIGHT

  const svgProps: React.SVGProps<SVGForeignObjectElement> = {
    x,
    y,
    width,
    height,
  }

  return (
    <g className="node">
      {!isLeaf && <circle></circle>}
      <foreignObject {...svgProps}>{<div className="node__label">{nodeDatum.name}</div>}</foreignObject>
    </g>
  )
}

const funcPath = (linkDatum: TreeLinkDatum, orientation: Orientation) => {
  const { source, target } = linkDatum
  const isLeaf = !target.children?.length
  const deltaY = isLeaf ? LEAF_SIBLINGS_DELTA_Y : 0
  return orientation === 'horizontal'
    ? `M${source.y},${source.x}L${target.y},${target.x}`
    : `M${source.x},${source.y}L${target.x},${target.y + deltaY}`
}

const linkClass = ({ source, target }: TreeLinkDatum, orientation: Orientation): string => {
  const isLeaf = !target.children?.length
  if (!isLeaf) {
    return ''
  }

  const siblings = source.children ?? []
  const onlyChild = siblings.length <= 1
  return onlyChild ? 'no_link' : 'leaf_link'
}

const getTreePosition = (): TreePOsition | undefined => {
  const fullTree = document.querySelector<SVGGElement>('.rd3t-g')
  if (!fullTree) {
    return
  }

  const rootNode = document.querySelector<SVGCircleElement>('.node__root circle')
  if (!rootNode) {
    return
  }

  const { x, y, width } = rootNode.getBoundingClientRect()
  return { bounding: fullTree.getBoundingClientRect(), rootNode: { x, y, radius: width / 2 } }
}

export const TreeView = (props: TreeViewProps) => {
  const [box, setBox] = useState<Rectangle | null>(null)

  const [scale, setScale] = useState<number>(1)
  const [translation, setTranslation] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  const [initialRender, setInitialRender] = useState<boolean>(true)

  const scaling = (l1: number, l2: number) => (SPACING_FACTOR * l2) / l1

  const treePosition = getTreePosition()

  if (box && treePosition && initialRender) {
    const { bounding: treeRect, rootNode } = treePosition

    const widthScaling = scaling(treeRect.width, box.width)
    const heightScaling = scaling(treeRect.height, box.height)
    const newScale = Math.min(widthScaling, heightScaling, 1)

    let x = (box.width - treeRect.width * newScale) / 2
    let y = (box.height - treeRect.height * newScale) / 2

    const rootNodeXOffset = (rootNode.x - treeRect.x) * newScale
    x += rootNodeXOffset

    const rootNodeYOffset = (rootNode.y - treeRect.y) * newScale
    y += rootNodeYOffset

    setScale(newScale)
    setTranslation({ x, y })
    setInitialRender(false)
  }

  return (
    <div
      id="treeWrapper"
      ref={(x) => {
        if (!x) {
          return
        }
        const rect = x.getBoundingClientRect()
        if (box && rectEquals(rect, box)) {
          return
        }
        setBox(rect)
      }}
    >
      <div
        style={{ position: 'absolute', right: '5px', top: '2px', border: 'solid 1px', borderRadius: '5px', cursor: 'pointer' }}
        onClick={props.reset}
      >
        <MdCenterFocusStrong size={30} />
      </div>
      <Tree
        data={toD3Tree(props.tree)}
        orientation="vertical"
        collapsible={false}
        translate={translation}
        zoom={scale}
        rootNodeClassName="node__root"
        branchNodeClassName="node__branch"
        leafNodeClassName="node__leaf"
        separation={{ siblings: 1, nonSiblings: 1 }}
        renderCustomNodeElement={renderNode}
        pathFunc={funcPath}
        pathClassFunc={linkClass}
      />
    </div>
  )
}

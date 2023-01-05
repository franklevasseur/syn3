import './TreeView.css'
import { useState } from 'react'
import Tree from 'react-d3-tree'
import { CustomNodeElementProps, Orientation, RawNodeDatum, TreeLinkDatum } from 'react-d3-tree/lib/types/common'
import { tree } from './parser'

type TreeViewProps = {
  tree: tree.Tree
}

const POS_DELTA_Y = -40
const LEAF_UNIQ_DELTA_Y = -135
const LEAF_SIBLINGS_DELTA_Y = 0
const NODE_X = (text: string) => -text.length * 6
const NODE_WIDTH = (text: string) => text.length * 20
const NODE_HEIGHT = 150

const toD3Node = (node: tree.TreeNode): RawNodeDatum => {
  if (node.type === 'word') {
    return {
      name: node.text,
    }
  }

  return {
    name: node.posTag.text,
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

export const TreeView = (props: TreeViewProps) => {
  const [x, setX] = useState<HTMLDivElement | null>(null)
  const { width, height } = x?.getBoundingClientRect() ?? { width: 0, height: 0 }
  return (
    <div id="treeWrapper" ref={(x) => setX(x)}>
      <Tree
        data={toD3Tree(props.tree)}
        orientation="vertical"
        collapsible={false}
        translate={{ x: width / 2, y: height / 8 }}
        zoom={0.75}
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

import './TreeView.css'
import { useState } from 'react'
import Tree from 'react-d3-tree'
import { CustomNodeElementProps, RawNodeDatum } from 'react-d3-tree/lib/types/common'
import { tree } from './parser'

type TreeViewProps = {
  tree: tree.topdown.TopDownTree
}

const toD3Node = (node: tree.topdown.TopDownTreeNode): RawNodeDatum => {
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

const toD3Tree = (tree: tree.topdown.TopDownTree): RawNodeDatum[] => {
  return tree.map(toD3Node)
}

const renderForeignObjectNode = ({ nodeDatum }: CustomNodeElementProps) => {
  const isLeaf = !nodeDatum.children?.length

  const x = -nodeDatum.name.length * 6
  const y = isLeaf ? 5 : -40

  const width = nodeDatum.name.length * 15
  const height = 30

  const svgProps: React.SVGProps<SVGForeignObjectElement> = {
    x,
    y,
    width,
    height,
  }

  const className = isLeaf ? 'node__leaf' : 'node__branch'
  return (
    <g className={className}>
      <circle></circle>
      <foreignObject {...svgProps}>{<div className="node__label">{nodeDatum.name}</div>}</foreignObject>
    </g>
  )
}

export const TreeView = (props: TreeViewProps) => {
  const [x, setX] = useState<HTMLDivElement | null>(null)
  const { width, height } = x?.getBoundingClientRect() ?? { width: 0, height: 0 }
  return (
    <div id="treeWrapper" ref={(x) => setX(x)}>
      <Tree
        data={toD3Tree(props.tree)}
        orientation="vertical"
        pathFunc="straight"
        collapsible={false}
        translate={{ x: width / 2, y: height / 8 }}
        zoom={0.75}
        rootNodeClassName="node__root"
        branchNodeClassName="node__branch"
        leafNodeClassName="node__leaf"
        separation={{ siblings: 1, nonSiblings: 1 }}
        renderCustomNodeElement={(rd3tProps: CustomNodeElementProps) => renderForeignObjectNode({ ...rd3tProps })}
      />
    </div>
  )
}

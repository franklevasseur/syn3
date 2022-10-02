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

  if (node.children.length === 1 && node.children[0].type === 'word') {
    return {
      name: node.posTag.text,
      attributes: {
        word: node.children[0].text,
      },
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
  let word = nodeDatum.attributes?.word

  const posX = -nodeDatum.name.length * 6
  const posY = -40

  const posWidth = nodeDatum.name.length * 20
  const posHeight = 150

  const posSvgProps: React.SVGProps<SVGForeignObjectElement> = {
    x: posX,
    y: posY,
    width: posWidth,
    height: posHeight,
  }

  if (word) {
    word = `${word}`
    const wordX = -word.length * 6
    const wordY = 5

    const wordWidth = word.length * 20
    const wordHeight = 150

    const wordSvgProps: React.SVGProps<SVGForeignObjectElement> = {
      x: wordX,
      y: wordY,
      width: wordWidth,
      height: wordHeight,
    }

    return (
      <g className="node">
        <circle></circle>
        <foreignObject {...posSvgProps}>{<div className="node__label">{nodeDatum.name}</div>}</foreignObject>
        <foreignObject {...wordSvgProps}>{<div className="node__label">{word}</div>}</foreignObject>
      </g>
    )
  }

  return (
    <g className="node">
      <circle></circle>
      <foreignObject {...posSvgProps}>{<div className="node__label">{nodeDatum.name}</div>}</foreignObject>
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
        pathClassFunc={(link, orientation) => {
          console.log('pathClassFunc!')
          return ''
        }}
      />
    </div>
  )
}

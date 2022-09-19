import './TreeView.css'
import Tree from 'react-d3-tree'
import { RawNodeDatum } from 'react-d3-tree/lib/types/common'
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

export const TreeView = (props: TreeViewProps) => {
  return (
    <div id="treeWrapper">
      <Tree
        data={toD3Tree(props.tree)}
        orientation="vertical"
        pathFunc="straight"
        collapsible={false}
        translate={{ x: 650, y: 150 }}
        zoom={0.75}
        rootNodeClassName="node__root"
        branchNodeClassName="node__branch"
        leafNodeClassName="node__leaf"
      />
    </div>
  )
}

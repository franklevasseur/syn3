import { useState } from "react";
import "./App.css";
import { tree } from "./parser";
import { SmartInput } from "./SmartInput";
import { TreeView } from "./TreeView";

const INITIAL_VALUE =
  "[P [Sn [det mon] [nom chien]] [Sv [v mange] [Sn [det des] [n croquettes]] [Sprep [prep sans] [nom viande]] [Sadv [adv lentement]]]]";

function App() {
  const [tree, setTree] = useState<tree.topdown.TopDownTree | undefined>(
    undefined
  );

  return (
    <div className="App">
      <div className="title-box">
        <div className="title-text">Syn3</div>
      </div>
      <div className="editor-box">
        <SmartInput
          initialValue={INITIAL_VALUE}
          onChange={(tree) => {
            if (tree.type === "parse") {
              setTree(tree.topDown);
            }
            if (tree.type === "error") {
              setTree(undefined);
            }
          }}
        />
        {tree && <TreeView tree={tree} />}
      </div>
    </div>
  );
}

export default App;

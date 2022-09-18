import React from "react";
import "./App.css";
import { TreeParsingError } from "./parser/errors";
import { SmartInput } from "./SmartInput";

const INITIAL_VALUE =
  "[P [Sn [det mon] [nom chien]] [Sv [v mange] [Sn [det des] [n croquettes]] [Sprep [prep sans] [nom viande]] [Sadv [adv lentement]]]]";

function App() {
  const [parsingError, setParsingError] =
    React.useState<TreeParsingError | null>(null);

  return (
    <div className="App">
      <SmartInput
        initialValue={INITIAL_VALUE}
        onChange={(tree) => {
          if (tree.type === "error") {
            setParsingError(tree.err);
          }

          if (tree.type === "parse") {
            setParsingError(null);
          }
        }}
      />
      {parsingError && (
        <div className="error-message">{parsingError.message}</div>
      )}
    </div>
  );
}

export default App;

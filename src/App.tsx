import "./App.css";
import { SmartInput } from "./SmartInput";

const INITIAL_VALUE =
  "[P [Sn [det mon] [nom chien]] [Sv [v mange] [Sn [det des] [n croquettes]] [Sprep [prep sans] [nom viande]] [Sadv [adv lentement]]]]";

function App() {
  return (
    <div className="App">
      <SmartInput
        initialValue={INITIAL_VALUE}
        onChange={(tree) => {
          console.log(tree);
        }}
      />
    </div>
  );
}

export default App;

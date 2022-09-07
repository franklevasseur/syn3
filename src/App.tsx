import "./App.css";
import { parse } from "./parser";
import { SmartInput } from "./SmartInput";

function App() {
  return (
    <div className="App">
      <SmartInput
        initialValue="mon chien mange des croquettes sans viande lentement"
        onChange={(text: string) => {
          const ast = parse(text);
          console.log(ast);
        }}
      />
    </div>
  );
}

export default App;

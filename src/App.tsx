import "./App.css";
import { SmartInput } from "./SmartInput";

function App() {
  return (
    <div className="App">
      <SmartInput
        initialValue="mon chien mange des croquettes sans viande lentement"
        onChange={(tree) => {
          console.log(tree);
        }}
      />
    </div>
  );
}

export default App;

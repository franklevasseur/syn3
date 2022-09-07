import "./SmartInput.css";
import { useState } from "react";

type SmartInputProps = {
  initialValue: string;
  onChange: (value: string) => void;
};

export const SmartInput = (props: SmartInputProps) => {
  const [value, setValue] = useState(props.initialValue);
  return (
    <input
      type="text"
      className="smart-input-box"
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        props.onChange(e.target.value);
      }}
    />
  );
};

import "./SmartInput.css";
import { useState, useMemo } from "react";
import _ from "lodash";

type SmartInputProps = {
  initialValue: string;
  onChange: (value: string) => void;
};

export const SmartInput = (props: SmartInputProps) => {
  const [value, setValue] = useState(props.initialValue);
  const onChange = useMemo<(v: string) => void>(
    () => _.debounce((v: string) => props.onChange(v), 3000),
    [props]
  );

  return (
    <input
      type="text"
      className="smart-input-box"
      value={value}
      onChange={(e) => {
        const newValue = e.target.value;
        setValue(newValue);
        onChange(newValue);
      }}
    />
  );
};

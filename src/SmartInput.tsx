import "./SmartInput.css";
import { useState, useMemo } from "react";
import _ from "lodash";

type SmartInputProps = {
  initialValue: string;
  onChange: (value: string) => void;
};

export const SmartInput = (props: SmartInputProps) => {
  const [value, setValue] = useState(props.initialValue);
  const onChange = useMemo<() => void>(
    () => _.debounce(() => props.onChange(value), 3000),
    [props.onChange]
  );

  return (
    <input
      type="text"
      className="smart-input-box"
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        onChange();
      }}
    />
  );
};

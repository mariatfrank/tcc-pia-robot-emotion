import { useState } from "react";
import { PasswordToggle } from "./PasswordToggle";

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
};

export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="password-input-wrap">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
        />
        <PasswordToggle visible={visible} onToggle={() => setVisible((x) => !x)} />
      </div>
    </div>
  );
}

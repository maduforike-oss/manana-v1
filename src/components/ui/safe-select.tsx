import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useState, useMemo } from "react";

type Option = { value: string | number | null | undefined; label: string };

interface Props {
  options: Option[];                 // may contain null/empty values from API
  placeholder?: string;
  value?: string;                    // controlled value (optional). Use "" to show placeholder.
  onChange?: (v: string) => void;
  defaultValue?: string;             // for uncontrolled usage
}

export function SafeSelect({
  options,
  placeholder = "Select…",
  value,
  onChange,
  defaultValue
}: Props) {
  // Sanitize options: remove null/empty, coerce to string, trim
  const cleanOptions = useMemo(
    () =>
      (options ?? [])
        .map(o => o && { value: String(o.value ?? "").trim(), label: o.label })
        .filter(o => o && o.value.length > 0),
    [options]
  );

  // If uncontrolled, manage internal state (empty string = show placeholder)
  const [local, setLocal] = useState<string>(defaultValue ?? "");

  const val = value ?? local;
  const handleChange = (v: string) => {
    if (onChange) onChange(v);
    else setLocal(v);
  };

  return (
    <Select value={val} onValueChange={handleChange}>
      <SelectTrigger className="w-full bg-background">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-background border border-border shadow-lg z-50">
        {cleanOptions.map(opt => (
          <SelectItem 
            key={opt.value} 
            value={opt.value}
            className="hover:bg-muted focus:bg-muted"
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
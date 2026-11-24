/** Props for {@link Choice}. */
export interface ChoiceProps<T extends string> {
  label: string
  value: T
  options: readonly T[]
  onChange: (value: T) => void
}

/** A labelled drop-down list of options, each shown as its value. */
export function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: ChoiceProps<T>) {
  return (
    <label>
      {label}{" "}
      {/* The list offers only the options, so the value is one of them. */}
      <select value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  )
}

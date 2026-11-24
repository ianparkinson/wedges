/** Props for {@link Choice}. */
export interface ChoiceProps {
  label: string
  value: string
  options: readonly string[]
  onChange: (value: string) => void
}

/** A labelled drop-down list of options, each shown as its value. */
export function Choice({ label, value, options, onChange }: ChoiceProps) {
  return (
    <label>
      {label}{" "}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  )
}

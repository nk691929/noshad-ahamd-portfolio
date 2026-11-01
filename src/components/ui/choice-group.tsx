/**
 * Purpose: accessible single-choice group shown as pills (native radio inputs, visually hidden, so keyboard and
 * screen readers work). Inputs: name, legend, options (plain strings), selected value, error text.
 * Used by: contact-form.tsx.
 */
type Props = {
  name: string;
  legend: string;
  options: readonly string[];
  defaultValue?: string | undefined;
  error?: string | undefined;
  optional?: boolean;
};

export function ChoiceGroup({
  name,
  legend,
  options,
  defaultValue,
  error,
  optional = false,
}: Props) {
  return (
    <fieldset
      className="flex flex-col gap-2"
      aria-describedby={error ? `${name}-error` : undefined}
    >
      <legend className="mb-2 text-sm text-fg-muted">
        {legend}
        {optional ? " (optional)" : ""}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option}
              defaultChecked={defaultValue === option}
              className="peer sr-only"
            />
            <span className="inline-flex rounded-full border border-border px-4 py-2 text-sm text-fg-muted transition-colors peer-checked:border-transparent peer-checked:bg-fg peer-checked:text-bg peer-focus-visible:ring-2 peer-focus-visible:ring-accent hover:text-fg">
              {option}
            </span>
          </label>
        ))}
      </div>
      {error ? (
        <p id={`${name}-error`} className="text-sm text-accent">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

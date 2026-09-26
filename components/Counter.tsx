interface CounterProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function Counter({ value, onChange, min = 1, max = 99 }: CounterProps) {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-12 h-12 rounded-lg bg-surface-secondary border border-border hover:border-primary disabled:opacity-30 flex items-center justify-center text-2xl font-bold"
      >
        −
      </button>
      <div className="text-3xl font-bold text-text w-16 text-center">{value}</div>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-12 h-12 rounded-lg bg-surface-secondary border border-border hover:border-primary disabled:opacity-30 flex items-center justify-center text-2xl font-bold"
      >
        +
      </button>
    </div>
  );
}

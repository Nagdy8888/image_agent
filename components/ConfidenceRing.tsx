"use client";

interface ConfidenceRingProps {
  /** 0–100, or null if not available */
  confidence: number | null;
  size?: number;
}

export default function ConfidenceRing({ confidence, size = 80 }: ConfidenceRingProps) {
  const value = confidence != null ? Math.min(100, Math.max(0, confidence)) : null;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = value != null ? circumference - (value / 100) * circumference : circumference;

  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-slate-600/50"
          />
          {value != null && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="currentColor"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="text-indigo-400 transition-all duration-700"
            />
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-slate-200">
            {value != null ? `${Math.round(value)}%` : "—"}
          </span>
        </div>
      </div>
      <span className="text-xs font-medium text-slate-400">Confidence</span>
    </div>
  );
}

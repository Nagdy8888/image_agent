"use client";

import type { FlaggedTag } from "@/lib/types";

interface FlaggedTagsProps {
  flagged: FlaggedTag[];
}

export default function FlaggedTags({ flagged }: FlaggedTagsProps) {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-amber-200">
        Flagged tags ({flagged.length})
      </h3>
      {flagged.length ? (
        <ul className="flex flex-wrap gap-2">
          {flagged.map(({ category, value, confidence, reason }, i) => (
            <li
              key={`${category}-${value}-${i}`}
              className="rounded-md bg-amber-500/20 px-2 py-1 text-xs font-medium text-amber-100"
              title={reason === "low_confidence" ? "Below confidence threshold" : "Not in taxonomy"}
            >
              [{category}] {value.replace(/_/g, " ")} — {Math.round(confidence * 100)}% ({reason.replace(/_/g, " ")})
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-slate-400">No flagged tags.</p>
      )}
    </div>
  );
}

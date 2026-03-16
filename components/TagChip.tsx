"use client";

import { motion } from "framer-motion";

interface TagChipProps {
  tag: string;
  confidence?: number;
  accentClass?: string;
  index?: number;
}

function getBarColor(pct: number | null): string {
  if (pct == null) return "";
  if (pct >= 70) return "bg-emerald-500";
  if (pct >= 50) return "bg-amber-500";
  return "bg-red-500/80";
}

export default function TagChip({ tag, confidence, accentClass = "bg-amber-500/20", index = 0 }: TagChipProps) {
  const pct = confidence != null ? Math.round(confidence * 100) : null;
  const barColor = getBarColor(pct);

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      title={pct != null ? `${tag.replace(/_/g, " ")} — ${pct}% confidence` : tag.replace(/_/g, " ")}
      className={`relative inline-block max-w-[11rem] overflow-hidden rounded-md px-2 py-1 text-xs font-medium ${accentClass}`}
    >
      <span className="relative z-10 truncate">{tag.replace(/_/g, " ")}</span>
      {pct != null && (
        <span
          className={`absolute bottom-0 left-0 z-0 h-0.5 rounded-full ${barColor}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      )}
    </motion.span>
  );
}

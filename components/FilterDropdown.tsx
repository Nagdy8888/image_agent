"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X } from "lucide-react";
import type { TaxonomyCategory } from "@/lib/types";

const CATEGORY_ACCENT: Record<string, string> = {
  season: "border-l-amber-500/70 bg-amber-500/5",
  theme: "border-l-violet-500/70 bg-violet-500/5",
  objects: "border-l-emerald-500/70 bg-emerald-500/5",
  dominant_colors: "border-l-rose-500/70 bg-rose-500/5",
  design_elements: "border-l-cyan-500/70 bg-cyan-500/5",
  occasion: "border-l-orange-500/70 bg-orange-500/5",
  mood: "border-l-pink-500/70 bg-pink-500/5",
  product_type: "border-l-teal-500/70 bg-teal-500/5",
};

const CHIP_ACCENT: Record<string, string> = {
  season: "bg-amber-500/20 hover:bg-amber-500/30 border-amber-400/40",
  theme: "bg-violet-500/20 hover:bg-violet-500/30 border-violet-400/40",
  objects: "bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-400/40",
  dominant_colors: "bg-rose-500/20 hover:bg-rose-500/30 border-rose-400/40",
  design_elements: "bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-400/40",
  occasion: "bg-orange-500/20 hover:bg-orange-500/30 border-orange-400/40",
  mood: "bg-pink-500/20 hover:bg-pink-500/30 border-pink-400/40",
  product_type: "bg-teal-500/20 hover:bg-teal-500/30 border-teal-400/40",
};

function formatLabel(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface FilterDropdownProps {
  category: string;
  taxonomyCategory: TaxonomyCategory;
  availableValues: string[];
  selectedValues: string[];
  onToggle: (value: string) => void;
}

export default function FilterDropdown({
  category,
  taxonomyCategory,
  availableValues,
  selectedValues,
  onToggle,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(true);
  const accent = CATEGORY_ACCENT[category] ?? "border-l-slate-500/70 bg-slate-500/5";
  const chipAccent = CHIP_ACCENT[category] ?? "bg-slate-500/20 border-slate-400/40";
  const label = formatLabel(category);

  const availableSet = new Set(availableValues.map((v) => v.toLowerCase()));
  const selectedSet = new Set(selectedValues.map((v) => v.toLowerCase()));
  const hasResults = (value: string) => availableSet.has(value.toLowerCase());

  const renderChip = (value: string) => {
    const isSelected = selectedSet.has(value.toLowerCase());
    const inResults = hasResults(value);
    return (
      <button
        key={value}
        type="button"
        onClick={() => onToggle(value)}
        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${chipAccent} ${
          isSelected ? "ring-1 ring-offset-1 ring-offset-slate-900 ring-white/40" : inResults ? "opacity-90" : "opacity-60"
        }`}
        title={inResults ? undefined : "No images with this tag yet"}
      >
        <span>{formatLabel(value)}</span>
        {isSelected && <X className="h-3 w-3" />}
      </button>
    );
  };

  return (
    <div className={`rounded-lg border border-slate-600/50 border-l-4 ${accent}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-semibold text-slate-200"
      >
        {label}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 px-3 pb-3 pt-0">
              {taxonomyCategory.type === "flat" && (
                <div className="flex flex-wrap gap-1.5">
                  {taxonomyCategory.values.map((v) => renderChip(v))}
                </div>
              )}
              {taxonomyCategory.type === "hierarchical" && (
                <div className="space-y-2">
                  {Object.entries(taxonomyCategory.groups).map(([parent, children]) => (
                    <div key={parent}>
                      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                        {formatLabel(parent)}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {renderChip(parent)}
                        {children.map((c) => renderChip(c))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

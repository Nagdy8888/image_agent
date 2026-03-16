"use client";

import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import TagChip from "./TagChip";

const CATEGORY_STYLES: Record<string, { accent: string; icon?: React.ComponentType<{ className?: string }> }> = {
  season: { accent: "bg-amber-500/20 border-amber-400/40 text-amber-100", icon: Calendar },
  theme: { accent: "bg-violet-500/20 border-violet-400/40 text-violet-100" },
  objects: { accent: "bg-emerald-500/20 border-emerald-400/40 text-emerald-100" },
  dominant_colors: { accent: "bg-rose-500/20 border-rose-400/40 text-rose-100" },
  design_elements: { accent: "bg-cyan-500/20 border-cyan-400/40 text-cyan-100" },
  occasion: { accent: "bg-orange-500/20 border-orange-400/40 text-orange-100" },
  mood: { accent: "bg-pink-500/20 border-pink-400/40 text-pink-100" },
  product_type: { accent: "bg-teal-500/20 border-teal-400/40 text-teal-100" },
};

interface TagCategoryCardProps {
  category: string;
  tags: string[];
  confidenceScores: Record<string, number>;
}

export default function TagCategoryCard({ category, tags, confidenceScores }: TagCategoryCardProps) {
  const style = CATEGORY_STYLES[category.toLowerCase()] ?? {
    accent: "bg-slate-500/20 border-slate-400/40 text-slate-200",
  };
  const label = category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const Icon = style.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-xl border p-4 ${style.accent}`}
    >
      <div className="mb-2 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 opacity-90" />}
        <h3 className="text-sm font-semibold uppercase tracking-wide opacity-90">{label}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.length ? (
          tags.map((tag, i) => (
            <TagChip
              key={tag}
              tag={tag}
              confidence={confidenceScores[tag]}
              accentClass={`${style.accent} bg-black/10`}
              index={i}
            />
          ))
        ) : (
          <span className="text-xs opacity-60">No tags</span>
        )}
      </div>
    </motion.div>
  );
}

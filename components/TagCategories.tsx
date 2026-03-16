"use client";

import { CATEGORY_ORDER, type CategoryTags } from "@/lib/visionMapper";

const CATEGORY_STYLES: Record<string, string> = {
  Season: "bg-amber-500/20 border-amber-400/40 text-amber-100",
  Theme: "bg-violet-500/20 border-violet-400/40 text-violet-100",
  Objects: "bg-teal-500/20 border-teal-400/40 text-teal-100",
  Colors: "bg-red-500/20 border-red-400/40 text-red-100",
  Design: "bg-rose-500/20 border-rose-400/40 text-rose-100",
  Occasion: "bg-sky-500/20 border-sky-400/40 text-sky-100",
  Mood: "bg-purple-500/20 border-purple-400/40 text-purple-100",
  Product: "bg-emerald-500/20 border-emerald-400/40 text-emerald-100",
};

interface TagCategoriesProps {
  categoryTags: CategoryTags;
}

export default function TagCategories({ categoryTags }: TagCategoriesProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {CATEGORY_ORDER.map((label) => {
        const tags = categoryTags[label] ?? [];
        const style = CATEGORY_STYLES[label] ?? "bg-slate-500/20 border-slate-400/40 text-slate-200";
        return (
          <div
            key={label}
            className={`min-w-0 overflow-hidden rounded-xl border p-3 ${style}`}
          >
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-90">
              {label}
            </h3>
            <div className="flex min-w-0 flex-wrap gap-1.5 overflow-hidden">
              {tags.length ? (
                tags.map((tag) => (
                  <span
                    key={tag}
                    title={tag.replace(/_/g, " ")}
                    className="inline-block max-w-[11rem] truncate rounded-md bg-black/20 px-2 py-0.5 text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-xs opacity-60">—</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import TagCategoryCard from "./TagCategoryCard";
import { API_BASE_URL } from "@/lib/constants";
import type { TagRecord, TagImageItem } from "@/lib/types";

function tagsFromRecord(record: TagRecord): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const key of ["season", "theme", "design_elements", "occasion", "mood"] as const) {
    const arr = record[key];
    out[key] = Array.isArray(arr) ? arr.map(String) : [];
  }
  const objList = record.objects;
  out.objects = Array.isArray(objList)
    ? objList.map((o) => (o?.child ? `${o.parent ?? ""} / ${o.child}` : String(o?.parent ?? "")).trim()).filter(Boolean)
    : [];
  const colorList = record.dominant_colors;
  out.dominant_colors = Array.isArray(colorList)
    ? colorList.map((o) => (o?.child ? `${o.parent ?? ""} / ${o.child}` : String(o?.parent ?? "")).trim()).filter(Boolean)
    : [];
  const pt = record.product_type;
  out.product_type =
    pt && typeof pt === "object" && (pt.parent || pt.child)
      ? [`${pt.parent ?? ""} / ${pt.child ?? ""}`.trim()]
      : [];
  return out;
}

const CATEGORY_ORDER = [
  "season",
  "theme",
  "objects",
  "dominant_colors",
  "design_elements",
  "occasion",
  "mood",
  "product_type",
] as const;

interface DetailModalProps {
  item: TagImageItem | null;
  onClose: () => void;
}

export default function DetailModal({ item, onClose }: DetailModalProps) {
  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, onClose]);

  const imageUrl = item?.image_url
    ? item.image_url.startsWith("http")
      ? item.image_url
      : `${API_BASE_URL}${item.image_url}`
    : null;

  const byCategory = item?.tag_record ? tagsFromRecord(item.tag_record) : {};

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl border border-slate-600/50 shadow-2xl"
          >
            <div className="flex justify-end border-b border-slate-600/50 p-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded p-1.5 text-slate-400 hover:bg-slate-600/50 hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[85vh] overflow-y-auto p-4">
              <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
                <div className="space-y-2">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt=""
                      className="w-full rounded-lg object-contain shadow-lg"
                    />
                  ) : (
                    <div className="flex aspect-square items-center justify-center rounded-lg bg-slate-800/50 text-slate-500">
                      No image
                    </div>
                  )}
                  <p className="truncate text-xs text-slate-500">{item.image_id}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {CATEGORY_ORDER.map((cat) => (
                    <TagCategoryCard
                      key={cat}
                      category={cat}
                      tags={byCategory[cat] ?? []}
                      confidenceScores={{}}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

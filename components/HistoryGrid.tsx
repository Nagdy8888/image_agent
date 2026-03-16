"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "@/lib/constants";
import type { TagImageItem, TagRecord } from "@/lib/types";

function topTagsFromRecord(record: TagRecord, max: number = 3): string[] {
  const tags: string[] = [];
  for (const key of ["season", "theme", "mood", "occasion"] as const) {
    const arr = record[key];
    if (Array.isArray(arr) && arr.length) tags.push(String(arr[0]).replace(/_/g, " "));
    if (tags.length >= max) break;
  }
  if (tags.length < max && record.objects?.length) {
    tags.push(record.objects[0]?.child?.replace(/_/g, " ") ?? "");
  }
  return tags.slice(0, max);
}

interface HistoryGridProps {
  refetchTrigger?: unknown; // Change to refetch when e.g. new save
}

export default function HistoryGrid({ refetchTrigger }: HistoryGridProps) {
  const [items, setItems] = useState<TagImageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`${API_BASE_URL}/api/tag-images?limit=24`)
      .then((res) => res.json())
      .then((data: { items?: TagImageItem[] }) => {
        if (!cancelled && Array.isArray(data.items)) setItems(data.items);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refetchTrigger]);

  if (loading) {
    return (
      <p className="text-sm text-slate-500">Loading history…</p>
    );
  }
  if (!items.length) {
    return (
      <p className="text-sm text-slate-500">No tagged images yet. Upload and analyze an image to see it here.</p>
    );
  }

  const thumbUrl = (item: TagImageItem) => {
    const url = item.image_url;
    if (!url) return null;
    return url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {items.map((item, i) => (
        <motion.div
          key={item.image_id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          className="glass rounded-xl border border-slate-600/40 overflow-hidden"
        >
          <div className="aspect-square bg-slate-800/50 relative">
            {thumbUrl(item) ? (
              <img
                src={thumbUrl(item)!}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-500 text-xs">
                No preview
              </div>
            )}
            <span
              className={`absolute right-2 top-2 rounded px-2 py-0.5 text-xs font-medium ${
                item.processing_status === "complete"
                  ? "bg-emerald-500/80 text-white"
                  : item.processing_status === "needs_review"
                    ? "bg-amber-500/80 text-white"
                    : "bg-slate-600/80 text-slate-200"
              }`}
            >
              {item.processing_status}
            </span>
          </div>
          <div className="p-2">
            <div className="flex flex-wrap gap-1">
              {topTagsFromRecord(item.tag_record).map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-slate-600/50 px-1.5 py-0.5 text-xs text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

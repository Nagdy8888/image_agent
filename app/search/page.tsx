"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Filter, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import FilterDropdown from "@/components/FilterDropdown";
import DetailModal from "@/components/DetailModal";
import { API_BASE_URL } from "@/lib/constants";
import type {
  TagImageItem,
  TaxonomyResponse,
  AvailableFilters,
  SearchFilters,
  TaxonomyCategory,
} from "@/lib/types";

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

function buildQueryParams(filters: SearchFilters): string {
  const params = new URLSearchParams();
  for (const cat of CATEGORY_ORDER) {
    const vals = filters[cat];
    if (Array.isArray(vals) && vals.length) params.set(cat, vals.join(","));
  }
  return params.toString();
}

function topTagsFromRecord(record: TagImageItem["tag_record"], max: number = 5): string[] {
  const tags: string[] = [];
  for (const key of ["season", "theme", "mood", "occasion"] as const) {
    const arr = record[key];
    if (Array.isArray(arr)) for (const v of arr.slice(0, 2)) tags.push(String(v).replace(/_/g, " "));
    if (tags.length >= max) return tags.slice(0, max);
  }
  if (record.objects?.length)
    record.objects.slice(0, 2).forEach((o) => tags.push((o?.child ?? o?.parent ?? "").replace(/_/g, " ")));
  return tags.filter(Boolean).slice(0, max);
}

export default function SearchPage() {
  const [taxonomy, setTaxonomy] = useState<TaxonomyResponse | null>(null);
  const [availableFilters, setAvailableFilters] = useState<AvailableFilters>({});
  const [filters, setFilters] = useState<SearchFilters>({});
  const [items, setItems] = useState<TagImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<TagImageItem | null>(null);

  const fetchSearch = useCallback(
    async (filterParams: SearchFilters) => {
      const q = buildQueryParams(filterParams);
      const searchUrl = q ? `${API_BASE_URL}/api/search-images?${q}&limit=50&offset=0` : `${API_BASE_URL}/api/search-images?limit=50&offset=0`;
      const availUrl = q ? `${API_BASE_URL}/api/available-filters?${q}` : `${API_BASE_URL}/api/available-filters`;
      const [searchRes, availRes] = await Promise.all([fetch(searchUrl), fetch(availUrl)]);
      const searchData = await searchRes.json();
      const availData = await availRes.json();
      if (Array.isArray(searchData.items)) setItems(searchData.items);
      if (availData && typeof availData === "object") setAvailableFilters(availData);
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE_URL}/api/taxonomy`)
      .then((r) => r.json())
      .then((data: TaxonomyResponse) => {
        if (!cancelled) setTaxonomy(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchSearch(filters).finally(() => setLoading(false));
  }, [filters, fetchSearch]);

  const toggleFilter = useCallback((category: string, value: string) => {
    setFilters((prev) => {
      const list = prev[category] ?? [];
      const next = [...list];
      const i = next.map((v) => v.toLowerCase()).indexOf(value.toLowerCase());
      if (i >= 0) next.splice(i, 1);
      else next.push(value);
      const out = { ...prev };
      if (next.length) out[category] = next;
      else delete out[category];
      return out;
    });
  }, []);

  const clearAllFilters = useCallback(() => setFilters({}), []);

  const activePills: { category: string; value: string }[] = [];
  CATEGORY_ORDER.forEach((cat) => {
    (filters[cat] ?? []).forEach((v) => activePills.push({ category: cat, value: v }));
  });

  const thumbUrl = (item: TagImageItem) => {
    const url = item.image_url;
    if (!url) return null;
    return url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
  };

  return (
    <div className="min-h-screen bg-[var(--background)] bg-pattern">
      <Navbar />
      <header className="border-b border-slate-700/50 bg-slate-900/80 px-4 py-3 md:px-6">
        <h1 className="text-xl font-semibold text-slate-200">Search by Tags</h1>
      </header>

      <div className="flex">
        {/* Sidebar - desktop always visible, mobile drawer */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-[min(320px,85vw)] border-r border-slate-700/50 bg-slate-900/95 backdrop-blur-xl transition-transform md:static md:block md:w-[30%] md:min-w-[280px] md:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-12 items-center justify-between border-b border-slate-700/50 px-3 md:justify-center">
            <span className="text-sm font-semibold text-slate-200">Filter by Tags</span>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded p-2 text-slate-400 hover:bg-slate-700/50 hover:text-white md:hidden"
              aria-label="Close filters"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="overflow-y-auto p-3">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {activePills.length ? (
                <>
                  {activePills.map(({ category, value }) => (
                    <span
                      key={`${category}-${value}`}
                      className="inline-flex items-center gap-1 rounded-full bg-slate-600/80 px-2.5 py-1 text-xs text-slate-200"
                    >
                      {value.replace(/_/g, " ")}
                      <button
                        type="button"
                        onClick={() => toggleFilter(category, value)}
                        className="rounded-full hover:bg-slate-500/50"
                        aria-label={`Remove ${value}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-xs text-slate-400 underline hover:text-slate-200"
                  >
                    Clear All
                  </button>
                </>
              ) : (
                <span className="text-xs text-slate-500">No filters selected</span>
              )}
            </div>
            <div className="space-y-2">
              {taxonomy &&
                CATEGORY_ORDER.map((cat) => {
                  const tax = taxonomy[cat] as TaxonomyCategory | undefined;
                  if (!tax) return null;
                  return (
                    <FilterDropdown
                      key={cat}
                      category={cat}
                      taxonomyCategory={tax}
                      availableValues={availableFilters[cat] ?? (tax.type === "flat" ? tax.values : [])}
                      selectedValues={filters[cat] ?? []}
                      onToggle={(value) => toggleFilter(cat, value)}
                    />
                  );
                })}
            </div>
          </div>
        </aside>

        {/* Overlay when sidebar open on mobile */}
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close"
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Results */}
        <main className="min-w-0 flex-1 p-4 md:p-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="mb-4 flex items-center gap-2 rounded-lg border border-slate-600/50 bg-slate-800/50 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/50 md:hidden"
          >
            <Filter className="h-4 w-4" /> Filters
          </button>
          <p className="mb-4 text-sm text-slate-400">
            {loading ? "Loading…" : items.length ? `Showing ${items.length} results` : "No results match your filters"}
          </p>
          {loading ? (
            <p className="text-slate-500">Loading…</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item, i) => (
                <motion.button
                  key={item.image_id}
                  type="button"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setDetailItem(item)}
                  className="glass flex flex-col overflow-hidden rounded-xl border border-slate-600/40 text-left"
                >
                  <div className="relative h-[180px] w-full bg-slate-800/50">
                    {thumbUrl(item) ? (
                      <img
                        src={thumbUrl(item)!}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-slate-500">
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
                  <div className="p-3">
                    <p className="truncate text-xs text-slate-500">{item.image_id}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
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
                </motion.button>
              ))}
            </div>
          )}
        </main>
      </div>

      <DetailModal item={detailItem} onClose={() => setDetailItem(null)} />
    </div>
  );
}

"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Network, Zap } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import ProcessingOverlay from "@/components/ProcessingOverlay";
import JsonViewer from "@/components/JsonViewer";
import ThemeToggle from "@/components/ThemeToggle";
import ConfidenceRing from "@/components/ConfidenceRing";
import TagCategories from "@/components/TagCategories";
import TagCategoryCard from "@/components/TagCategoryCard";
import FlaggedTags from "@/components/FlaggedTags";
import SaveToast from "@/components/SaveToast";
import HistoryGrid from "@/components/HistoryGrid";
import { API_BASE_URL } from "@/lib/constants";
import { visionToCategoryTags } from "@/lib/visionMapper";
import type { AnalyzeImageResponse } from "@/lib/types";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [result, setResult] = useState<AnalyzeImageResponse | null>(null);
  const [metadata, setMetadata] = useState<AnalyzeImageResponse["metadata"] | null>(null);

  const handleUpload = useCallback(async (uploadedFile: File) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(uploadedFile);
    setPreviewUrl(URL.createObjectURL(uploadedFile));
    setResult(null);
    setLoading(true);
    setCurrentStep(1);
    const step2Timer = setTimeout(() => setCurrentStep(2), 800);
    const step3Timer = setTimeout(() => setCurrentStep(3), 2200);
    const step4Timer = setTimeout(() => setCurrentStep(4), 4000);

    const formData = new FormData();
    formData.append("file", uploadedFile);

    try {
      const res = await fetch(`${API_BASE_URL}/api/analyze-image`, {
        method: "POST",
        body: formData,
      });
      const data: AnalyzeImageResponse = await res.json();
      setResult(data);
      setMetadata(data.metadata);
    } catch (err) {
      setResult({
        image_id: "",
        image_url: "",
        vision_description: "",
        vision_raw_tags: {},
        metadata: {},
        processing_status: "failed",
        error: err instanceof Error ? err.message : "Request failed",
      });
    } finally {
      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
      clearTimeout(step4Timer);
      setLoading(false);
    }
  }, [previewUrl]);

  const rawTags = result?.vision_raw_tags ?? {};
  const visionText =
    (rawTags && typeof rawTags === "object" && "visual_description" in rawTags
      ? (rawTags as { visual_description?: string }).visual_description
      : null) ?? result?.vision_description ?? "";
  const categoryTags = typeof rawTags === "object" && rawTags !== null
    ? visionToCategoryTags(rawTags as Record<string, unknown>)
    : {};
  const confidence = result?.confidence ?? null;
  const flaggedTags = result?.flagged_tags ?? [];

  return (
    <div className="min-h-screen bg-[var(--background)] bg-pattern">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700/50 bg-slate-900/80 px-6 py-4 backdrop-blur-xl">
        <h1 className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-2xl font-bold tracking-tight text-transparent md:text-3xl">
          Image Tagging Agent
        </h1>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-slate-700/80 px-3 py-1 text-xs text-slate-300">
            <Sparkles className="h-3.5 w-3.5" /> GPT-4o
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-slate-700/80 px-3 py-1 text-xs text-slate-300">
            <Network className="h-3.5 w-3.5" /> LangGraph
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-slate-700/80 px-3 py-1 text-xs text-emerald-400/90">
            <Zap className="h-3.5 w-3.5" /> Supabase
          </span>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-8 md:grid-cols-[2fr_3fr]"
        >
          <div className="flex flex-col gap-4">
            <ImageUploader
              onUpload={handleUpload}
              disabled={loading}
              previewUrl={previewUrl}
              metadata={
                metadata?.width != null
                  ? {
                      width: metadata.width,
                      height: metadata.height,
                      format: metadata.format,
                      file_size_bytes: metadata.file_size_bytes,
                    }
                  : null
              }
            />
          </div>

          <div className="flex min-h-[320px] flex-col gap-4">
            {loading && <ProcessingOverlay currentStep={currentStep} />}
            {!loading && result && (
              <>
                <div className="glass rounded-xl p-5">
                  <div className="flex gap-6">
                    <div className="min-w-0 flex-1">
                      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
                        Vision Description
                      </h2>
                      <p className="text-slate-200">
                        {result.error
                          ? result.error
                          : visionText || "No description returned."}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <ConfidenceRing confidence={confidence} />
                    </div>
                  </div>
                </div>
                {result.saved_to_db && <SaveToast show />}
                {(() => {
                  const tagsByCategory = result.tags_by_category;
                  if (!tagsByCategory) {
                    if (result.season_tags && result.season_tags.length > 0) {
                      return (
                        <TagCategoryCard
                          category="season"
                          tags={result.season_tags}
                          confidenceScores={result.season_confidence_scores ?? {}}
                        />
                      );
                    }
                    return null;
                  }
                  return (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {(
                      [
                        "season",
                        "theme",
                        "objects",
                        "dominant_colors",
                        "design_elements",
                        "occasion",
                        "mood",
                        "product_type",
                      ] as const
                    ).map((cat) => {
                      const data = tagsByCategory[cat] ?? { tags: [], confidence_scores: {} };
                      return (
                        <TagCategoryCard
                          key={cat}
                          category={cat}
                          tags={data.tags}
                          confidenceScores={data.confidence_scores ?? {}}
                        />
                      );
                    })}
                  </div>
                  );
                })()}
                {!result.tags_by_category && (
                  <TagCategories categoryTags={categoryTags} />
                )}
                <FlaggedTags flagged={flaggedTags} />
                <JsonViewer data={result.vision_raw_tags || {}} title="Raw output" />
              </>
            )}
            {!loading && !result && file && (
              <p className="text-slate-500">Processing…</p>
            )}
            {!loading && !result && !file && (
              <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-600/50 text-slate-500">
                Upload an image to analyze
              </div>
            )}
          </div>
        </motion.div>
        <section className="mx-auto mt-12 max-w-7xl border-t border-slate-700/50 px-4 pt-8 md:px-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-200">Tagged images</h2>
          <HistoryGrid refetchTrigger={result?.saved_to_db} />
        </section>
      </main>
    </div>
  );
}

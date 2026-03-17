"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Clock, Loader2, Upload, X } from "lucide-react";
import { API_BASE_URL } from "@/lib/constants";
import type {
  BulkStatusResponse,
  BulkUploadResponse,
} from "@/lib/types";

const ACCEPT = { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] };
const POLL_INTERVAL_MS = 800;

interface BulkUploaderProps {
  onBulkComplete?: () => void;
}

export default function BulkUploader({ onBulkComplete }: BulkUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [status, setStatus] = useState<BulkStatusResponse | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearPreviews = useCallback(() => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls([]);
  }, [previewUrls]);

  const onDrop = useCallback((accepted: File[]) => {
    setUploadError(null);
    if (accepted.length === 0) return;
    clearPreviews();
    setFiles(accepted);
    setPreviewUrls(accepted.map((f) => URL.createObjectURL(f)));
    setBatchId(null);
    setStatus(null);
  }, [clearPreviews]);

  useEffect(() => {
    return () => {
      clearPreviews();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [clearPreviews]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    maxFiles: 100,
    disabled: !!batchId && status?.status !== "complete",
  });

  const fetchStatus = useCallback(async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/api/bulk-status/${id}`);
    if (!res.ok) return;
    const data: BulkStatusResponse = await res.json();
    setStatus(data);
    if (data.status === "complete" && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
      onBulkComplete?.();
    }
  }, [onBulkComplete]);

  useEffect(() => {
    if (!batchId) return;
    let cancelled = false;
    const poll = () => {
      if (cancelled) return;
      fetchStatus(batchId);
    };
    poll();
    const intervalId = setInterval(poll, POLL_INTERVAL_MS);
    pollRef.current = intervalId;
    return () => {
      cancelled = true;
      clearInterval(intervalId);
      pollRef.current = null;
    };
  }, [batchId, fetchStatus]);

  const startBulkAnalysis = useCallback(async () => {
    if (files.length === 0) return;
    setUploadError(null);
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    try {
      const res = await fetch(`${API_BASE_URL}/api/bulk-upload`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setUploadError(err.detail || "Upload failed");
        return;
      }
      const data: BulkUploadResponse = await res.json();
      setBatchId(data.batch_id);
      setStatus({
        batch_id: data.batch_id,
        total: data.total,
        completed: 0,
        failed: 0,
        status: data.status,
        results: [],
      });
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    }
  }, [files]);

  const clearAndReset = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
    clearPreviews();
    setFiles([]);
    setPreviewUrls([]);
    setBatchId(null);
    setStatus(null);
    setUploadError(null);
  }, [clearPreviews]);

  const isProcessing = batchId && status?.status !== "complete";
  const isDone = status?.status === "complete";
  const completed = status?.completed ?? 0;
  const failed = status?.failed ?? 0;
  const total = status?.total ?? files.length;
  const processedCount = status?.results?.length ?? (completed + failed);

  return (
    <div className="flex flex-col gap-4">
      {files.length === 0 ? (
        <div
          {...getRootProps()}
          className="flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-500/50 bg-slate-800/40 p-6 transition hover:border-indigo-400/60 hover:bg-slate-800/60"
        >
          <input {...getInputProps()} />
          <Upload className="h-10 w-10 text-slate-400" />
          <p className="text-center text-slate-400">
            {isDragActive ? "Drop the images here" : "Drag & drop multiple images, or click to select"}
          </p>
          <p className="text-xs text-slate-500">JPG, PNG, or WEBP (max 100)</p>
        </div>
      ) : (
        <>
          {isProcessing && (
            <div className="rounded-lg bg-slate-800/60 p-3">
              <p className="mb-2 text-sm text-slate-300">
                Processing {processedCount} of {total} images…
              </p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
                <motion.div
                  className="h-full bg-indigo-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${total ? (processedCount / total) * 100 : 0}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}
          {isDone && (
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-600/50 bg-slate-800/40 p-3">
              <p className="text-sm text-slate-200">
                {total} images analyzed, {completed} saved, {failed} failed
              </p>
              <Link
                href="/search"
                className="rounded-lg bg-indigo-500/80 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
              >
                View in Search
              </Link>
              <button
                type="button"
                onClick={clearAndReset}
                className="rounded-lg border border-slate-500/50 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700/50"
              >
                Clear / Upload More
              </button>
            </div>
          )}
          {!isDone && files.length > 0 && !batchId && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={startBulkAnalysis}
                className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
              >
                Start Bulk Analysis
              </button>
              <button
                type="button"
                onClick={clearAndReset}
                className="rounded-lg border border-slate-500/50 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700/50"
              >
                Clear
              </button>
            </div>
          )}
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
            {files.map((file, i) => {
              const result = status?.results?.[i];
              const currentStatus = result
                ? result.processing_status === "failed"
                  ? "failed"
                  : "complete"
                : i === (status?.results?.length ?? 0)
                  ? "processing"
                  : "pending";
              return (
                <motion.div
                  key={file.name + i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="relative aspect-square overflow-hidden rounded-lg border-2 border-slate-600/50 bg-slate-800/50"
                >
                  {previewUrls[i] && (
                    <img
                      src={previewUrls[i]}
                      alt=""
                      className={`h-full w-full object-cover ${currentStatus === "pending" ? "opacity-50" : ""}`}
                    />
                  )}
                  <div
                    className={`absolute inset-0 flex items-center justify-center ${
                      currentStatus === "pending"
                        ? "bg-slate-900/50"
                        : currentStatus === "processing"
                          ? "bg-slate-900/30"
                          : "bg-slate-900/20"
                    }`}
                  >
                    {currentStatus === "pending" && <Clock className="h-6 w-6 text-slate-400" />}
                    {currentStatus === "processing" && (
                      <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
                    )}
                    {currentStatus === "complete" && (
                      <div className="rounded-full bg-emerald-500/90 p-1">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                    {currentStatus === "failed" && (
                      <div className="rounded-full bg-red-500/90 p-1">
                        <X className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  {currentStatus === "processing" && (
                    <div className="absolute inset-0 animate-pulse rounded-lg border-2 border-indigo-400/60" />
                  )}
                  <p className="absolute bottom-0 left-0 right-0 truncate bg-slate-900/80 px-1 py-0.5 text-xs text-slate-300">
                    {file.name}
                  </p>
                </motion.div>
              );
            })}
          </div>
          {uploadError && <p className="text-sm text-red-400">{uploadError}</p>}
        </>
      )}
    </div>
  );
}

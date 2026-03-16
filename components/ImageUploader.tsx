"use client";

import { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { motion } from "framer-motion";
import { CloudUpload, Loader2 } from "lucide-react";

const ACCEPT = { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] };

interface ImageUploaderProps {
  onUpload: (file: File) => void;
  disabled?: boolean;
  previewUrl?: string | null;
  metadata?: { width?: number; height?: number; format?: string; file_size_bytes?: number } | null;
}

export default function ImageUploader({ onUpload, disabled, previewUrl, metadata }: ImageUploaderProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[], fileRejections: FileRejection[]) => {
      setError(null);
      if (fileRejections.length) setError("Please use JPG, PNG, or WEBP only.");
      if (accepted.length) onUpload(accepted[0]);
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    maxFiles: 1,
    disabled,
  });

  const formatSize = (bytes?: number) =>
    bytes == null ? "" : bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;

  return (
    <div className="flex flex-col gap-4">
      {!previewUrl ? (
        <div
          {...getRootProps()}
          className="flex min-h-[280px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-500/50 bg-slate-800/40 p-6 transition hover:border-indigo-400/60 hover:bg-slate-800/60"
        >
          <input {...getInputProps()} />
          {disabled ? (
            <Loader2 className="h-12 w-12 animate-spin text-indigo-400" />
          ) : (
            <CloudUpload className="h-12 w-12 text-slate-400" />
          )}
          <p className="text-center text-slate-400">
            {isDragActive ? "Drop the image here" : "Drag & drop an image, or click to select"}
          </p>
          <p className="text-xs text-slate-500">JPG, PNG, or WEBP</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="overflow-hidden rounded-xl bg-slate-800/40 shadow-xl"
        >
          <img
            src={previewUrl}
            alt="Upload preview"
            className="h-auto w-full max-h-[400px] object-contain"
          />
          <div className="flex flex-wrap gap-2 p-3">
            {metadata?.width != null && metadata?.height != null && (
              <span className="rounded-full bg-slate-600/80 px-3 py-1 text-xs text-slate-300">
                {metadata.width} × {metadata.height}
              </span>
            )}
            {metadata?.format && (
              <span className="rounded-full bg-slate-600/80 px-3 py-1 text-xs text-slate-300">
                {metadata.format}
              </span>
            )}
            {metadata?.file_size_bytes != null && (
              <span className="rounded-full bg-slate-600/80 px-3 py-1 text-xs text-slate-300">
                {formatSize(metadata.file_size_bytes)}
              </span>
            )}
          </div>
        </motion.div>
      )}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

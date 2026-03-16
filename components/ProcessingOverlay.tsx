"use client";

import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

const STAGES = ["Preprocessing", "Vision Analysis", "Tagging", "Validating"] as const;

interface ProcessingOverlayProps {
  currentStep: number; // 1-based: 1 = Preprocessing, 2 = Vision, 3 = Tagging, 4 = Validating
}

export default function ProcessingOverlay({ currentStep }: ProcessingOverlayProps) {
  return (
    <div className="glass rounded-2xl p-8">
      <div className="flex items-center justify-center gap-2">
        {STAGES.map((label, i) => {
          const step = i + 1;
          const done = currentStep > step;
          const active = currentStep === step;
          return (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center">
                <motion.div
                  className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-500 bg-slate-800/80"
                  animate={
                    active
                      ? { boxShadow: ["0 0 0 0 rgba(99, 102, 241, 0.4)", "0 0 0 12px rgba(99, 102, 241, 0)"] }
                      : {}
                  }
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {done ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-emerald-400"
                    >
                      <Check className="h-6 w-6" />
                    </motion.span>
                  ) : active ? (
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
                  ) : (
                    <span className="h-3 w-3 rounded-full border border-slate-500 bg-transparent" />
                  )}
                </motion.div>
                <span className="mt-2 text-xs font-medium text-slate-400">{label}</span>
              </div>
              {i < STAGES.length - 1 && (
                <div
                  className={`mx-1 h-0.5 w-8 md:w-12 ${
                    done ? "bg-indigo-500" : "bg-slate-600"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-6 flex items-center justify-center gap-2 text-slate-400">
        <span className="inline-flex gap-0.5">
          <span className="animate-pulse">.</span>
          <span className="animate-pulse" style={{ animationDelay: "0.2s" }}>.</span>
          <span className="animate-pulse" style={{ animationDelay: "0.4s" }}>.</span>
        </span>
        Analyzing your image with AI...
      </p>
    </div>
  );
}

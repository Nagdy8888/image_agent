"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface SaveToastProps {
  show: boolean;
}

export default function SaveToast({ show }: SaveToastProps) {
  if (!show) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-100"
    >
      <Check className="h-5 w-5 text-emerald-400" />
      Saved to database
    </motion.div>
  );
}

"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, ChevronDown, ChevronUp } from "lucide-react";

interface JsonViewerProps {
  data: Record<string, unknown> | string;
  title?: string;
}

export default function JsonViewer({ data, title = "Raw output" }: JsonViewerProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const jsonStr = typeof data === "string" ? data : JSON.stringify(data, null, 2);

  async function copyToClipboard() {
    await navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="glass rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-300"
      >
        {open ? "Hide" : "View Raw Output"}
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && (
        <div className="relative border-t border-slate-600/50">
          <button
            type="button"
            onClick={copyToClipboard}
            className="absolute right-2 top-2 rounded p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white"
            title="Copy"
          >
            <Copy className="h-4 w-4" />
          </button>
          {copied && (
            <span className="absolute right-10 top-2 text-xs text-emerald-400">Copied</span>
          )}
          <SyntaxHighlighter
            language="json"
            style={oneDark}
            customStyle={{
              margin: 0,
              padding: "1rem 1rem 2.5rem",
              fontSize: "12px",
              background: "rgb(15 23 42 / 0.6)",
            }}
            showLineNumbers
          >
            {jsonStr}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
}

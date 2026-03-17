"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const isTagImage = pathname === "/";
  const isSearch = pathname === "/search";

  return (
    <nav className="flex h-12 items-center border-b border-slate-700/50 bg-slate-900/80 px-4 md:px-6">
      <div className="flex gap-6">
        <Link
          href="/"
          className={`font-medium transition-colors ${
            isTagImage
              ? "text-blue-400 underline decoration-2 underline-offset-4"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Tag Image
        </Link>
        <Link
          href="/search"
          className={`font-medium transition-colors ${
            isSearch
              ? "text-blue-400 underline decoration-2 underline-offset-4"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Search
        </Link>
      </div>
    </nav>
  );
}

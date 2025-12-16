"use client";

import { useState } from "react";

export function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-block align-middle ml-1">
      <span
        className="inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-gray-600 border border-gray-400 rounded-full cursor-pointer select-none"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        aria-label="Info"
      >
        i
      </span>

      {open && (
        <div className="absolute z-50 w-72 p-2 text-xs text-gray-800 bg-white border rounded shadow-lg -left-32 top-6">
          {text}
        </div>
      )}
    </span>
  );
}

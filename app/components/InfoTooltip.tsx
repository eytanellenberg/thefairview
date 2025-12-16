"use client";

import { Info } from "lucide-react";
import { useState } from "react";

export function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-block align-middle ml-1">
      <Info
        size={14}
        className="inline cursor-pointer text-gray-500"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        aria-label="Info"
      />
      {open && (
        <div className="absolute z-50 w-72 p-2 text-xs text-gray-800 bg-white border rounded shadow-lg -left-32 top-5">
          {text}
        </div>
      )}
    </span>
  );
}

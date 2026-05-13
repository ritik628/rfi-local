"use client";

import { Plus } from "lucide-react";

export default function PageHeader({ count, totalItems, onAddClick }) {
  return (
    <div className="bg-card border-b border-border p-3 md:p-[12px_24px] flex items-center justify-between shrink-0">
      <div>
        <div className="text-base md:text-[17px] font-medium text-foreground tracking-tight">
          Categories
        </div>
        <div className="text-[10px] md:text-[12px] font-normal text-muted-foreground mt-0.5">
          {count} design defect categories · {totalItems} classification items
        </div>
      </div>
      <button
        onClick={onAddClick}
        className="bg-primary/90 text-primary-foreground hover:bg-primary px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
      >
        <Plus className="w-4 h-4" />
        Add Category
      </button>
    </div>
  );
}

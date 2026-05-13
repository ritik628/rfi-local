"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Edit2, Trash2, Plus, Layers } from "lucide-react";

export default function CategoryCard({ 
  category, 
  onEdit, 
  onDelete, 
  onAddSub, 
  onEditSub, 
  onDeleteSub, 
  onAddItem, 
  onEditItem, 
  onDeleteItem,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const totalItems = category.subcategories.reduce((acc, sub) => acc + sub.items.length, 0);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-sm transition-all h-fit">
      {/* Category Header */}
      <div className="p-4 flex items-start gap-3">
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 flex gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-border/60 bg-muted/30 group-hover:bg-primary/5 group-hover:border-primary/10 transition-colors">
            <span className="font-mono text-[13px] font-medium text-foreground/60 group-hover:text-primary transition-colors">{category.no}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {category.name}
              </span>
              {category.is_custom && (
                <span className="text-[10px] bg-primary/5 text-primary/80 px-2 py-0.5 rounded-full font-medium uppercase tracking-wider">
                  Custom
                </span>
              )}
            </div>
            {category.description && (
              <p className="text-[12px] text-muted-foreground/80 mt-1 line-clamp-2 leading-relaxed">
                {category.description}
              </p>
            )}
            <div className="text-[11px] text-muted-foreground/60 font-normal mt-1.5 flex items-center gap-2">
              <span>{category.subcategories.length} subcategories</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>{totalItems} items</span>
            </div>
          </div>
          <div className="shrink-0 mt-1">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>

        <div className="flex gap-1 shrink-0 mt-1">
          <button
            onClick={() => onEdit(category)}
            className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
            title="Edit Category"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(category)}
            className="p-1.5 hover:bg-destructive/10 rounded-md text-muted-foreground hover:text-destructive transition-colors"
            title="Delete Category"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Subcategories Area */}
      {isExpanded && (
        <div className="bg-muted/30 border-t border-border p-4 space-y-4">
          {category.subcategories.map((sub) => (
            <div key={sub.id} className="bg-card border border-border/60 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-[10px] text-muted-foreground/80 bg-muted px-1.5 py-0.5 rounded border border-border/50">
                  {sub.no}
                </span>
                <span className="text-[13px] font-semibold text-foreground flex-1">
                  {sub.name}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => onEditSub(sub)}
                    className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onAddItem(sub)}
                    className="p-1 hover:bg-primary/5 rounded text-primary/80 transition-colors flex items-center gap-1"
                    title="Add Item"
                  >
                    <Plus className="w-3 h-3" />
                    <span className="text-[10px] font-normal">Item</span>
                  </button>
                  <button
                    onClick={() => onDeleteSub(sub)}
                    className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pl-1">
                {sub.items.length === 0 ? (
                  <span className="text-[11px] text-muted-foreground/50 italic">No items yet</span>
                ) : (
                  sub.items.map((item) => (
                    <div 
                      key={item.id} 
                      className="group inline-flex items-center gap-1.5 bg-muted/40 hover:bg-muted border border-border/50 px-2.5 py-1 rounded-full transition-colors"
                    >
                      <span className="font-mono text-[10px] text-muted-foreground/60">{item.no}</span>
                      <span className="text-[11px] text-foreground/80">{item.name}</span>
                      <div className="flex items-center gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => onEditItem(item)}
                          className="p-0.5 text-muted-foreground hover:text-primary"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                        </button>
                        <button 
                          onClick={() => onDeleteItem(item)}
                          className="p-0.5 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}

          <button
            onClick={() => onAddSub(category)}
            className="w-full py-2.5 border-2 border-dashed border-border/60 rounded-xl text-[12.5px] font-normal text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Subcategory
          </button>
        </div>
      )}
    </div>
  );
}

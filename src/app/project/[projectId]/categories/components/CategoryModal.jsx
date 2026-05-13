"use client";

import { X } from "lucide-react";

export default function CategoryModal({ 
  type, 
  data, 
  form, 
  setForm, 
  onClose, 
  onSave, 
  saving 
}) {
  const titles = {
    addCat: "Add New Category",
    editCat: "Edit Category",
    addSub: "Add Subcategory",
    editSub: "Edit Subcategory",
    addItem: "Add Item",
    editItem: "Edit Item",
  };

  const isCat = type?.includes("Cat");
  const isSub = type?.includes("Sub");
  const isItem = type?.includes("Item");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/10">
          <h3 className="font-medium text-foreground text-[16px]">{titles[type]}</h3>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-full text-muted-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-foreground/60 uppercase tracking-wider mb-1.5 ml-1">
              {isCat ? "Category No *" : isSub ? "Subcategory No *" : "Item No *"}
            </label>
            <input
              autoFocus
              className="w-full bg-muted/20 border border-border/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/40"
              placeholder={isCat ? "e.g. 11" : isSub ? "e.g. 11.1" : "e.g. 11.1.1"}
              value={form.no || ""}
              onChange={(e) => setForm({ ...form, no: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-foreground/60 uppercase tracking-wider mb-1.5 ml-1">
              {isCat ? "Category Name *" : isSub ? "Subcategory Name *" : "Item Name *"}
            </label>
            <input
              className="w-full bg-muted/20 border border-border/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/40"
              placeholder={isCat ? "e.g. Structural Defect" : isSub ? "e.g. Concrete Cracks" : "e.g. Hairline cracks in slab"}
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {isCat && (
            <div>
              <label className="block text-[12px] font-medium text-foreground/60 uppercase tracking-wider mb-1.5 ml-1">
                Description
              </label>
              <textarea
                rows={3}
                className="w-full bg-muted/20 border border-border/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/40 resize-none"
                placeholder="Describe this defect type..."
                value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          )}

          {(type === "addCat" || type === "addItem") && (
            <div>
              <label className="block text-[12px] font-medium text-foreground/60 uppercase tracking-wider mb-1.5 ml-1">
                Added By
              </label>
              <input
                className="w-full bg-muted/20 border border-border/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/40"
                placeholder="Your name"
                value={form.added_by || ""}
                onChange={(e) => setForm({ ...form, added_by: e.target.value })}
              />
            </div>
          )}
        </div>

        <div className="p-4 bg-muted/10 border-t border-border flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex-[2] bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:bg-primary disabled:opacity-50 transition-all flex items-center justify-center"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

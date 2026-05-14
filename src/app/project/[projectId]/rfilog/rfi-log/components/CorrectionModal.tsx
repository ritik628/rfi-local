"use client";
import { X, Info } from "lucide-react";
import CustomSelect from "@/components/ui/CustomSelect";

export default function CorrectionModal({
  correcting,
  corr,
  setCorr,
  categories,
  SEVERITIES,
  saveCorrection,
  onDismiss,
}) {
  if (!correcting) return null;
  const selCat = categories.find((c) => c.name === corr.human_design_defect);
  const selSub = selCat?.subcategories?.find(
    (s) => s.name === corr.human_next_level_category,
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-background/60 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-[24px] shadow-2xl w-full max-w-[700px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
              <Info size={20} />
            </div>
            <div>
              <h2 className="text-[16px] font-medium text-foreground leading-tight">
                Refine Classification
              </h2>
              <p className="text-[13px] text-muted-foreground font-normal">
                Human review improves AI accuracy for this project
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-muted-foreground/60 uppercase tracking-wider px-0.5">
                  Design Defect
                </label>
                <CustomSelect
                  placeholder="Select Defect"
                  triggerClassName="bg-muted/10 border-border/40 rounded-xl py-3 min-h-[46px]"
                  options={categories.map((c) => ({ label: c.name, value: c.name }))}
                  value={corr.human_design_defect || ""}
                  onChange={(val) =>
                    setCorr((f) => ({
                      ...f,
                      human_design_defect: val,
                      human_next_level_category: "",
                      human_sub_level_category: "",
                    }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-muted-foreground/60 uppercase tracking-wider px-0.5">
                  Category
                </label>
                <CustomSelect
                  placeholder="Select Category"
                  triggerClassName="bg-muted/10 border-border/40 rounded-xl py-3 min-h-[46px]"
                  options={(selCat?.subcategories || []).map((s) => ({ label: s.name, value: s.name }))}
                  value={corr.human_next_level_category || ""}
                  onChange={(val) =>
                    setCorr((f) => ({
                      ...f,
                      human_next_level_category: val,
                      human_sub_level_category: "",
                    }))
                  }
                  className={!selCat ? "opacity-40 cursor-not-allowed" : ""}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-muted-foreground/60 uppercase tracking-wider px-0.5">
                  Sub-Category
                </label>
                <CustomSelect
                  placeholder="Select Item"
                  triggerClassName="bg-muted/10 border-border/40 rounded-xl py-3 min-h-[46px]"
                  options={(selSub?.items || []).map((i) => ({ label: i.name, value: i.name }))}
                  value={corr.human_sub_level_category || ""}
                  onChange={(val) =>
                    setCorr((f) => ({
                      ...f,
                      human_sub_level_category: val,
                    }))
                  }
                  className={!selSub ? "opacity-40 cursor-not-allowed" : ""}
                />
              </div>
            </div>

            <div className="bg-primary/[0.02] border border-primary/5 rounded-[20px] p-5 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-muted-foreground/60 uppercase tracking-wider px-0.5">
                  Override Location
                </label>
                <input
                  className="w-full bg-muted/10 border border-border/40 rounded-xl px-4 py-3 text-[13px] font-normal text-foreground/80 outline-none focus:ring-1 focus:ring-primary/30 min-h-[46px]"
                  value={corr.human_location || ""}
                  onChange={(e) =>
                    setCorr((f) => ({ ...f, human_location: e.target.value }))
                  }
                />
              </div>

              <div className="pt-2">
                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3.5 flex gap-3">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-800/80 font-normal leading-relaxed">
                    These corrections are indexed into the project's <span className="font-medium text-amber-900">Fine-tuning
                    memory</span>. AI will follow this human guidance automatically.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onDismiss}
              className="flex-1 bg-muted/50 border border-border text-foreground font-medium py-3 rounded-xl text-[13px] hover:bg-muted transition-colors"
            >
              Discard Changes
            </button>
            <button
              onClick={saveCorrection}
              className="flex-1 bg-primary text-white font-medium py-3 rounded-xl text-[13px] hover:opacity-90 transition-opacity shadow-md"
            >
              Save & Update AI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

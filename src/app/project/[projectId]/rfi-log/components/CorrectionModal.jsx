'use client';
import { XCircle, Info } from 'lucide-react';

export default function CorrectionModal({ 
  correcting, 
  corr, 
  setCorr, 
  categories, 
  SEVERITIES, 
  saveCorrection, 
  onDismiss 
}) {
  if (!correcting) return null;
  const selCat = categories.find(c => c.name === corr.human_design_defect);
  const selSub = selCat?.subcategories?.find(s => s.name === corr.human_next_level_category);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Refine Classification</h2>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Human review improves AI accuracy for this project over time</p>
          </div>
          <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Design Defect</label>
              <select 
                className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none font-semibold"
                value={corr.human_design_defect||''}
                onChange={e => setCorr(f => ({ ...f, human_design_defect: e.target.value, human_next_level_category: '', human_sub_level_category: '' }))}
              >
                <option value="">— Select Defect —</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Category</label>
              <select 
                className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none font-semibold disabled:opacity-30"
                disabled={!selCat}
                value={corr.human_next_level_category||''}
                onChange={e => setCorr(f => ({ ...f, human_next_level_category: e.target.value, human_sub_level_category: '' }))}
              >
                <option value="">— Select Category —</option>
                {(selCat?.subcategories || []).map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Sub-Category</label>
              <select 
                className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none font-semibold disabled:opacity-30"
                disabled={!selSub}
                value={corr.human_sub_level_category||''}
                onChange={e => setCorr(f => ({ ...f, human_sub_level_category: e.target.value }))}
              >
                <option value="">— Select Item —</option>
                {(selSub?.items || []).map(i => <option key={i.id} value={i.name}>{i.name}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-muted/30 border border-border rounded-2xl p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Override Location</label>
              <input 
                className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:ring-1 focus:ring-primary"
                value={corr.human_location || ''}
                onChange={e => setCorr(f => ({ ...f, human_location: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Adjust Severity</label>
              <div className="grid grid-cols-2 gap-2">
                {SEVERITIES.map(s => (
                  <button 
                    key={s} 
                    onClick={() => setCorr(f => ({ ...f, ai_severity: s }))}
                    className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                      corr.ai_severity === s ? 'bg-foreground text-background border-foreground' : 'bg-card text-muted-foreground border-border hover:bg-muted'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="pt-2">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
                <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-800 font-medium leading-relaxed">
                  These corrections are indexed into the project's **Fine-tuning memory**. Future RFIs with similar patterns will follow this human guidance automatically.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={onDismiss}
            className="flex-1 bg-muted border border-border text-foreground font-bold py-3 rounded-xl hover:bg-muted/80 transition-colors"
          >
            Discard Changes
          </button>
          <button 
            onClick={saveCorrection}
            className="flex-1 bg-primary text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
          >
            Save & Update AI
          </button>
        </div>
      </div>
    </div>
  );
}

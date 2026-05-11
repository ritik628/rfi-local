'use client';
import { Trash2 } from 'lucide-react';

export default function DeleteConfirmationModal({
  deleteTarget,
  setDeleteTarget,
  deleting,
  deleteBy,
  setDeleteBy,
  deleteNotes,
  setDeleteNotes,
  confirmDelete
}) {
  if (!deleteTarget) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50" onClick={() => !deleting && setDeleteTarget(null)}>
      <div className="animate-in fade-in zoom-in-95 duration-200 bg-card border border-border rounded-[22px] p-9 w-[480px] shadow-lg" onClick={e => e.stopPropagation()}>
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center text-destructive">
            <Trash2 className="w-7 h-7" />
          </div>
        </div>
        <div className="text-[20px] font-semibold text-foreground text-center mb-1.5">Delete Project?</div>
        <div className="text-[14px] text-muted-foreground text-center mb-1">
          <strong className="text-foreground">{deleteTarget.name}</strong>
        </div>
        <div className="text-[13px] text-destructive text-center mb-5.5">
          This will permanently delete {deleteTarget.rfi_count} RFIs and all project data.
        </div>

        <div className="bg-muted/30 border border-border rounded-xl p-4 mb-4">
          <div className="text-[11.5px] text-primary font-medium mb-2.5 uppercase tracking-wide">Audit Record</div>
          <div className="mb-2.5">
            <label className="block text-[12.5px] text-muted-foreground mb-1.5">Your Name *</label>
            <input 
              className="w-full bg-input/10 border border-input rounded-lg px-4 py-3 text-[15px] text-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-ring placeholder-muted-foreground" 
              placeholder="e.g. Ahmed Al-Rashid" 
              value={deleteBy} 
              onChange={e => setDeleteBy(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-[12.5px] text-muted-foreground mb-1.5">Reason (optional)</label>
            <input 
              className="w-full bg-input/10 border border-input rounded-lg px-4 py-3 text-[15px] text-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-ring placeholder-muted-foreground" 
              placeholder="e.g. Project cancelled, duplicate entry…" 
              value={deleteNotes} 
              onChange={e => setDeleteNotes(e.target.value)} 
            />
          </div>
        </div>

        <div className="flex gap-2.5">
          <button className="flex-1 bg-muted/50 text-foreground border border-input rounded-lg py-3 text-[15px] font-medium hover:bg-muted transition-colors" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</button>
          <button onClick={confirmDelete} disabled={deleting || !deleteBy.trim()}
            className={`flex-[2] rounded-lg py-3 text-[15px] font-medium transition-all ${deleteBy.trim() && !deleting ? 'bg-destructive text-destructive-foreground cursor-pointer hover:brightness-110' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>
            {deleting ? 'Deleting…' : 'Yes, Delete Project'}
          </button>
        </div>
      </div>
    </div>
  );
}

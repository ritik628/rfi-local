'use client';

export default function CreateProjectModal({ 
  showModal, 
  setShowModal, 
  step, 
  form, 
  setForm, 
  handleCreate 
}) {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50" onClick={() => step === 'idle' && setShowModal(false)}>
      <div className="animate-in fade-in zoom-in-95 duration-200 bg-card border border-border rounded-[22px] p-9 w-[540px] max-w-[calc(100vw-32px)] shadow-lg" onClick={e => e.stopPropagation()}>

        {step === 'creating' && (
          <div className="text-center py-5 pb-3.5">
            <div className="flex justify-center mb-7">
              <div className="w-[52px] h-[52px] border-4 border-muted border-t-primary rounded-full animate-spin" />
            </div>
            <div className="text-[20px] font-semibold text-foreground mb-2.5">Creating workspace…</div>
            <div className="text-[15px] text-muted-foreground leading-relaxed">
              Setting up your project in Azure SQL.<br />This takes just a moment.
            </div>
            <div className="flex justify-center gap-2 mt-7 flex-wrap">
              {['Validating name','Creating project','Preparing workspace'].map(s => (
                <div key={s} className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-[12.5px] text-muted-foreground">{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="text-center py-5 pb-3.5">
            <div className="flex justify-center mb-5.5">
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="28" fill="var(--color-primary)" opacity="0.1" stroke="currentColor" className="text-primary" strokeWidth="1.5" />
                <polyline points="18,30 26,38 42,22" fill="none" stroke="currentColor" className="text-primary" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-[20px] font-semibold text-foreground mb-2">Project Created!</div>
            <div className="text-[14.5px] text-muted-foreground">Closing in a moment…</div>
          </div>
        )}

        {step === 'idle' && (
          <>
            <div className="mb-7">
              <div className="text-[23px] font-semibold text-foreground tracking-tight mb-2">
                New Project Workspace
              </div>
              <div className="text-[15px] text-muted-foreground">
                Isolated RFI data, categories, and AI memory per project
              </div>
            </div>

            <div className="flex flex-col gap-3.5">
              {[
                ['Project Name *', 'name',        'e.g. S-Tower Phase 2', true],
                ['Description',    'description', 'Brief project overview'],
                ['Client',         'client',      'e.g. Sobha Gold FZ LLC'],
                ['Consultant',     'consultant',  'e.g. PNC Architects'],
                ['Contractor',     'contractor',  'e.g. Sobha Constructions'],
              ].map(([label, key, ph, req]) => (
                <div key={key}>
                  <label className="block text-[13.5px] font-medium text-muted-foreground mb-2">{label}</label>
                  <input
                    className="w-full bg-input/10 border border-input rounded-lg px-4 py-3 text-[15px] text-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-ring placeholder-muted-foreground"
                    placeholder={ph}
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]:e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && req && handleCreate()}
                    autoFocus={key === 'name'}
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-2.5 mt-7">
              <button className="flex-1 bg-muted/50 text-foreground border border-input rounded-lg py-3 text-[15px] font-medium hover:bg-muted transition-colors" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="flex-[2] btn-base bg-primary text-primary-foreground py-3 hover:brightness-110" onClick={handleCreate}>
                Create Project
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

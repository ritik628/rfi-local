'use client';
import { CheckCircle2, Bot, Loader2 } from 'lucide-react';
import React from 'react';

export default function SingleClassifyModal({ isVisible, status, rfi, onDismiss }) {
  if (!isVisible || !rfi) return null;

  const isDone = status === 'done';

  // Mapping internal status to pipeline steps for the UI
  const steps = [
    { id: 'fetch',    label: 'Fetching RFI data',            done: ['analyzing', 'ensemble', 'saving', 'done'].includes(status), active: status === 'retrieving' },
    { id: 'gpt52',    label: 'GPT-5.2 analysing',            done: ['ensemble', 'saving', 'done'].includes(status), active: status === 'analyzing' },
    { id: 'gpt54',    label: 'GPT-5.4 analysing (ensemble)', done: ['ensemble', 'saving', 'done'].includes(status), active: status === 'analyzing' },
    { id: 'ensemble', label: 'Ensemble comparison',          done: ['saving', 'done'].includes(status), active: status === 'ensemble' },
    { id: 'save',     label: 'Saving to Database',           done: status === 'done', active: status === 'saving' },
  ];

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-[32px] shadow-2xl w-full max-w-md p-10 text-center animate-in fade-in zoom-in duration-200">
        
        {isDone ? (
          <div className="space-y-8 py-4">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-12 h-12" strokeWidth={2.5} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-medium text-foreground">Classification Complete</h2>
              <p className="text-sm text-muted-foreground font-normal">
                Record <span className="text-foreground font-medium">{rfi.rfi_ref}</span> processed successfully
              </p>
            </div>
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 text-[13px] text-emerald-700 leading-relaxed text-left font-medium">
              Results saved to project storage. Confidence scores computed for all fields. AI memory updated with local context.
            </div>
            <button 
              onClick={onDismiss} 
              className="w-full bg-foreground text-background font-medium py-4 rounded-2xl hover:opacity-90 transition-opacity text-sm shadow-lg shadow-foreground/10"
            >
              View Results
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top Spinner */}
            <div className="relative w-16 h-16 mx-auto mb-2">
              <div className="absolute inset-0 border-[3px] border-muted/30 rounded-full" />
              <div className="absolute inset-0 border-[3px] border-t-foreground rounded-full animate-spin" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-medium text-foreground tracking-tight">AI Classifying RFI</h2>
              <p className="text-[11px] text-muted-foreground uppercase tracking-[0.2em] font-medium">
                Processing {rfi.rfi_ref}
              </p>
            </div>

            {/* Agent Pipeline Box */}
            <div className="bg-card border border-border rounded-2xl p-6 text-left space-y-4 shadow-sm">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.1em] block mb-2">Agent Pipeline</span>
              <div className="space-y-4">
                {steps.map((s, i) => {
                  const isActive = s.active;
                  const isDoneStep = s.done;
                  return (
                    <div key={s.id} className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium shrink-0 transition-all ${
                        isDoneStep ? 'bg-emerald-500 text-white' : isActive ? 'bg-foreground text-background scale-110' : 'bg-muted/80 text-muted-foreground border border-border/50'
                      }`}>
                        {isDoneStep ? <CheckCircle2 className="w-4 h-4" strokeWidth={3} /> : (i + 1)}
                      </div>
                      <span className={`text-[13px] font-medium transition-colors ${isDoneStep ? 'text-foreground' : isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer reference instead of progress bar */}
            <div className="pt-2">
                <p className="text-[11px] text-muted-foreground font-medium flex items-center justify-center gap-2">
                    <span className="opacity-50 tracking-widest">&gt;</span>
                    {rfi.rfi_ref}
                </p>
            </div>

            {/* Stop button removed for solo record as it's very fast */}
            <div className="h-4" />
          </div>
        )}
      </div>
    </div>
  );
}

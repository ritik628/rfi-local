'use client';
import { CheckCircle2 } from 'lucide-react';

export default function ClassifyModal({ progress, onDismiss, onStop }) {
  if (!progress) return null;
  const pct = progress.total > 0 ? Math.round(progress.done / progress.total * 100) : 0;
  const isDone     = progress.status === 'done';
  const isRunning  = progress.status === 'running';
  const isStopping = progress.status === 'stopping';

  const steps = [
    { id:'fetch',    label:'Fetching RFI data',            done: progress.status !== 'queued', active: false },
    { id:'gpt52',    label:'GPT-5.2 analysing',            done: isDone, active: isRunning || isStopping },
    { id:'gpt54',    label:'GPT-5.4 analysing (ensemble)', done: isDone, active: isRunning || isStopping },
    { id:'ensemble', label:'Ensemble comparison',          done: isDone, active: isRunning || isStopping },
    { id:'save',     label:'Saving to Database',           done: isDone, active: isRunning || isStopping },
  ];

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-8 text-center animate-in fade-in zoom-in duration-200">
        {isDone ? (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-medium text-foreground">Classification Complete</h2>
              <p className="text-sm text-muted-foreground">{progress.done} RFIs processed successfully</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-700 leading-relaxed text-left">
              Results saved to project storage. Confidence scores computed for all fields. AI memory updated with local context.
            </div>
            <button 
              onClick={onDismiss} 
              className="w-full bg-foreground text-background font-medium py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              View Results
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto" />
            <div className="space-y-1">
              <h2 className="text-xl font-medium text-foreground">
                {isStopping ? 'Finalizing Batch...' : 'AI Classifying RFIs'}
              </h2>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                {progress.status === 'queued' ? 'Initializing Pipeline' : `Processing ${progress.total} RFIs`}
              </p>
            </div>

            <div className="bg-muted/50 border border-border rounded-xl p-4 text-left space-y-3">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest block mb-2">Agent Pipeline</span>
              {steps.map((s, i) => {
                const isActive   = s.active;
                const isDoneStep = s.done;
                return (
                  <div key={s.id} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium shrink-0 ${
                      isDoneStep ? 'bg-emerald-500 text-white' : isActive ? 'bg-primary text-white animate-pulse' : 'bg-muted text-muted-foreground border border-border'
                    }`}>
                      {isDoneStep ? <CheckCircle2 className="w-3 h-3" /> : (i+1)}
                    </div>
                    <span className={`text-xs font-medium ${isDoneStep ? 'text-foreground' : isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-foreground">{progress.done} / {progress.total}</span>
                <span className="text-primary">{pct}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-1000" 
                  style={{ width: `${pct}%` }} 
                />
              </div>
              <p className="text-[10px] text-muted-foreground font-mono truncate h-4">
                {progress.current ? `> ${progress.current}` : ''}
              </p>
            </div>

            <button 
              onClick={onStop} 
              disabled={isStopping}
              className="w-full border border-destructive/30 bg-destructive/5 text-destructive font-medium py-2.5 rounded-xl hover:bg-destructive/10 transition-colors text-sm disabled:opacity-50"
            >
              {isStopping ? 'Stopping...' : 'Stop Classification'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

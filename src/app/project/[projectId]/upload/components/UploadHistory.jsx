'use client';
import { Table, FileUp, Trash2 } from 'lucide-react';

export default function UploadHistory({ files, statusConfig, onDelete }) {
  if (files.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-border bg-muted/20">
        <h3 className="text-[11px] font-semibold text-foreground uppercase tracking-wider flex items-center justify-between">
          3. Upload History
          <span className="bg-muted px-2 py-0.5 rounded text-[10px]">{files.length}</span>
        </h3>
      </div>
      <div className="divide-y divide-border max-h-[500px] overflow-y-auto scrollbar-themed">
        {files.map(f => {
          const status = statusConfig[f.status] || statusConfig.processing;
          const StatusIcon = status.icon;
          return (
            <div key={f.id} className="p-4 flex items-start gap-3 hover:bg-muted/10 transition-colors">
              <div className={`p-2 rounded-lg shrink-0 ${f.file_type === 'rfi_response_pdf' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                {f.file_type === 'rfi_response_pdf' ? <FileUp className="w-4 h-4" /> : <Table className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-foreground truncate" title={f.filename}>{f.filename}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
                  <span>{new Date(f.created_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="font-normal text-foreground/60">
                    {f.row_count > 0 ? `${f.row_count} records` : 'Extracting...'}
                  </span>
                </div>
                {f.error_msg && (
                  <p className="text-[11px] text-destructive mt-1.5 bg-destructive/5 px-2 py-1 rounded border border-destructive/10">
                    {f.error_msg}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold uppercase tracking-tight ${status.bg} ${status.color} ${status.border}`}>
                  <StatusIcon className={`w-3 h-3 ${f.status === 'processing' ? 'animate-spin' : ''}`} />
                  {f.status}
                </div>
                <button 
                  onClick={() => onDelete(f.id, f.filename)}
                  className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

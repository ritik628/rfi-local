import { Building2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProjectCard({ project, onDeleteClick }) {
  const router = useRouter();
  
  return (
    <div 
      className="card-base p-4 cursor-pointer hover:-translate-y-1 flex items-center justify-between group"
      onClick={() => router.push(`/project/${project.id}/dashboard`)}
    >
      <div className="flex items-center gap-4 flex-1 overflow-hidden">
        <div className="w-12 h-12 rounded-[12px] shrink-0 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <Building2 className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <div className="text-[16px] font-medium text-foreground tracking-tight truncate">{project.name}</div>
            {project.description && (
              <div className="text-[13px] text-muted-foreground truncate">
                &mdash; {project.description}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-[13px] text-muted-foreground">
            <span className="inline-flex items-center bg-primary/10 text-primary text-[11px] font-medium px-2 py-0.5 rounded-full border border-primary/20">
              {project.rfi_count ?? 0} RFIs
            </span>
            {project.client && <span className="truncate max-w-[150px]">Client: <span className="text-foreground">{project.client}</span></span>}
            {project.consultant && <span className="truncate max-w-[150px]">Consultant: <span className="text-foreground">{project.consultant}</span></span>}
            <span className="text-muted-foreground/40 shrink-0">•</span>
            <span className="shrink-0">{new Date(project.created_at).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}</span>
          </div>
        </div>
      </div>

      <button 
        className="opacity-0 group-hover:opacity-100 bg-transparent border-none cursor-pointer text-muted-foreground p-2 ml-4 rounded-lg transition-all hover:text-destructive hover:bg-destructive/10 shrink-0" 
        onClick={e => onDeleteClick(e, project)} 
        title="Delete project"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

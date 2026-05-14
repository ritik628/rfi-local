import React from "react";
import { Building2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  onDeleteClick: (e: React.MouseEvent, project: Project) => void;
}

export default function ProjectCard({ project, onDeleteClick }: ProjectCardProps) {
  const router = useRouter();

  return (
    <div
      className="card-base p-6 cursor-pointer hover:bg-muted/50 flex flex-col gap-5 group relative h-full transition-all hover:border-primary/30"
      onClick={() => router.push(`/project/${project.id}`)}
    >
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-[14px] shrink-0 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <Building2 className="w-6 h-6" />
        </div>

        <button
          className="opacity-0 group-hover:opacity-100 bg-transparent border-none cursor-pointer text-muted-foreground p-2 rounded-lg transition-all hover:text-destructive hover:bg-destructive/10 shrink-0"
          onClick={(e) => onDeleteClick(e, project)}
          title="Delete project"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        <div className="text-[17px] font-normal font-heading text-foreground tracking-tight line-clamp-1 leading-tight">
          {project.name}
        </div>
        {project.description && (
          <div className="text-sm text-muted-foreground line-clamp-2 leading-relaxed min-h-[40px]">
            {project.description}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-border/50 flex flex-col gap-3 mt-auto">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center bg-primary/10 text-primary text-[10px] font-medium px-2.5 py-0.5 rounded-full border border-primary/20 uppercase tracking-wider">
            {project.rfi_count ?? 0} RFIs
          </span>
          <span className="text-[11px] text-muted-foreground/60 font-normal ml-auto">
            {new Date(project.created_at).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>

        {(project.client || project.consultant) && (
          <div className="flex flex-col gap-1.5 text-[11px] text-muted-foreground/80 font-normal uppercase tracking-tight">
            {project.client && (
              <div className="flex justify-between items-center">
                <span>Client</span>
                <span className="text-foreground truncate max-w-[140px]">
                  {project.client}
                </span>
              </div>
            )}
            {project.consultant && (
              <div className="flex justify-between items-center">
                <span>Consultant</span>
                <span className="text-foreground truncate max-w-[140px]">
                  {project.consultant}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

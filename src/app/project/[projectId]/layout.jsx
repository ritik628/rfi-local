"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { getProjects } from "../../../services/api";
import SobhaLogo from "../../../components/ui/SobhaLogo";
import {
  LayoutDashboard,
  Upload,
  FileText,
  Tags,
  Bot,
  Settings2,
  Users,
  ArrowLeft,
} from "lucide-react";

const NAV = [
  {
    to: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-[18px] h-[18px]" />,
  },
  {
    to: "upload",
    label: "Upload Files",
    icon: <Upload className="w-[18px] h-[18px]" />,
  },
  {
    to: "rfi-log",
    label: "RFI Log",
    icon: <FileText className="w-[18px] h-[18px]" />,
  },
  {
    to: "categories",
    label: "Categories",
    icon: <Tags className="w-[18px] h-[18px]" />,
  },
  {
    to: "ai-agent",
    label: "AI Agent",
    icon: <Bot className="w-[18px] h-[18px]" />,
  },
  {
    to: "finetuning",
    label: "Fine-tuning",
    icon: <Settings2 className="w-[18px] h-[18px]" />,
  },
];

export default function ProjectLayout({ children }) {
  const params = useParams();
  const projectId = params?.projectId;
  const pathname = usePathname();
  const router = useRouter();

  const [project, setProject] = useState(null);

  useEffect(() => {
    if (projectId) {
      getProjects().then((ps) =>
        setProject(ps.find((p) => p.id === projectId)),
      );
    }
  }, [projectId]);

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-[242px] bg-sidebar border-r border-sidebar-border flex flex-col shrink-0 text-sidebar-foreground">
        {/* Brand */}
        <div className="p-[18px_16px_14px] border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <SobhaLogo size={36} />
            <div>
              <div className="text-[14.5px] font-bold text-sidebar-foreground tracking-tight leading-tight">
                RFI Intel
              </div>
              <div className="text-[11px] text-sidebar-foreground/60 mt-px">
                Design Defect AI
              </div>
            </div>
          </div>
        </div>

        {/* Active project chip */}
        {project && (
          <div className="p-[12px_16px] border-b border-sidebar-border bg-sidebar-accent/30">
            <div className="text-[10.5px] text-sidebar-foreground/50 uppercase tracking-widest mb-1 font-semibold">
              Active Project
            </div>
            <div className="text-[13.5px] font-bold text-sidebar-foreground truncate">
              {project.name}
            </div>
            <div className="text-[12px] text-sidebar-foreground/60 mt-0.5">
              {project.rfi_count ?? 0} RFIs loaded
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-[10px_10px] overflow-y-auto flex flex-col gap-0.5">
          {NAV.map(({ to, label, icon }) => {
            const isActive = pathname?.includes(`/project/${projectId}/${to}`);
            return (
              <Link
                key={to}
                href={`/project/${projectId}/${to}`}
                className={`flex items-center gap-[11px] p-[10px_14px] rounded-[10px] text-[14px] font-medium transition-all ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <span className="flex items-center justify-center shrink-0">
                  {icon}
                </span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Back link */}
        <div className="p-2.5 border-t border-sidebar-border">
          <button
            onClick={() => router.push("/")}
            className="flex w-full items-center gap-[11px] p-[10px_14px] rounded-[10px] text-[14px] font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
          >
            <ArrowLeft className="w-[18px] h-[18px] shrink-0" />
            All Projects
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        {children}
      </div>
    </div>
  );
}

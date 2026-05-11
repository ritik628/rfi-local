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

  // Close sidebar on navigation
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="p-[18px_16px_14px] border-b border-sidebar-border shrink-0">
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
        <div className="p-[12px_16px] border-b border-sidebar-border bg-sidebar-accent/30 shrink-0">
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
      <nav className="flex-1 p-[10px_10px] overflow-y-auto flex flex-col gap-0.5 scrollbar-themed">
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
      <div className="p-2.5 border-t border-sidebar-border shrink-0">
        <button
          onClick={() => router.push("/")}
          className="flex w-full items-center gap-[11px] p-[10px_14px] rounded-[10px] text-[14px] font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
        >
          <ArrowLeft className="w-[18px] h-[18px] shrink-0" />
          All Projects
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[242px] bg-sidebar border-r border-sidebar-border flex-col shrink-0 text-sidebar-foreground">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 w-[280px] bg-sidebar border-r border-sidebar-border z-[101] flex flex-col text-sidebar-foreground transform transition-transform duration-300 ease-in-out lg:hidden ${
          isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="absolute top-4 right-4 lg:hidden">
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-sidebar-foreground/50 hover:text-sidebar-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header / Top Bar */}
        <div className="lg:hidden h-[60px] bg-card border-b border-border flex items-center px-4 shrink-0 justify-between z-50">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className="h-0.5 bg-current rounded-full w-full" />
              <span className="h-0.5 bg-current rounded-full w-2/3" />
              <span className="h-0.5 bg-current rounded-full w-full" />
            </div>
          </button>
          
          <div className="flex items-center gap-2">
            <SobhaLogo size={24} />
            <span className="text-xs font-bold uppercase tracking-widest text-foreground/70">RFI Intel</span>
          </div>
          
          <div className="w-8" /> {/* Spacer */}
        </div>

        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {children}
        </main>
      </div>

      <style jsx global>{`
        .scrollbar-themed::-webkit-scrollbar { width: 4px; }
        .scrollbar-themed::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-themed::-webkit-scrollbar-thumb { background: oklch(0.4 0 0 / 0.1); border-radius: 10px; }
        .scrollbar-themed::-webkit-scrollbar-thumb:hover { background: oklch(0.4 0 0 / 0.2); }
      `}</style>
    </div>
  );
}

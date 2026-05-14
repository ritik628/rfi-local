"use client";

import { useState, useEffect } from "react";
import { usePathname, useParams } from "next/navigation";
import { getProjects } from "@/lib/api/api";
import SobhaLogo from "@/components/ui/SobhaLogo";
import AppSidebar from "@/components/layout/AppSidebar";
import MobileSheet from "@/components/layout/MobileSheet";

export default function ProjectLayout({ children }) {
  const params = useParams();
  const projectId = params?.projectId;
  const pathname = usePathname();

  const [project, setProject] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const isRfiLogModule = pathname?.includes(`/project/${projectId}/rfilog/`);
  const hideSidebar = !isRfiLogModule;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Desktop Sidebar */}
      {!hideSidebar && (
        <aside className="hidden lg:flex w-[242px] bg-[#09090b] border-r border-white/5 flex-col shrink-0 text-white">
          <AppSidebar project={project} projectId={projectId} />
        </aside>
      )}

      {/* Mobile Sidebar */}
      {!hideSidebar && (
        <MobileSheet isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen}>
          <AppSidebar project={project} projectId={projectId} />
        </MobileSheet>
      )}

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
            <span className="text-xs font-semibold uppercase tracking-widest text-foreground/70">RFI Intel</span>
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

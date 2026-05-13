'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import SobhaLogo from '@/components/ui/SobhaLogo';
import {
  LayoutDashboard,
  Upload,
  FileText,
  Tags,
  Bot,
  Settings2,
  ArrowLeft,
} from 'lucide-react';

const NAV = [
  {
    to: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-[18px] h-[18px]" />,
  },
  {
    to: 'upload',
    label: 'Upload Files',
    icon: <Upload className="w-[18px] h-[18px]" />,
  },
  {
    to: 'rfi-log',
    label: 'RFI Log',
    icon: <FileText className="w-[18px] h-[18px]" />,
  },
  {
    to: 'categories',
    label: 'Categories',
    icon: <Tags className="w-[18px] h-[18px]" />,
  },
  {
    to: 'ai-agent',
    label: 'AI Agent',
    icon: <Bot className="w-[18px] h-[18px]" />,
  },
  {
    to: 'finetuning',
    label: 'Fine-tuning',
    icon: <Settings2 className="w-[18px] h-[18px]" />,
  },
];

export default function AppSidebar({ project, projectId }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex flex-col h-full bg-[#09090b]">
      {/* Brand */}
      <div className="p-[20px_20px_16px] border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <SobhaLogo size={32} />
          <div>
            <div className="text-[14px] font-semibold text-white tracking-tight leading-tight">
              RFI Intel
            </div>
            <div className="text-[11px] text-white/40 mt-0.5 font-normal uppercase tracking-wider">
              Design Defect AI
            </div>
          </div>
        </div>
      </div>

      {/* Active project chip */}
      {project && (
        <div className="p-[16px_20px] border-b border-white/5 bg-white/[0.02] shrink-0">
          <div className="text-[11px] text-white/30 uppercase tracking-wider mb-1.5 font-semibold">
            Active Project
          </div>
          <div className="text-[13px] font-medium text-white/90 truncate">
            {project.name}
          </div>
          <div className="text-[11px] text-white/40 mt-1">
            {project.rfi_count ?? 0} RFIs loaded
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-[12px_12px] overflow-y-auto flex flex-col gap-1 scrollbar-themed">
        {NAV.map(({ to, label, icon }) => {
          const path = `/project/${projectId}/rfilog/${to}`;
          const isActive = pathname === path || pathname?.startsWith(`${path}/`);
          return (
            <Link
              key={to}
              href={path}
              className={`flex items-center gap-[12px] p-[9px_12px] rounded-[10px] text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className={`flex items-center justify-center shrink-0 transition-colors ${isActive ? 'text-white' : 'text-white/40'}`}>
                {icon}
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Back link */}
      <div className="p-3 border-t border-white/5 shrink-0">
        <button
          onClick={() => router.push("/projects")}
          className="flex w-full items-center gap-[12px] p-[10px_12px] rounded-[10px] text-sm font-medium text-white/50 hover:bg-white/5 hover:text-white transition-all"
        >
          <ArrowLeft className="w-[18px] h-[18px] shrink-0 opacity-40" />
          All Projects
        </button>
      </div>
    </div>
  );
}

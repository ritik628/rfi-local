'use client';

import { ArrowLeft } from 'lucide-react';
import SobhaLogo from '@/components/ui/SobhaLogo';

export default function MobileSheet({ isOpen, setIsOpen, children }) {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] lg:hidden animate-in fade-in duration-200"
        onClick={() => setIsOpen(false)}
      />

      <aside 
        className="fixed top-0 bottom-0 left-0 w-[280px] bg-[#09090b] border-r border-white/5 z-[101] flex flex-col text-white transform transition-transform duration-300 ease-in-out lg:hidden translate-x-0 shadow-2xl"
      >
        <div className="absolute top-4 right-4">
          <button onClick={() => setIsOpen(false)} className="p-2 text-sidebar-foreground/50 hover:text-sidebar-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        {children}
      </aside>
    </>
  );
}

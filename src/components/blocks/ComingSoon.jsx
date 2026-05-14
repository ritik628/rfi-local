"use client";

import React from "react";
import { Hammer, Sparkles, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ComingSoon({ title = "Module Under Construction" }) {
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background/50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-semibold uppercase tracking-widest mb-4">
          
          Development in Progress
        </div>

        <h1 className="text-3xl font-medium text-foreground tracking-tight mb-4">
          {title}
        </h1>
        
        <p className="text-muted-foreground text-[15px] leading-relaxed mb-10">
          We're currently building this module. Check back soon for updates!
        </p>

        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-muted hover:bg-muted/80 text-foreground text-sm font-medium transition-all duration-200 border border-border shadow-sm group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Go Back
        </button>
      </div>

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
    </div>
  );
}

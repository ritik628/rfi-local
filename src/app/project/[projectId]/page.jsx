"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { LayoutDashboard, FileText, Plus, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProjectHubPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId;

  const cards = [
    {
      id: "dashboard",
      title: "Main Dashboard",
      description: "Overall project overview (Coming Soon)",
      icon: <LayoutDashboard className="w-8 h-8 opacity-40" />,
      path: `/project/${projectId}/dashboard/home`,
      active: false,
    },
    {
      id: "rfi-log",
      title: "RFI Log Module",
      description: "Access the design defect analysis system",
      icon: <FileText className="w-8 h-8" />,
      path: `/project/${projectId}/rfilog/dashboard`,
      active: true,
    },
    {
      id: "null-1",
      title: "AI Agent",
      description: "Automated defect analysis (Coming Soon)",
      icon: <Lock className="w-8 h-8 opacity-20" />,
      path: `/project/${projectId}/coming-soon`,
      active: false,
    },
    {
      id: "null-2",
      title: "Categories",
      description: "Classification schema (Coming Soon)",
      icon: <Lock className="w-8 h-8 opacity-20" />,
      path: `/project/${projectId}/coming-soon`,
      active: false,
    },
    {
      id: "null-3",
      title: "Fine-tuning",
      description: "Model customization (Coming Soon)",
      icon: <Lock className="w-8 h-8 opacity-20" />,
      path: `/project/${projectId}/coming-soon`,
      active: false,
    },
    {
      id: "add",
      title: "Add Module",
      description: "Configure new feature",
      icon: <Plus className="w-8 h-8" />,
      active: true,
      isAction: true,
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background/50">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-semibold text-foreground tracking-tight mb-2">
            Project Workspace
          </h1>
          <p className="text-muted-foreground font-medium">
            Select a module to continue your analysis
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => card.active && card.path && router.push(card.path)}
              className={cn(
                "relative group flex flex-col items-center justify-center p-8 rounded-3xl border transition-all duration-300",
                card.active 
                  ? "cursor-pointer bg-muted/30 hover:bg-muted/50 border-border hover:border-border/80 shadow-sm"
                  : "bg-muted/10 border-border/50 opacity-60 cursor-not-allowed"
              )}
            >
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors",
                card.active 
                  ? "bg-muted-foreground/20 text-foreground group-hover:bg-muted-foreground/30"
                  : "bg-muted/50 text-muted-foreground"
              )}>
                {card.icon}
              </div>
              
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {card.title}
              </h3>
              <p className="text-xs text-muted-foreground text-center line-clamp-2 max-w-[160px]">
                {card.description}
              </p>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

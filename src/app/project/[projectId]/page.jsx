"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  BarChart3, 
  FileSearch, 
  ShieldCheck, 
  Users, 
  Layers,
  Plus 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProjectHubPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId;

  const cards = [
    {
      id: "dashboard",
      title: "Main Dashboard",
      description: "work in progress",
      icon: <BarChart3 className="w-8 h-8" />,
      path: `/project/${projectId}/dashboard`,
      active: true,
    },
    {
      id: "rfi-log",
      title: "RFI Log",
      description: "Pdf Consultant Classifier",
      icon: <FileSearch className="w-8 h-8" />,
      path: `/project/${projectId}/rfilog/dashboard`,
      active: true,
    },
    {
      id: "authority",
      title: "Authority Comments",
      description: "Own Setup of document uploaded, specifuc schema, Arabic to English, classify",
      icon: <ShieldCheck className="w-8 h-8" />,
      path: `/project/${projectId}/authority-comments`,
      active: true,
    },
    {
      id: "community",
      title: "Community Comments",
      description: "work in progress",
      icon: <Users className="w-8 h-8" />,
      path: `/project/${projectId}/community-comments`,
      active: true,
    },
    {
      id: "variations",
      title: "Design Variations",
      description: "work in progress",
      icon: <Layers className="w-8 h-8" />,
      path: `/project/${projectId}/design-variations`,
      active: true,
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
          <h1 className="text-3xl font-medium text-foreground tracking-tight mb-2">
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
              
              <h3 className="text-xl font-medium text-foreground mb-1">
                {card.title}
              </h3>
              <p className="text-sm font-normal text-muted-foreground text-center line-clamp-2 max-w-[160px]">
                {card.description}
              </p>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

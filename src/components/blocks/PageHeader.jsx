"use client";

import React from "react";

export default function PageHeader({ 
  title, 
  subtitle, 
  actions, 
  icon, 
  badge,
  className = "" 
}) {
  return (
    <header className={`bg-card border-b border-border p-3 md:p-[12px_48px] flex items-center justify-between shrink-0 ${className}`}>
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div className="shrink-0 scale-90 md:scale-100">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-heading font-semibold text-foreground tracking-tight truncate">
              {title}
            </h1>
            {badge && (
              <div className="shrink-0">
                {badge}
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-sm font-normal text-muted-foreground mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      
      {actions && (
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {actions}
        </div>
      )}
    </header>
  );
}

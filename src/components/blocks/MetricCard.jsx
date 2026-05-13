"use client";

import React from "react";

/**
 * MetricCard component for displaying key performance indicators.
 * Optimized for space by using a horizontal layout to avoid empty white space on the right.
 */
export default function MetricCard({ 
  label, 
  value, 
  sub, 
  icon, 
  accentColor, 
  onClick,
  className = ""
}) {
  return (
    <div 
      className={`card-base p-5 md:p-6 flex items-center justify-between ${className}`}
    >
      <div className="flex-1 min-w-0 pr-4">
        <div className="text-[13px] font-heading font-medium text-muted-foreground uppercase tracking-wider mb-2">
          {label}
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-3xl md:text-4xl font-sans font-light text-foreground leading-none tracking-tight">
            {value}
          </div>
          {sub && (
            <div className="text-[13px] text-muted-foreground font-normal truncate hidden sm:block">
              {sub}
            </div>
          )}
        </div>
        {sub && (
          <div className="text-[13px] text-muted-foreground mt-2 sm:hidden truncate">
            {sub}
          </div>
        )}
      </div>

      {icon && (
        <div className="text-muted-foreground shrink-0">
          {React.isValidElement(icon) ? React.cloneElement(icon, { size: 24, strokeWidth: 1.5 }) : icon}
        </div>
      )}
    </div>
  );
}

"use client";

import React from "react";
import {
  X,
  FileText,
  Info,
  Bot,
  MapPin,
  MessageSquare,
  AlertCircle,
} from "lucide-react";

export default function RFIViewerModal({ rfi, onDismiss }) {
  if (!rfi) return null;

  const rawConf = rfi.conf_overall || 0;
  const overall = Math.round(rawConf > 1 ? rawConf : rawConf * 100);

  const getConfColor = (val) => {
    if (val >= 85) return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (val >= 65) return "text-amber-600 bg-amber-50 border-amber-100";
    return "text-rose-600 bg-rose-50 border-rose-100";
  };

  const ConfidenceBadge = ({ value }) => {
    const val = Math.round(value > 1 ? value : value * 100);
    const color =
      val >= 85
        ? "text-emerald-600 bg-emerald-50 border-emerald-100"
        : val >= 65
          ? "text-amber-600 bg-amber-50 border-amber-100"
          : "text-rose-600 bg-rose-50 border-rose-100";
    return (
      <div
        className={`px-2 py-0.5 rounded-md border text-[10px] font-medium uppercase tracking-wider ${color}`}
      >
        {val}%
      </div>
    );
  };

  const DetailItem = ({
    label,
    value,
    icon: Icon,
    fullWidth = false,
    conf,
  }) => (
    <div
      className={`${fullWidth ? "col-span-full" : "col-span-1"} flex flex-col gap-1.5`}
    >
      <div className="flex items-center justify-between gap-2 px-0.5">
        <div className="flex items-center gap-2 text-[12px] font-medium text-muted-foreground/60 uppercase tracking-wider">
          {Icon && <Icon className="w-3 h-3" />}
          {label}
        </div>
        {conf !== undefined && <ConfidenceBadge value={conf} />}
      </div>
      <div className="bg-muted/10 border border-border/40 rounded-xl px-4 py-3 text-[13px] font-normal text-foreground/80 leading-relaxed min-h-[46px] flex items-center">
        {value || "-"}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-background/60 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-[600px] max-h-[90vh] rounded-[24px] shadow-2xl border border-border flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-card shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-[16px] font-medium text-foreground leading-tight">
                RFI Details
              </h2>
              <p className="text-[13px] text-muted-foreground font-normal">
                {rfi.rfi_ref}
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-themed">
          {/* Main Info Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Info size={14} className="text-primary" />
              <h3 className="text-[13px] font-medium text-foreground/70 uppercase tracking-wider">
                General Information
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <DetailItem label="RFI Reference" value={rfi.rfi_ref} />
              <DetailItem label="Discipline" value={rfi.discipline} />
              <DetailItem label="Subject" value={rfi.subject} fullWidth />
            </div>
          </section>

          {/* AI Insights Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Bot size={14} className="text-primary" />
                <h3 className="text-[13px] font-medium text-foreground/60 uppercase tracking-wider">
                  AI Classification
                </h3>
              </div>
              <div
                className={`px-3 py-1 rounded-full border text-[10px] font-medium ${getConfColor(overall)}`}
              >
                {overall}% CONFIDENCE
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-primary/[0.02] border border-primary/5 p-5 rounded-[20px]">
              <DetailItem
                label="Design Defect"
                value={rfi.human_design_defect || rfi.ai_design_defect}
                conf={rfi.conf_design_defect}
              />
              <DetailItem
                label="Location"
                value={rfi.human_location || rfi.ai_location}
                icon={MapPin}
                conf={rfi.conf_location}
              />
              <DetailItem
                label="Category"
                value={
                  rfi.human_next_level_category || rfi.ai_next_level_category
                }
                conf={rfi.conf_next_level_category}
              />
              <DetailItem
                label="Sub-Category"
                value={
                  rfi.human_sub_level_category || rfi.ai_sub_level_category
                }
                conf={rfi.conf_sub_level_category}
              />
            </div>
          </section>

          {/* Response Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <MessageSquare size={14} className="text-primary" />
              <h3 className="text-[13px] font-medium text-foreground/70 uppercase tracking-wider">
                Consultant Response
              </h3>
            </div>
            <div className="bg-muted/5 border border-border/40 rounded-2xl p-5 italic text-[13px] text-muted-foreground/80 leading-relaxed">
              {rfi.consultant_response ||
                "No response received for this record."}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

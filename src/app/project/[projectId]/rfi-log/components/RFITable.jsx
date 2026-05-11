"use client";
import { CheckCircle2, Bot, RefreshCw, Edit2 } from "lucide-react";
import { updateRFI } from "../../../../../services/api";

function ConfBar({ value, label }) {
  const colorClass =
    value >= 85
      ? "bg-emerald-500"
      : value >= 65
        ? "bg-amber-500"
        : "bg-destructive";
  const textColorClass =
    value >= 85
      ? "text-emerald-600"
      : value >= 65
        ? "text-amber-600"
        : "text-destructive";

  return (
    <div
      title={`${label}: ${value}%`}
      className="flex items-center gap-2 min-w-[80px]"
    >
      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span
        className={`text-[10px] font-bold ${textColorClass} tabular-nums w-7`}
      >
        {value}%
      </span>
    </div>
  );
}

export default function RFITable({
  rfis,
  selected,
  setSelected,
  selectedIds,
  toggleSelect,
  toggleSelectAll,
  discList,
  load,
  classify,
  reclassify,
  classifying,
  setCorrecting,
  setCorr,
  SEV_BG,
  SEV_COLOR,
  SEV_BORDER,
  SEVERITIES,
}) {
  return (
    <div className="flex-1 overflow-auto scrollbar-themed pb-20">
      <table className="w-full text-left border-separate border-spacing-0 min-w-[1400px]">
        <thead className="sticky top-0 z-10">
          <tr className="bg-muted/50 backdrop-blur-sm shadow-sm">
            <th className="p-[10px_14px] border-b border-border w-10 text-center">
              <input
                type="checkbox"
                className="rounded accent-primary"
                checked={rfis.length > 0 && selectedIds.size === rfis.length}
                onChange={toggleSelectAll}
              />
            </th>
            <th className="p-[10px_14px] border-b border-border text-[9.5px] font-bold text-muted-foreground uppercase tracking-widest w-40">
              RFI Reference
            </th>
            <th className="p-[10px_14px] border-b border-border text-[9.5px] font-bold text-muted-foreground uppercase tracking-widest w-36">
              Discipline
            </th>
            <th className="p-[10px_14px] border-b border-border text-[9.5px] font-bold text-muted-foreground uppercase tracking-widest">
              Subject
            </th>
            <th className="p-[10px_14px] border-b border-border text-[9.5px] font-bold text-muted-foreground uppercase tracking-widest w-44">
              Design Defect
            </th>
            <th className="p-[10px_14px] border-b border-border text-[9.5px] font-bold text-muted-foreground uppercase tracking-widest w-40">
              Confidence
            </th>
            <th className="p-[10px_14px] border-b border-border text-[9.5px] font-bold text-muted-foreground uppercase tracking-widest w-28 text-center">
              Severity
            </th>
            <th className="p-[10px_14px] border-b border-border text-[9.5px] font-bold text-muted-foreground uppercase tracking-widest w-28 text-center">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rfis.map((rfi) => {
            const overall = Math.round(rfi.conf_overall || 0);
            const isSel = selected?.id === rfi.id;
            const isChecked = selectedIds.has(rfi.id);

            return (
              <tr
                key={rfi.id}
                onClick={() => setSelected(isSel ? null : rfi)}
                className={`group hover:bg-muted/20 transition-colors cursor-pointer ${isChecked ? "bg-primary/[0.03]" : isSel ? "bg-muted/10" : ""}`}
              >
                <td
                  className="p-[10px_14px] text-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelect(rfi.id);
                  }}
                >
                  <input
                    type="checkbox"
                    className="rounded accent-primary"
                    checked={isChecked}
                    onChange={() => toggleSelect(rfi.id)}
                  />
                </td>
                <td className="p-[10px_14px] font-mono text-[10.5px] font-bold text-primary">
                  <div className="flex items-center gap-2">
                    {rfi.rfi_ref}
                  </div>
                </td>
                <td className="p-[10px_14px]" onClick={(e) => e.stopPropagation()}>
                  <select
                    className="bg-emerald-50 text-emerald-700/80 text-[9.5px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200/50 outline-none appearance-none cursor-pointer"
                    value={rfi.discipline}
                    onChange={(e) =>
                      updateRFI(rfi.id, { discipline: e.target.value }).then(
                        load,
                      )
                    }
                  >
                    {discList.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </td>
                <td className="p-[10px_14px]">
                  <div
                    className="text-[13px] font-medium text-foreground/70 leading-tight truncate max-w-[300px]"
                    title={rfi.subject}
                  >
                    {rfi.subject}
                  </div>
                </td>
                <td className="p-[10px_14px]">
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-foreground/60 leading-tight">
                      {rfi.human_design_defect || rfi.ai_design_defect || "—"}
                    </div>
                    {rfi.ai_classified && (
                      <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tight">
                        {rfi.ai_next_level_category}
                      </p>
                    )}
                  </div>
                </td>
                <td className="p-[10px_14px]">
                  {rfi.ai_classified ? (
                    <ConfBar value={overall} label="Overall" />
                  ) : (
                    <span className="text-[9.5px] font-bold text-muted-foreground/30 uppercase tracking-widest italic">
                      Pending
                    </span>
                  )}
                </td>
                <td
                  className="p-[10px_14px] text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  {rfi.ai_classified ? (
                    <select
                      className={`text-[9.5px] font-bold px-2.5 py-0.5 rounded-full border outline-none appearance-none cursor-pointer ${SEV_BG[rfi.ai_severity]} ${SEV_COLOR[rfi.ai_severity]} ${SEV_BORDER[rfi.ai_severity]}`}
                      value={rfi.ai_severity || "Medium"}
                      onChange={(e) =>
                        updateRFI(rfi.id, { ai_severity: e.target.value }).then(
                          load,
                        )
                      }
                    >
                      {SEVERITIES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-muted-foreground/20">—</span>
                  )}
                </td>
                <td
                  className="p-[10px_14px] text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-center gap-2">
                    {!rfi.ai_classified ? (
                      <button
                        className="bg-primary/10 text-primary hover:bg-primary hover:text-white p-1.5 rounded-lg transition-all"
                        onClick={() => classify(rfi)}
                        disabled={classifying[rfi.id]}
                      >
                        {classifying[rfi.id] ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Bot className="w-3.5 h-3.5" />
                        )}
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-all"
                          title="Manual Correction"
                          onClick={() => {
                            setCorrecting(rfi);
                            setCorr({
                              human_design_defect:
                                rfi.human_design_defect || rfi.ai_design_defect,
                              human_next_level_category:
                                rfi.human_next_level_category ||
                                rfi.ai_next_level_category,
                              human_sub_level_category:
                                rfi.human_sub_level_category ||
                                rfi.ai_sub_level_category,
                              human_location:
                                rfi.human_location || rfi.ai_location,
                              ai_severity: rfi.ai_severity || "Medium",
                            });
                          }}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="text-primary/60 hover:text-primary p-1.5 rounded-lg hover:bg-primary/5 transition-all"
                          title="Re-classify with AI"
                          onClick={() => reclassify(rfi)}
                          disabled={classifying[rfi.id]}
                        >
                          {classifying[rfi.id] === 're' ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

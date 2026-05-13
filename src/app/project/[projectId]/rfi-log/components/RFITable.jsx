"use client";
import { CheckCircle2, Bot, RefreshCw, Edit2 } from "lucide-react";
import { updateRFI } from "@/lib/api/api";

function ConfBar({ value, label }) {
  const colorVar =
    value >= 85
      ? "var(--chart-2)"
      : value >= 65
        ? "var(--chart-3)"
        : "var(--destructive)";

  return (
    <div
      title={`${label}: ${value}%`}
      className="flex items-center gap-2 min-w-[80px]"
    >
      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, backgroundColor: colorVar }}
        />
      </div>
      <span className="text-[11px] font-normal w-7" style={{ color: colorVar }}>
        {value}%
      </span>
    </div>
  );
}

function getDisciplineColor(discipline) {
  const d = (discipline || "").toLowerCase();
  if (d.includes("arch"))
    return "bg-blue-50 text-blue-700 border-blue-200/50 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50";
  if (d.includes("struct"))
    return "bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50";
  if (d.includes("mep"))
    return "bg-purple-50 text-purple-700 border-purple-200/50 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/50";
  if (d.includes("civil"))
    return "bg-slate-50 text-slate-700 border-slate-200/50 dark:bg-slate-800/20 dark:text-slate-400 dark:border-slate-700/50";
  if (d.includes("land"))
    return "bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50";
  if (d.includes("inter"))
    return "bg-rose-50 text-rose-700 border-rose-200/50 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/50";
  if (d.includes("facad"))
    return "bg-cyan-50 text-cyan-700 border-cyan-200/50 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-800/50";
  return "bg-primary/5 text-primary border-primary/20";
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
      <table className="w-full text-left border-collapse min-w-[1600px]">
        <thead className="sticky top-0 z-10">
          <tr className="bg-background/95 backdrop-blur-md">
            <th className="px-4 py-4 border-b border-border w-10 text-center">
              <input
                type="checkbox"
                className="rounded accent-primary cursor-pointer"
                checked={rfis.length > 0 && selectedIds.size === rfis.length}
                onChange={toggleSelectAll}
              />
            </th>
            <th className="px-4 py-4 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-12 text-center whitespace-nowrap">
              #
            </th>
            <th className="px-4 py-4 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-36 whitespace-nowrap">
              RFI Reference
            </th>
            <th className="px-4 py-4 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-28 whitespace-nowrap">
              Discipline
            </th>
            <th className="px-4 py-4 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider min-w-[200px] whitespace-nowrap">
              Subject
            </th>
            <th className="px-4 py-4 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-56 whitespace-nowrap">
              Design Defect
            </th>
            <th className="px-4 py-4 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-56 whitespace-nowrap">
              Category
            </th>
            <th className="px-4 py-4 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-56 whitespace-nowrap">
              Sub-Category
            </th>
            <th className="px-4 py-4 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-40 whitespace-nowrap">
              Location
            </th>
            <th className="px-4 py-4 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-28 text-center whitespace-nowrap">
              Confidence
            </th>
            <th className="px-4 py-4 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-28 text-center whitespace-nowrap">
              Severity
            </th>
            <th className="px-4 py-4 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-64 whitespace-nowrap">
              Consultant Response
            </th>
            <th className="px-4 py-4 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-24 text-center whitespace-nowrap">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rfis.map((rfi) => {
            const rawConf = rfi.conf_overall || 0;
            const overall = Math.round(rawConf > 1 ? rawConf : rawConf * 100);
            const isSel = selected?.id === rfi.id;
            const isChecked = selectedIds.has(rfi.id);

            return (
              <tr
                key={rfi.id}
                onClick={() => setSelected(isSel ? null : rfi)}
                className={`group hover:bg-muted/30 transition-colors ${isChecked ? "bg-primary/[0.02]" : isSel ? "bg-muted/10" : ""}`}
              >
                <td
                  className="px-4 py-3.5 text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    className="rounded accent-primary cursor-pointer"
                    checked={isChecked}
                    onChange={() => toggleSelect(rfi.id)}
                  />
                </td>
                <td className="px-4 py-3.5 text-[11px] font-medium text-muted-foreground/50 text-center">
                  {rfi.sr_no || "—"}
                </td>
                <td className="px-4 py-3.5 text-[11px] font-semibold text-primary/80">
                  {rfi.rfi_ref}
                </td>
                <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                  <div className="relative group/disc inline-block">
                    <div className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded-md border transition-all ${getDisciplineColor(rfi.discipline)}`}>
                      {rfi.discipline || "N/A"}
                    </div>
                    <select
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      value={rfi.discipline}
                      onChange={(e) =>
                        updateRFI(rfi.id, { discipline: e.target.value }).then(
                          load,
                        )
                      }
                    >
                      {!discList.map(d => d.toLowerCase()).includes(rfi.discipline?.toLowerCase()) && rfi.discipline && (
                        <option value={rfi.discipline}>{rfi.discipline}</option>
                      )}
                      {discList.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="text-[13px] font-medium text-foreground/80 leading-tight line-clamp-2" title={rfi.subject}>
                    {rfi.subject}
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  {rfi.ai_classified ? (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-semibold text-foreground/80 leading-tight">
                        {rfi.human_design_defect || rfi.ai_design_defect}
                      </div>
                      <ConfBar value={Math.round((rfi.conf_design_defect || 0) * (rfi.conf_design_defect < 1 ? 100 : 1))} label="Defect" />
                    </div>
                  ) : "—"}
                </td>
                <td className="px-4 py-3.5">
                  {rfi.ai_classified ? (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-medium text-muted-foreground leading-tight">
                        {rfi.human_next_level_category || rfi.ai_next_level_category}
                      </div>
                      <ConfBar value={Math.round((rfi.conf_next_level_category || 0) * (rfi.conf_next_level_category < 1 ? 100 : 1))} label="Category" />
                    </div>
                  ) : "—"}
                </td>
                <td className="px-4 py-3.5">
                  {rfi.ai_classified ? (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-medium text-muted-foreground leading-tight">
                        {rfi.human_sub_level_category || rfi.ai_sub_level_category || "N/A"}
                      </div>
                      <ConfBar value={Math.round((rfi.conf_sub_level_category || 0) * (rfi.conf_sub_level_category < 1 ? 100 : 1))} label="Sub-Category" />
                    </div>
                  ) : "—"}
                </td>
                <td className="px-4 py-3.5">
                  {rfi.ai_classified ? (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-medium text-muted-foreground truncate max-w-[140px]" title={rfi.human_location || rfi.ai_location}>
                        {rfi.human_location || rfi.ai_location || "Not specified"}
                      </div>
                      <ConfBar value={Math.round((rfi.conf_location || 0) * (rfi.conf_location < 1 ? 100 : 1))} label="Location" />
                    </div>
                  ) : "—"}
                </td>
                <td className="px-4 py-3.5 text-center">
                  {rfi.ai_classified ? (
                    <div className="inline-block">
                      <ConfBar value={overall} label="Overall" />
                    </div>
                  ) : (
                    <span className="text-[10px] text-muted-foreground/30 uppercase tracking-widest italic">Pending</span>
                  )}
                </td>
                <td
                  className="px-4 py-3.5 text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  {rfi.ai_classified ? (
                    <select
                      className={`text-[10px] font-sans font-bold px-2 py-0.5 rounded border outline-none appearance-none cursor-pointer ${SEV_BG[rfi.ai_severity]} ${SEV_COLOR[rfi.ai_severity]} ${SEV_BORDER[rfi.ai_severity]}`}
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
                <td className="px-4 py-3.5">
                  <div className="text-[11px] text-muted-foreground/60 leading-tight italic line-clamp-2" title={rfi.consultant_response}>
                    {rfi.consultant_response || "No response received"}
                  </div>
                </td>
                <td
                  className="px-4 py-3.5 text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    {!rfi.ai_classified ? (
                      <button
                        className="bg-primary text-white hover:opacity-90 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm transition-all"
                        onClick={() => classify(rfi)}
                        disabled={classifying[rfi.id]}
                      >
                        {classifying[rfi.id] ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          "Classify"
                        )}
                      </button>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          className="text-primary hover:bg-primary/5 p-1.5 rounded-lg transition-all"
                          title="Correct"
                          onClick={() => {
                            setCorrecting(rfi);
                            setCorr({
                              human_design_defect: rfi.human_design_defect || rfi.ai_design_defect,
                              human_next_level_category: rfi.human_next_level_category || rfi.ai_next_level_category,
                              human_sub_level_category: rfi.human_sub_level_category || rfi.ai_sub_level_category,
                              human_location: rfi.human_location || rfi.ai_location,
                              ai_severity: rfi.ai_severity || "Medium",
                            });
                          }}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="text-muted-foreground hover:bg-muted p-1.5 rounded-lg transition-all"
                          title="Re-classify"
                          onClick={() => reclassify(rfi)}
                          disabled={classifying[rfi.id]}
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${classifying[rfi.id] === 're' ? 'animate-spin' : ''}`} />
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

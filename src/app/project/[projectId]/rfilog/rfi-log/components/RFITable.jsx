"use client";
import { CheckCircle2, Bot, RefreshCw, Edit2, Eye } from "lucide-react";
import { updateRFI } from "@/lib/api/api";
import CustomSelect from "@/components/ui/CustomSelect";

function ConfBar({ value, label }) {
  const colorVar =
    value >= 85
      ? "#059669"
      : value >= 65
        ? "#d97706"
        : "#dc2626";

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
  return "bg-muted text-muted-foreground border-border/50";
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
  onView,
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
            <th className="px-4 py-4 border-b border-border text-[12px] font-semibold text-muted-foreground uppercase tracking-wider w-12 text-center whitespace-nowrap">
              #
            </th>
            <th className="px-4 py-4 border-b border-border text-[12px] font-semibold text-muted-foreground uppercase tracking-wider w-36 whitespace-nowrap">
              RFI Reference
            </th>
            <th className="px-4 py-4 border-b border-border text-[12px] font-semibold text-muted-foreground uppercase tracking-wider w-28 whitespace-nowrap">
              Discipline
            </th>
            <th className="px-4 py-4 border-b border-border text-[12px] font-semibold text-muted-foreground uppercase tracking-wider min-w-[200px] whitespace-nowrap">
              Subject
            </th>
            <th className="px-4 py-4 border-b border-border text-[12px] font-semibold text-muted-foreground uppercase tracking-wider w-56 whitespace-nowrap">
              Design Defect
            </th>
            <th className="px-4 py-4 border-b border-border text-[12px] font-semibold text-muted-foreground uppercase tracking-wider w-56 whitespace-nowrap">
              Category
            </th>
            <th className="px-4 py-4 border-b border-border text-[12px] font-semibold text-muted-foreground uppercase tracking-wider w-56 whitespace-nowrap">
              Sub-Category
            </th>
            <th className="px-4 py-4 border-b border-border text-[12px] font-semibold text-muted-foreground uppercase tracking-wider w-40 whitespace-nowrap">
              Location
            </th>
            <th className="px-4 py-4 border-b border-border text-[12px] font-semibold text-muted-foreground uppercase tracking-wider w-28 text-center whitespace-nowrap">
              Confidence
            </th>
            <th className="px-4 py-4 border-b border-border text-[12px] font-semibold text-muted-foreground uppercase tracking-wider w-64 whitespace-nowrap">
              Consultant Response
            </th>
            <th className="px-4 py-4 border-b border-border text-[12px] font-semibold text-muted-foreground uppercase tracking-wider w-32 text-center whitespace-nowrap">
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
                className={`group transition-colors ${isChecked ? "bg-primary/[0.02]" : isSel ? "bg-muted/10" : ""}`}
              >
                <td
                  className="px-4 py-3.5 text-center align-top pt-[18px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    className="rounded accent-primary cursor-pointer"
                    checked={isChecked}
                    onChange={() => toggleSelect(rfi.id)}
                  />
                </td>
                <td className="px-4 py-3.5 text-[13px] font-medium text-muted-foreground/50 text-center align-top pt-[18px]">
                  {rfi.sr_no || "-"}
                </td>
                <td className="px-4 py-3.5 text-[13px] font-medium text-primary align-top pt-[18px]">
                  {rfi.rfi_ref}
                </td>
                <td
                  className="px-4 py-3.5 align-top pt-[15px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div onClick={(e) => e.stopPropagation()}>
                    <CustomSelect
                      variant="minimal"
                      className="w-full min-w-[90px]"
                      triggerClassName={`!text-[13px] px-2 py-0.5 rounded-full border transition-all ${getDisciplineColor(rfi.discipline)}`}
                      options={discList.map((d) => ({ label: d, value: d }))}
                      value={rfi.discipline || ""}
                      onChange={(val) => updateRFI(rfi.id, { discipline: val }).then(load)}
                      placeholder="N/A"
                    />
                  </div>
                </td>
                <td className="px-4 py-3.5 align-top pt-[18px]">
                  <div
                    className="text-[13px] text-foreground/80 leading-tight line-clamp-2"
                    title={rfi.subject}
                  >
                    {rfi.subject}
                  </div>
                </td>
                <td className="px-4 py-3.5 align-top h-px">
                  {rfi.ai_classified ? (
                    <div className="flex flex-col h-full justify-between">
                      <div className="text-[13px] text-foreground/70 leading-tight mb-2 min-h-[34px]">
                        {rfi.human_design_defect || rfi.ai_design_defect}
                      </div>
                      <ConfBar
                        value={Math.round(
                          (rfi.conf_design_defect || 0) *
                            (rfi.conf_design_defect < 1 ? 100 : 1),
                        )}
                        label="Defect"
                      />
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-3.5 align-top h-px">
                  {rfi.ai_classified ? (
                    <div className="flex flex-col h-full justify-between">
                      <div className="text-[13px] text-foreground/70 leading-tight mb-2 min-h-[34px]">
                        {rfi.human_next_level_category ||
                          rfi.ai_next_level_category}
                      </div>
                      <ConfBar
                        value={Math.round(
                          (rfi.conf_next_level_category || 0) *
                            (rfi.conf_next_level_category < 1 ? 100 : 1),
                        )}
                        label="Category"
                      />
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-3.5 align-top h-px">
                  {rfi.ai_classified ? (
                    <div className="flex flex-col h-full justify-between">
                      <div className="text-[13px] text-foreground/70 leading-tight mb-2 min-h-[34px]">
                        {rfi.human_sub_level_category ||
                          rfi.ai_sub_level_category ||
                          "N/A"}
                      </div>
                      <ConfBar
                        value={Math.round(
                          (rfi.conf_sub_level_category || 0) *
                            (rfi.conf_sub_level_category < 1 ? 100 : 1),
                        )}
                        label="Sub-Category"
                      />
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-3.5 align-top h-px">
                  {rfi.ai_classified ? (
                    <div className="flex flex-col h-full justify-between">
                      <div
                        className="text-[13px] text-foreground/70 leading-tight mb-2 truncate max-w-[140px] min-h-[34px]"
                        title={rfi.human_location || rfi.ai_location}
                      >
                        {rfi.human_location ||
                          rfi.ai_location ||
                          "Not specified"}
                      </div>
                      <ConfBar
                        value={Math.round(
                          (rfi.conf_location || 0) *
                            (rfi.conf_location < 1 ? 100 : 1),
                        )}
                        label="Location"
                      />
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-3.5 align-top h-px">
                  {rfi.ai_classified ? (
                    <div className="flex flex-col h-full justify-end">
                      <div className="min-h-[34px] mb-2" />
                      <div className="inline-block">
                        <ConfBar value={overall} label="Overall" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col h-full justify-end">
                      <div className="min-h-[34px] mb-2" />
                      <span className="text-[10px] text-muted-foreground/30 uppercase tracking-widest italic mb-1">
                        Pending
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3.5 align-top pt-[18px]">
                  <div
                    className="text-[13px] text-muted-foreground/60 leading-tight italic line-clamp-2"
                    title={rfi.consultant_response}
                  >
                    {rfi.consultant_response || "No response received"}
                  </div>
                </td>
                <td
                  className="px-4 py-3.5 text-center align-top pt-[15px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    {!rfi.ai_classified ? (
                      <div className="flex items-center gap-1">
                        <button
                          className="w-8 h-8 flex items-center justify-center text-foreground/80 hover:text-foreground hover:bg-muted transition-all"
                          title="View Details"
                          onClick={(e) => {
                            e.stopPropagation();
                            onView(rfi);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="bg-primary text-white hover:opacity-90 px-2 py-1 rounded text-[10px] font-medium uppercase tracking-wider shadow-sm transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            classify(rfi);
                          }}
                          disabled={classifying[rfi.id]}
                        >
                          {classifying[rfi.id] ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            "Classify"
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          className="w-8 h-8 flex items-center justify-center text-foreground/80 hover:text-foreground hover:bg-muted transition-all"
                          title="View Details"
                          onClick={(e) => {
                            e.stopPropagation();
                            onView(rfi);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="w-8 h-8 flex items-center justify-center text-foreground/80 hover:text-primary hover:bg-primary/5 transition-all"
                          title="Correct"
                          onClick={(e) => {
                            e.stopPropagation();
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
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          className="w-8 h-8 flex items-center justify-center text-foreground/80 hover:text-foreground hover:bg-muted transition-all"
                          title="Re-classify"
                          onClick={(e) => {
                            e.stopPropagation();
                            reclassify(rfi);
                          }}
                          disabled={classifying[rfi.id]}
                        >
                          <RefreshCw
                            className={`w-4 h-4 ${classifying[rfi.id] === "re" ? "animate-spin" : ""}`}
                          />
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

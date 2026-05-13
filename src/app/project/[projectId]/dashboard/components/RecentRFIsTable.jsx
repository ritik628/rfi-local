import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

function getDisciplineColor(discipline) {
  const d = (discipline || "").toLowerCase();
  if (d.includes("arch")) return "bg-blue-50 text-blue-700 border-blue-200/50 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50";
  if (d.includes("struct")) return "bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50";
  if (d.includes("mep")) return "bg-purple-50 text-purple-700 border-purple-200/50 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/50";
  if (d.includes("civil")) return "bg-slate-50 text-slate-700 border-slate-200/50 dark:bg-slate-800/20 dark:text-slate-400 dark:border-slate-700/50";
  if (d.includes("land")) return "bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50";
  if (d.includes("inter")) return "bg-rose-50 text-rose-700 border-rose-200/50 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/50";
  if (d.includes("facad")) return "bg-cyan-50 text-cyan-700 border-cyan-200/50 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-800/50";
  return "bg-primary/5 text-primary border-primary/20";
}

export default function RecentRFIsTable({ rfis }) {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId;

  return (
    <div className="card-base p-4 md:p-[22px] overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <div className="text-[13.5px] font-normal text-foreground">
          Recent RFIs
        </div>
        <Link
          href={`/project/${projectId}/rfi-log`}
          className="bg-transparent border-none text-primary text-[13px] cursor-pointer font-normal hover:underline no-underline"
        >
          View all →
        </Link>
      </div>
      <div className="overflow-x-auto scrollbar-themed pb-2">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-card border-b border-border">
                RFI Ref
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                Subject
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                Discipline
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                Design Defect
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                Confidence
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {rfis
              .slice(-6)
              .reverse()
              .map((r) => {
                const rawConf = r.conf_overall || 0;
                const conf = Math.round(rawConf > 1 ? rawConf : rawConf * 100);
                const confColor =
                   conf >= 85
                    ? "var(--chart-2)"
                    : conf >= 65
                      ? "var(--chart-3)"
                      : "var(--destructive)";
                return (
                  <tr
                    key={r.id}
                    onClick={() => router.push(`/project/${projectId}/rfi-log`)}
                    className="border-b border-border hover:bg-muted/30 transition-colors group"
                  >
                    <td className="sticky left-0 z-10 px-4 py-3.5 text-[11px] font-medium text-primary bg-card group-hover:bg-muted/30 transition-colors shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                      {r.rfi_ref}
                    </td>
                    <td className="px-4 py-3.5 text-[14px] text-foreground/80 max-w-[250px] truncate">
                      {r.subject}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${getDisciplineColor(r.discipline)}`}>
                        {r.discipline}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[12px] text-foreground/70">
                      {r.ai_design_defect || (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {r.ai_classified ? (
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${conf}%`,
                                backgroundColor: confColor,
                              }}
                            />
                          </div>
                          <span
                            className="text-[11px] font-normal"
                            style={{ color: confColor }}
                          >
                            {conf}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-[11px] italic uppercase tracking-wider opacity-30">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                          r.status === "Closed" ? "bg-primary/10 text-primary" : 
                          r.status === "Pending" ? "bg-amber-100 text-amber-700" : 
                          r.status === "Approved" ? "bg-emerald-100 text-emerald-700" : 
                          r.status === "Rejected" ? "bg-rose-100 text-rose-700" : 
                          "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

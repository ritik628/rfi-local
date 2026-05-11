import { useRouter } from "next/navigation";

export default function RecentRFIsTable({ rfis }) {
  const router = useRouter();

  return (
    <div className="card-base p-4 md:p-[22px] overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <div className="text-[13.5px] font-semibold text-foreground">
          Recent RFIs
        </div>
        <button
          onClick={() => router.push(`../rfi-log`)}
          className="bg-transparent border-none text-primary text-[13px] cursor-pointer font-medium hover:underline"
        >
          View all →
        </button>
      </div>
      <div className="overflow-x-auto scrollbar-themed pb-2">
        <table className="w-full text-left border-collapse text-[13.5px] min-w-[700px]">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 p-3 text-[12px] font-semibold text-muted-foreground bg-card border-b border-border shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                RFI Ref
              </th>
              <th className="p-3 text-[12px] font-semibold text-muted-foreground bg-muted/50 border-b border-border">
                Subject
              </th>
              <th className="p-3 text-[12px] font-semibold text-muted-foreground bg-muted/50 border-b border-border">
                Discipline
              </th>
              <th className="p-3 text-[12px] font-semibold text-muted-foreground bg-muted/50 border-b border-border">
                Design Defect
              </th>
              <th className="p-3 text-[12px] font-semibold text-muted-foreground bg-muted/50 border-b border-border">
                Confidence
              </th>
              <th className="p-3 text-[12px] font-semibold text-muted-foreground bg-muted/50 border-b border-border">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {rfis
              .slice(-6)
              .reverse()
              .map((r) => {
                const conf = Math.round(r.conf_overall || 0);
                const confColor =
                  conf >= 85
                    ? "var(--color-chart-2)"
                    : conf >= 65
                      ? "var(--color-chart-3)"
                      : "var(--color-destructive)";
                return (
                  <tr
                    key={r.id}
                    onClick={() => router.push(`../rfi-log`)}
                    className="border-b border-border hover:bg-muted/30 cursor-pointer transition-colors group"
                  >
                    <td className="sticky left-0 z-10 p-3 font-mono text-[11.5px] text-primary bg-card group-hover:bg-muted/30 transition-colors shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      {r.rfi_ref}
                    </td>
                    <td className="p-3 text-foreground max-w-[250px] truncate">
                      {r.subject}
                    </td>
                    <td className="p-3">
                      <span className="bg-primary/10 text-primary text-[11px] font-semibold px-2 py-0.5 rounded-full">
                        {r.discipline}
                      </span>
                    </td>
                    <td className="p-3 text-[12px] text-foreground">
                      {r.ai_design_defect || (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-3">
                      {r.ai_classified ? (
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${conf}%`,
                                backgroundColor: confColor,
                              }}
                            />
                          </div>
                          <span
                            className="text-[11px] font-bold"
                            style={{ color: confColor }}
                          >
                            {conf}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-[12px]">
                          —
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${r.status === "Closed" ? "bg-primary/10 text-primary" : r.status === "Pending" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}
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

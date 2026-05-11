export default function ConfidenceBreakdown({ highConf, needsReview, lowConf, total, classified }) {
  const breakdown = [
    [
      "High ≥85%",
      highConf,
      "var(--color-chart-2)",
      "bg-primary/5 text-primary",
    ],
    [
      "Medium 65–84%",
      needsReview - lowConf,
      "var(--color-chart-3)",
      "bg-primary/5 text-primary",
    ],
    [
      "Low <65%",
      lowConf,
      "var(--color-destructive)",
      "bg-destructive/10 text-destructive",
    ],
    [
      "Unclassified",
      total - classified,
      "var(--color-muted-foreground)",
      "bg-muted text-muted-foreground",
    ],
  ];

  return (
    <div className="card-base p-4 md:p-[16px_22px] mb-4 md:mb-6 flex gap-4 md:gap-7 items-center flex-wrap">
      <div className="text-xs md:text-[13px] font-semibold text-foreground w-full md:w-auto">
        Confidence Breakdown
      </div>
      {breakdown.map(([label, count, color, bgClass]) => (
        <div key={label} className="flex items-center gap-2">
          <div
            className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="text-[11px] md:text-[12.5px] font-medium text-muted-foreground whitespace-nowrap">
            {label}:
          </span>
          <span
            className={`text-xs md:text-[13px] font-bold px-2 py-0.5 rounded-full ${bgClass}`}
          >
            {count}
          </span>
        </div>
      ))}
    </div>
  );
}

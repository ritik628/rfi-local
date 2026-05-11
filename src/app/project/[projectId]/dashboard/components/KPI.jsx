export default function KPI({ label, value, sub, icon, iconColor, borderTopColor, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`card-base p-4 md:p-[18px_20px] transition-all relative overflow-hidden group ${onClick ? "cursor-pointer hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5" : ""}`}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ backgroundColor: borderTopColor }}
      />
      <div className="text-[20px] md:text-[24px] mb-2" style={{ color: iconColor }}>
        {icon}
      </div>
      <div className="text-[22px] md:text-[26px] font-semibold text-foreground leading-none">
        {value}
      </div>
      <div className="text-xs md:text-[13px] font-semibold text-muted-foreground mt-1">
        {label}
      </div>
      {sub && (
        <div className="text-[10px] md:text-[11px] font-medium text-muted-foreground/70 mt-1">{sub}</div>
      )}
    </div>
  );
}

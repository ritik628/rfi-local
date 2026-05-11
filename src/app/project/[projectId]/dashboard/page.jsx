"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getRFIs } from "../../../../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  FileText,
  CheckCircle2,
  Clock,
  Lock,
  Target,
  ArrowRight,
  AlertTriangle,
  BarChart3,
  PieChart as PieChartIcon,
  Layers,
} from "lucide-react";
import KPI from "./components/KPI";
import ConfidenceBreakdown from "./components/ConfidenceBreakdown";
import RecentRFIsTable from "./components/RecentRFIsTable";

export default function DashboardPage() {
  const params = useParams();
  const projectId = params?.projectId;
  const router = useRouter();
  const [data, setData] = useState({ rfis: [], total: 0 });

  useEffect(() => {
    if (projectId) {
      getRFIs(projectId, { per_page: 500 })
        .then(setData)
        .catch(() => {});
    }
  }, [projectId]);

  const rfis = data.rfis || [];
  const classified = rfis.filter((r) => r.ai_classified);
  const pending = rfis.filter((r) => r.status === "Pending");
  const closed = rfis.filter((r) => r.status === "Closed");
  const highConf = classified.filter((r) => (r.conf_overall || 0) >= 85);
  const lowConf = classified.filter((r) => (r.conf_overall || 0) < 65);
  const needsReview = classified.filter((r) => (r.conf_overall || 0) < 85);

  const catMap = {};
  rfis.forEach((r) => {
    if (r.ai_design_defect)
      catMap[r.ai_design_defect] = (catMap[r.ai_design_defect] || 0) + 1;
  });
  const catData = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({
      name: name.length > 24 ? name.slice(0, 24) + "…" : name,
      count,
    }));

  const discMap = {};
  rfis.forEach((r) => {
    if (r.discipline) discMap[r.discipline] = (discMap[r.discipline] || 0) + 1;
  });
  const discData = Object.entries(discMap).map(([name, value]) => ({
    name,
    value,
  }));

  const severityMap = {};
  rfis.forEach((r) => {
    if (r.ai_severity)
      severityMap[r.ai_severity] = (severityMap[r.ai_severity] || 0) + 1;
  });
  const sevData = Object.entries(severityMap).map(([name, value]) => ({
    name,
    value,
  }));
  const sevColors = {
    Critical: "var(--color-destructive)",
    High: "var(--color-chart-4)",
    Medium: "var(--color-chart-3)",
    Low: "var(--color-chart-2)",
  };

  return (
    <div className="flex-1 overflow-y-auto bg-muted/20 scrollbar-themed">
      <div className="bg-card border-b border-border p-3 md:p-[12px_24px] flex items-center justify-between shrink-0">
        <div>
          <div className="text-base md:text-[17px] font-semibold text-foreground tracking-tight">
            Dashboard
          </div>
          <div className="text-[10px] md:text-[12px] font-medium text-muted-foreground mt-0.5">
            Live project overview — {data.total} total RFIs
          </div>
        </div>
      </div>

      <div className="p-3 md:p-[18px_22px]">
        {/* Alert banner */}
        {lowConf.length > 0 && (
          <div
            onClick={() => router.push(`../rfi-log`)}
            className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl p-2.5 md:p-[10px_16px] mb-3 md:mb-4 flex flex-col md:flex-row md:items-center gap-2 md:gap-3 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
          >
            <div className="flex items-center gap-2 md:gap-3 flex-1">
              <AlertTriangle className="text-amber-600 w-4 h-4 shrink-0" />
              <div className="flex-1">
                <span className="text-[11px] md:text-[12.5px] text-amber-800 dark:text-amber-500 font-semibold block md:inline">
                  {lowConf.length} RFIs need manual review
                </span>
                <span className="text-[11px] md:text-[12px] text-amber-700 dark:text-amber-600 font-medium block md:inline md:mt-0 mt-0.5">
                  {" "}
                  — AI confidence below 65%. Click to review.
                </span>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-amber-600 hidden md:block" />
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 md:gap-3 mb-3 md:mb-4">
          <KPI
            label="Total RFIs"
            value={data.total}
            icon={<FileText />}
            iconColor="var(--color-chart-1)"
            borderTopColor="var(--color-chart-1)"
            sub="across all disciplines"
          />
          <KPI
            label="AI Classified"
            value={classified.length}
            icon={<CheckCircle2 />}
            iconColor="var(--color-chart-2)"
            borderTopColor="var(--color-chart-2)"
            sub={`${data.total ? Math.round((classified.length / data.total) * 100) : 0}% complete`}
          />
          <KPI
            label="Pending Review"
            value={pending.length}
            icon={<Clock />}
            iconColor="var(--color-chart-3)"
            borderTopColor="var(--color-chart-3)"
            onClick={() => router.push(`../rfi-log`)}
          />
          <KPI
            label="Closed"
            value={closed.length}
            icon={<Lock />}
            iconColor="var(--color-muted-foreground)"
            borderTopColor="var(--color-muted-foreground)"
          />
          <KPI
            label="High Confidence"
            value={highConf.length}
            icon={<Target />}
            iconColor="var(--color-chart-4)"
            borderTopColor="var(--color-chart-4)"
            sub="≥ 85% confidence"
          />
        </div>

        {/* Confidence summary strip */}
        <ConfidenceBreakdown 
          highConf={highConf.length}
          needsReview={needsReview.length}
          lowConf={lowConf.length}
          total={data.total}
          classified={classified.length}
        />

        {/* Charts row */}
        <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-3 md:gap-4 mb-3 md:mb-4">
          <div className="card-base p-3 md:p-[18px] flex flex-col">
            <div className="flex items-center gap-2 mb-4 md:mb-5">
              <div className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center">
                <BarChart3 className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="text-[12px] font-semibold text-foreground uppercase tracking-wider">
                Design Defect Categories
              </div>
            </div>
            {catData.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-10 text-muted-foreground text-[13px] border-2 border-dashed border-border/50 rounded-xl">
                <BarChart3 className="w-8 h-8 mb-2 opacity-20" />
                Classify RFIs to see category breakdown
              </div>
            ) : (
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={catData}
                    layout="vertical"
                    margin={{ left: 0, right: 30, top: 0, bottom: 0 }}
                    barSize={24}
                  >
                    <XAxis
                      type="number"
                      hide
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={120}
                      tick={{ fontSize: 11, fill: "var(--foreground)", fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-card border border-border shadow-xl rounded-lg p-3 text-[12px]">
                              <div className="font-semibold mb-1">{payload[0].payload.name}</div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].color }} />
                                <span>{payload[0].value} RFIs</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {catData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={`var(--chart-${(i % 5) + 1})`}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 md:gap-4">
            <div className="card-base p-3 md:p-4 flex flex-col min-h-[200px]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center">
                  <PieChartIcon className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="text-[12px] font-semibold text-foreground uppercase tracking-wider">
                  By Discipline
                </div>
              </div>
              {discData.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-5 text-muted-foreground text-[12px] border-2 border-dashed border-border/50 rounded-xl">
                  No data available
                </div>
              ) : (
                <div className="flex-1 flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-4">
                  <div className="relative w-full sm:w-[180px] lg:w-full xl:w-1/2 h-[160px] sm:h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={discData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={2}
                          stroke="none"
                        >
                          {discData.map((_, i) => (
                            <Cell
                              key={i}
                              fill={`var(--chart-${(i % 5) + 1})`}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-card border border-border shadow-xl rounded-lg p-2 text-[11px] z-50">
                                  <div className="font-semibold">{payload[0].name}</div>
                                  <div className="text-muted-foreground">{payload[0].value} RFIs</div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <div className="text-[18px] font-bold text-foreground">
                        {discData.reduce((acc, d) => acc + d.value, 0)}
                      </div>
                      <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">
                        Total RFIs
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 w-full flex flex-col gap-2.5">
                    {discData.slice(0, 5).map((d, i) => (
                      <div key={d.name} className="flex items-center justify-between group">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: `var(--chart-${(i % 5) + 1})` }} />
                          <span className="text-[12px] font-medium text-foreground/80 group-hover:text-foreground transition-colors truncate">
                            {d.name}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-muted-foreground shrink-0 ml-2">
                          {Math.round((d.value / discData.reduce((acc, curr) => acc + curr.value, 0)) * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="card-base p-3 md:p-4 flex-1 overflow-hidden">
              <div className="text-[12px] font-semibold text-foreground mb-2.5">
                By Severity
              </div>
              {sevData.length === 0 ? (
                <div className="text-center py-5 text-muted-foreground text-[12px]">
                  No classified RFIs
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {sevData.map(({ name, value }) => (
                    <div
                      key={name}
                      className="flex-1 min-w-[60px] md:min-w-[70px] rounded-lg p-1.5 md:p-[6px_12px] text-center"
                      style={{
                        backgroundColor: `${sevColors[name]}15`,
                        border: `1.5px solid ${sevColors[name]}30`,
                      }}
                    >
                      <div
                        className="text-[18px] md:text-[20px] font-semibold"
                        style={{ color: sevColors[name] }}
                      >
                        {value}
                      </div>
                      <div
                        className="text-[10px] font-medium"
                        style={{ color: sevColors[name] }}
                      >
                        {name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent RFIs */}
        <RecentRFIsTable rfis={rfis} />
      </div>
    </div>
  );
}

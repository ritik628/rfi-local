'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getRFIs } from '../../../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { FileText, CheckCircle2, Clock, Lock, Target, ArrowRight, AlertTriangle } from 'lucide-react';

function KPI({ label, value, sub, icon, iconColor, borderTopColor, onClick }) {
  return (
    <div 
      onClick={onClick} 
      className={`bg-card border border-border rounded-[14px] p-[18px_20px] transition-all relative overflow-hidden group ${onClick ? 'cursor-pointer hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5' : ''}`}
    >
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ backgroundColor: borderTopColor }} />
      <div className="text-[24px] mb-2" style={{ color: iconColor }}>{icon}</div>
      <div className="text-[26px] font-semibold text-foreground leading-none">{value}</div>
      <div className="text-[13px] font-semibold text-muted-foreground mt-1">{label}</div>
      {sub && <div className="text-[11px] text-muted-foreground/70 mt-1">{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const params = useParams();
  const projectId = params?.projectId;
  const router = useRouter();
  const [data, setData] = useState({ rfis:[], total:0 });

  useEffect(() => { 
    if (projectId) {
      getRFIs(projectId, { per_page:500 }).then(setData).catch(() => {});
    }
  }, [projectId]);

  const rfis = data.rfis || [];
  const classified = rfis.filter(r => r.ai_classified);
  const pending = rfis.filter(r => r.status === 'Pending');
  const closed = rfis.filter(r => r.status === 'Closed');
  const highConf = classified.filter(r => (r.conf_overall||0) >= 85);
  const lowConf = classified.filter(r => (r.conf_overall||0) < 65);
  const needsReview = classified.filter(r => (r.conf_overall||0) < 85);

  const catMap = {};
  rfis.forEach(r => { if (r.ai_design_defect) catMap[r.ai_design_defect] = (catMap[r.ai_design_defect]||0)+1 });
  const catData = Object.entries(catMap).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([name,count]) => ({ name:name.length>24?name.slice(0,24)+'…':name, count }));

  const discMap = {};
  rfis.forEach(r => { if (r.discipline) discMap[r.discipline]=(discMap[r.discipline]||0)+1 });
  const discData = Object.entries(discMap).map(([name,value]) => ({ name, value }));

  const severityMap = {};
  rfis.forEach(r => { if (r.ai_severity) severityMap[r.ai_severity]=(severityMap[r.ai_severity]||0)+1 });
  const sevData = Object.entries(severityMap).map(([name,value]) => ({ name, value }));
  const sevColors = { Critical:'var(--color-destructive)', High:'var(--color-chart-4)', Medium:'var(--color-chart-3)', Low:'var(--color-chart-2)' };

  return (
    <div className="flex-1 overflow-y-auto bg-muted/20 scrollbar-themed">
      <div className="bg-card border-b border-border p-[18px_30px] flex items-center justify-between shrink-0">
        <div>
          <div className="text-[19px] font-semibold text-foreground tracking-tight">Dashboard</div>
          <div className="text-[13px] text-muted-foreground mt-1">Live project overview — {data.total} total RFIs</div>
        </div>
      </div>

      <div className="p-[24px_28px]">
        {/* Alert banner */}
        {lowConf.length > 0 && (
          <div onClick={() => router.push(`../rfi-log`)} className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl p-[12px_18px] mb-6 flex items-center gap-3 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
            <AlertTriangle className="text-amber-600 w-5 h-5 shrink-0" />
            <div className="flex-1">
              <span className="text-[13.5px] text-amber-800 dark:text-amber-500 font-semibold">{lowConf.length} RFIs need manual review</span>
              <span className="text-[13px] text-amber-700 dark:text-amber-600"> — AI confidence below 65%. Click to review.</span>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-600" />
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <KPI label="Total RFIs" value={data.total} icon={<FileText />} iconColor="var(--color-chart-1)" borderTopColor="var(--color-chart-1)" sub="across all disciplines" />
          <KPI label="AI Classified" value={classified.length} icon={<CheckCircle2 />} iconColor="var(--color-chart-2)" borderTopColor="var(--color-chart-2)" sub={`${data.total ? Math.round(classified.length/data.total*100):0}% complete`} />
          <KPI label="Pending Review" value={pending.length} icon={<Clock />} iconColor="var(--color-chart-3)" borderTopColor="var(--color-chart-3)" onClick={() => router.push(`../rfi-log`)} />
          <KPI label="Closed" value={closed.length} icon={<Lock />} iconColor="var(--color-muted-foreground)" borderTopColor="var(--color-muted-foreground)" />
          <KPI label="High Confidence" value={highConf.length} icon={<Target />} iconColor="var(--color-chart-4)" borderTopColor="var(--color-chart-4)" sub="≥ 85% confidence" />
        </div>

        {/* Confidence summary strip */}
        <div className="bg-card border border-border rounded-[14px] p-[16px_22px] mb-6 flex gap-7 items-center flex-wrap">
          <div className="text-[13px] font-semibold text-foreground">Confidence Breakdown</div>
          {[
            ['High ≥85%', highConf.length, 'var(--color-chart-2)', 'bg-primary/5 text-primary'],
            ['Medium 65–84%', needsReview.length - lowConf.length, 'var(--color-chart-3)', 'bg-primary/5 text-primary'],
            ['Low <65%', lowConf.length, 'var(--color-destructive)', 'bg-destructive/10 text-destructive'],
            ['Unclassified', data.total - classified.length, 'var(--color-muted-foreground)', 'bg-muted text-muted-foreground'],
          ].map(([label, count, color, bgClass]) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[12.5px] text-muted-foreground">{label}:</span>
              <span className={`text-[13px] font-bold px-2 py-0.5 rounded-full ${bgClass}`}>{count}</span>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-[1.4fr_1fr] gap-5 mb-5">
          <div className="bg-card border border-border rounded-[14px] p-[22px]">
            <div className="text-[13.5px] font-semibold text-foreground mb-4">Design Defect Categories</div>
            {catData.length === 0 ? <div className="text-center py-10 text-muted-foreground text-[13px]">Classify RFIs to see category breakdown</div> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={catData} layout="vertical" margin={{ left:8, right:20 }}>
                  <XAxis type="number" tick={{ fontSize:10, fill:'var(--color-muted-foreground)' }} />
                  <YAxis type="category" dataKey="name" width={170} tick={{ fontSize:11, fill:'var(--color-foreground)' }} />
                  <Tooltip contentStyle={{ fontSize:12, borderRadius:8, border:'1px solid var(--color-border)', background:'var(--color-card)', color:'var(--color-foreground)' }} cursor={{ fill: 'var(--color-muted)' }} />
                  <Bar dataKey="count" radius={[0,6,6,0]}>
                    {catData.map((_,i) => <Cell key={i} fill={`var(--color-chart-${(i%5)+1})`} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex flex-col gap-5">
            <div className="bg-card border border-border rounded-[14px] p-5 flex-1">
              <div className="text-[13.5px] font-semibold text-foreground mb-3">By Discipline</div>
              {discData.length === 0 ? <div className="text-center py-5 text-muted-foreground text-[12px]">No data</div> : (
                <ResponsiveContainer width="100%" height={110}>
                  <PieChart>
                    <Pie data={discData} dataKey="value" nameKey="name" cx="40%" cy="50%" outerRadius={48} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                      {discData.map((_,i) => <Cell key={i} fill={`var(--color-chart-${(i%5)+1})`} />)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize:12, borderRadius:8, border:'1px solid var(--color-border)', background:'var(--color-card)', color:'var(--color-foreground)' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="bg-card border border-border rounded-[14px] p-5 flex-1">
              <div className="text-[13.5px] font-semibold text-foreground mb-3">By Severity</div>
              {sevData.length === 0 ? <div className="text-center py-5 text-muted-foreground text-[12px]">No classified RFIs</div> : (
                <div className="flex flex-wrap gap-2">
                  {sevData.map(({ name, value }) => (
                    <div key={name} className="flex-1 min-w-[80px] rounded-xl p-[8px_14px] text-center" style={{ backgroundColor:`${sevColors[name]}15`, border:`1.5px solid ${sevColors[name]}30` }}>
                      <div className="text-[22px] font-semibold" style={{ color: sevColors[name] }}>{value}</div>
                      <div className="text-[11px] font-medium" style={{ color: sevColors[name] }}>{name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent RFIs */}
        <div className="bg-card border border-border rounded-[14px] p-[22px]">
          <div className="flex justify-between items-center mb-4">
            <div className="text-[13.5px] font-semibold text-foreground">Recent RFIs</div>
            <button onClick={() => router.push(`../rfi-log`)} className="bg-transparent border-none text-primary text-[13px] cursor-pointer font-medium hover:underline">View all →</button>
          </div>
          <div className="overflow-x-auto scrollbar-themed pb-2">
            <table className="w-full text-left border-collapse text-[13.5px]">
              <thead>
                <tr>
                  <th className="p-3 text-[12px] font-semibold text-muted-foreground bg-muted/50 border-b border-border">RFI Ref</th>
                  <th className="p-3 text-[12px] font-semibold text-muted-foreground bg-muted/50 border-b border-border">Subject</th>
                  <th className="p-3 text-[12px] font-semibold text-muted-foreground bg-muted/50 border-b border-border">Discipline</th>
                  <th className="p-3 text-[12px] font-semibold text-muted-foreground bg-muted/50 border-b border-border">Design Defect</th>
                  <th className="p-3 text-[12px] font-semibold text-muted-foreground bg-muted/50 border-b border-border">Confidence</th>
                  <th className="p-3 text-[12px] font-semibold text-muted-foreground bg-muted/50 border-b border-border">Status</th>
                </tr>
              </thead>
              <tbody>
                {rfis.slice(-6).reverse().map(r => {
                  const conf = Math.round(r.conf_overall||0);
                  const confColor = conf>=85?'var(--color-chart-2)':conf>=65?'var(--color-chart-3)':'var(--color-destructive)';
                  return (
                    <tr key={r.id} onClick={() => router.push(`../rfi-log`)} className="border-b border-border hover:bg-muted/30 cursor-pointer transition-colors group">
                      <td className="p-3 font-mono text-[11.5px] text-primary">{r.rfi_ref}</td>
                      <td className="p-3 text-foreground max-w-[200px] truncate">{r.subject}</td>
                      <td className="p-3"><span className="bg-primary/10 text-primary text-[11px] font-semibold px-2 py-0.5 rounded-full">{r.discipline}</span></td>
                      <td className="p-3 text-[12px] text-foreground">{r.ai_design_defect || <span className="text-muted-foreground">—</span>}</td>
                      <td className="p-3">
                        {r.ai_classified ? (
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width:`${conf}%`, backgroundColor:confColor }} />
                            </div>
                            <span className="text-[11px] font-bold" style={{ color:confColor }}>{conf}%</span>
                          </div>
                        ) : <span className="text-muted-foreground text-[12px]">—</span>}
                      </td>
                      <td className="p-3">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${r.status==='Closed'?'bg-primary/10 text-primary':r.status==='Pending'?'bg-amber-100 text-amber-700':'bg-blue-100 text-blue-700'}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

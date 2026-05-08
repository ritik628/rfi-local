import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getRFIs } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts'

const COLORS = ['#1D4ED8','#7C3AED','#0891B2','#059669','#DC2626','#D97706','#EC4899','#84CC16','#F97316','#06B6D4']

function KPI({ label, value, sub, color, icon, onClick }) {
  return (
    <div onClick={onClick} style={{ background:'#fff', border:'1.5px solid #E9EDF5', borderRadius:14, padding:'18px 20px', cursor:onClick?'pointer':undefined, transition:'all 0.2s', borderTop:`3px solid ${color}` }}
      onMouseEnter={e => onClick && (e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,0.07)')}
      onMouseLeave={e => onClick && (e.currentTarget.style.boxShadow='none')}>
      <div style={{ fontSize:24, marginBottom:8 }}>{icon}</div>
      <div style={{ fontSize:26, fontWeight:800, color:'#0F172A', lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:13, fontWeight:600, color:'#374151', marginTop:4 }}>{label}</div>
      {sub && <div style={{ fontSize:11, color:'#9CA3AF', marginTop:3 }}>{sub}</div>}
    </div>
  )
}

export default function DashboardPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState({ rfis:[], total:0 })

  useEffect(() => { getRFIs(projectId, { per_page:500 }).then(setData).catch(() => {}) }, [projectId])

  const rfis = data.rfis
  const classified = rfis.filter(r => r.ai_classified)
  const pending = rfis.filter(r => r.status === 'Pending')
  const closed = rfis.filter(r => r.status === 'Closed')
  const highConf = classified.filter(r => (r.conf_overall||0) >= 85)
  const lowConf = classified.filter(r => (r.conf_overall||0) < 65)
  const needsReview = classified.filter(r => (r.conf_overall||0) < 85)

  const catMap = {}
  rfis.forEach(r => { if (r.ai_design_defect) catMap[r.ai_design_defect] = (catMap[r.ai_design_defect]||0)+1 })
  const catData = Object.entries(catMap).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([name,count]) => ({ name:name.length>24?name.slice(0,24)+'…':name, count }))

  const discMap = {}
  rfis.forEach(r => { if (r.discipline) discMap[r.discipline]=(discMap[r.discipline]||0)+1 })
  const discData = Object.entries(discMap).map(([name,value]) => ({ name, value }))

  const severityMap = {}
  rfis.forEach(r => { if (r.ai_severity) severityMap[r.ai_severity]=(severityMap[r.ai_severity]||0)+1 })
  const sevData = Object.entries(severityMap).map(([name,value]) => ({ name, value }))
  const sevColors = { Critical:'#DC2626', High:'#EA580C', Medium:'#D97706', Low:'#16A34A' }

  return (
    <div style={{ flex:1, overflowY:'auto', background:'#F4F6FA' }}>
      <div className="page-header">
        <div><div className="page-title">Dashboard</div><div className="page-sub">Live project overview — {data.total} total RFIs</div></div>
      </div>

      <div style={{ padding:'24px 28px' }}>
        {/* Alert banner */}
        {lowConf.length > 0 && (
          <div onClick={() => navigate('../rfi-log')} style={{ background:'#FFFBEB', border:'1.5px solid #FDE68A', borderRadius:12, padding:'12px 18px', marginBottom:22, display:'flex', alignItems:'center', gap:12, cursor:'pointer' }}>
            <span style={{ fontSize:18 }}>⚠️</span>
            <div style={{ flex:1 }}>
              <span style={{ fontSize:13.5, color:'#92400E', fontWeight:600 }}>{lowConf.length} RFIs need manual review</span>
              <span style={{ fontSize:13, color:'#92400E' }}> — AI confidence below 65%. Click to review.</span>
            </div>
            <span style={{ fontSize:12, color:'#B45309' }}>→</span>
          </div>
        )}

        {/* KPIs */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14, marginBottom:24 }}>
          <KPI label="Total RFIs" value={data.total} color="#1D4ED8" icon="📋" sub="across all disciplines" />
          <KPI label="AI Classified" value={classified.length} color="#10B981" icon="✅" sub={`${data.total ? Math.round(classified.length/data.total*100):0}% complete`} />
          <KPI label="Pending Review" value={pending.length} color="#F59E0B" icon="⏳" onClick={() => navigate('../rfi-log')} />
          <KPI label="Closed" value={closed.length} color="#6B7280" icon="🔒" />
          <KPI label="High Confidence" value={highConf.length} color="#7C3AED" icon="🎯" sub="≥ 85% confidence" />
        </div>

        {/* Confidence summary strip */}
        <div style={{ background:'#fff', border:'1.5px solid #E9EDF5', borderRadius:14, padding:'16px 22px', marginBottom:24, display:'flex', gap:28, alignItems:'center', flexWrap:'wrap' }}>
          <div style={{ fontSize:13, fontWeight:600, color:'#374151' }}>Confidence Breakdown</div>
          {[
            ['High ≥85%', highConf.length, '#10B981', '#ECFDF5'],
            ['Medium 65–84%', needsReview.length - lowConf.length, '#F59E0B', '#FFFBEB'],
            ['Low <65%', lowConf.length, '#EF4444', '#FEF2F2'],
            ['Unclassified', data.total - classified.length, '#9CA3AF', '#F9FAFB'],
          ].map(([label, count, color, bg]) => (
            <div key={label} style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:color }} />
              <span style={{ fontSize:12.5, color:'#6B7280' }}>{label}:</span>
              <span style={{ fontSize:13, fontWeight:700, color:'#111827', background:bg, padding:'1px 8px', borderRadius:20 }}>{count}</span>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:18, marginBottom:18 }}>
          <div className="card" style={{ padding:22 }}>
            <div style={{ fontSize:13.5, fontWeight:700, color:'#0F172A', marginBottom:18 }}>Design Defect Categories</div>
            {catData.length === 0 ? <div style={{ textAlign:'center', padding:'40px 0', color:'#CBD5E1', fontSize:13 }}>Classify RFIs to see category breakdown</div> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={catData} layout="vertical" margin={{ left:8, right:20 }}>
                  <XAxis type="number" tick={{ fontSize:10, fill:'#9CA3AF' }} />
                  <YAxis type="category" dataKey="name" width={170} tick={{ fontSize:11, fill:'#374151' }} />
                  <Tooltip contentStyle={{ fontSize:12, borderRadius:8, border:'1px solid #E5E7EB' }} />
                  <Bar dataKey="count" radius={[0,6,6,0]}>
                    {catData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <div className="card" style={{ padding:20, flex:1 }}>
              <div style={{ fontSize:13.5, fontWeight:700, color:'#0F172A', marginBottom:14 }}>By Discipline</div>
              {discData.length === 0 ? <div style={{ textAlign:'center', padding:'20px 0', color:'#CBD5E1', fontSize:12 }}>No data</div> : (
                <ResponsiveContainer width="100%" height={110}>
                  <PieChart>
                    <Pie data={discData} dataKey="value" nameKey="name" cx="40%" cy="50%" outerRadius={48} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                      {discData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="card" style={{ padding:20, flex:1 }}>
              <div style={{ fontSize:13.5, fontWeight:700, color:'#0F172A', marginBottom:14 }}>By Severity</div>
              {sevData.length === 0 ? <div style={{ textAlign:'center', padding:'20px 0', color:'#CBD5E1', fontSize:12 }}>No classified RFIs</div> : (
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {sevData.map(({ name, value }) => (
                    <div key={name} style={{ background:sevColors[name]+'15', border:`1.5px solid ${sevColors[name]}30`, borderRadius:10, padding:'8px 14px', textAlign:'center', flex:'1 0 80px' }}>
                      <div style={{ fontSize:22, fontWeight:800, color:sevColors[name] }}>{value}</div>
                      <div style={{ fontSize:11, color:sevColors[name], fontWeight:600 }}>{name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent RFIs */}
        <div className="card" style={{ padding:22 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div style={{ fontSize:13.5, fontWeight:700, color:'#0F172A' }}>Recent RFIs</div>
            <button onClick={() => navigate('../rfi-log')} style={{ background:'none', border:'none', color:'#1D4ED8', fontSize:13, cursor:'pointer', fontFamily:'inherit', fontWeight:500 }}>View all →</button>
          </div>
          <table>
            <thead><tr><th>RFI Ref</th><th>Subject</th><th>Discipline</th><th>Design Defect</th><th>Confidence</th><th>Status</th></tr></thead>
            <tbody>
              {rfis.slice(-6).reverse().map(r => {
                const conf = Math.round(r.conf_overall||0)
                const confColor = conf>=85?'#10B981':conf>=65?'#F59E0B':'#EF4444'
                return (
                  <tr key={r.id} onClick={() => navigate('../rfi-log')} style={{ cursor:'pointer' }}>
                    <td style={{ fontFamily:'monospace', fontSize:11.5, color:'#1D4ED8' }}>{r.rfi_ref}</td>
                    <td style={{ maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.subject}</td>
                    <td><span style={{ background:'#F0FDF4', color:'#15803D', fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:20 }}>{r.discipline}</span></td>
                    <td style={{ fontSize:12 }}>{r.ai_design_defect || <span style={{ color:'#D1D5DB' }}>—</span>}</td>
                    <td>
                      {r.ai_classified ? (
                        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                          <div style={{ width:50, height:5, background:'#F1F5F9', borderRadius:3, overflow:'hidden' }}>
                            <div style={{ width:`${conf}%`, height:'100%', background:confColor, borderRadius:3 }} />
                          </div>
                          <span style={{ fontSize:11, fontWeight:700, color:confColor }}>{conf}%</span>
                        </div>
                      ) : <span style={{ color:'#D1D5DB', fontSize:12 }}>—</span>}
                    </td>
                    <td>
                      <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:20, background:r.status==='Closed'?'#F0FDF4':r.status==='Pending'?'#FFFBEB':'#EFF6FF', color:r.status==='Closed'?'#15803D':r.status==='Pending'?'#92400E':'#1D4ED8' }}>
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
  )
}

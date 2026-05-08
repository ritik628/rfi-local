import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getRFIs, classifyRFI, reclassifyRFI, classifyAll, stopClassify, reclassifyBatch,
         getClassifyProgress, updateRFI, exportExcel, addExample, getTeamMembers, getCategories,
         getDisciplines, addDiscipline, deleteDiscipline } from '../services/api'
import toast from 'react-hot-toast'

const DEFAULT_DISC = ['Civil','MEP','Façade','Structure','Landscape','Architecture','Interior Design']
const SEVERITIES = ['Critical','High','Medium','Low']
const SEV_COLOR = { Critical:'#DC2626', High:'#EA580C', Medium:'#D97706', Low:'#16A34A' }
const ST_COLOR = { Pending:'#F59E0B', 'In Review':'#3B82F6', Closed:'#10B981', 'On Hold':'#6B7280' }

function ConfBar({ value, label }) {
  const color = value>=85?'#10B981':value>=65?'#F59E0B':'#EF4444'
  return (
    <div title={`${label}: ${value}%`} style={{ display:'flex', alignItems:'center', gap:7 }}>
      <div style={{ width:52, height:5, background:'#F1F5F9', borderRadius:3, overflow:'hidden' }}>
        <div style={{ width:`${value}%`, height:'100%', background:color, borderRadius:3, transition:'width 0.5s ease' }} />
      </div>
      <span style={{ fontSize:11, fontWeight:700, color, minWidth:28 }}>{value}%</span>
    </div>
  )
}

// Full-screen classify modal
function ClassifyModal({ progress, onDismiss, onStop }) {
  if (!progress) return null
  const pct = progress.total > 0 ? Math.round(progress.done / progress.total * 100) : 0
  const isDone     = progress.status === 'done'
  const isError    = progress.status === 'error'
  const isStopped  = progress.status === 'stopped'
  const isRunning  = progress.status === 'running'
  const isStopping = progress.status === 'stopping'

  // Steps: only "Fetch" turns green once we start; the AI steps spin while running,
  // then all go green when complete.
  const steps = [
    { id:'fetch',    label:'Fetching RFI data',            done: progress.status !== 'queued', active: false },
    { id:'gpt52',    label:'GPT-5.2 analysing',            done: isDone, active: isRunning || isStopping },
    { id:'gpt54',    label:'GPT-5.4 analysing (ensemble)', done: isDone, active: isRunning || isStopping },
    { id:'ensemble', label:'Ensemble comparison',          done: isDone, active: isRunning || isStopping },
    { id:'save',     label:'Saving to Azure SQL',          done: isDone, active: isRunning || isStopping },
  ]

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.75)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:300 }}>
      <div style={{ background:'#fff', borderRadius:22, padding:'38px 42px', width:540, maxWidth:'calc(100vw - 32px)', boxShadow:'0 28px 80px rgba(0,0,0,0.25)', textAlign:'center' }}>

        {isDone ? (
          <>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:22 }}>
              <svg width="64" height="64" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="30" fill="#F0FDF4" stroke="#10B981" strokeWidth="1.5" />
                <polyline points="20,32 28,40 44,24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ fontSize:22, fontWeight:800, color:'#0F172A', marginBottom:8 }}>Classification Complete!</div>
            <div style={{ fontSize:14.5, color:'#6B7280', marginBottom:6 }}>{progress.done} RFIs classified</div>
            {progress.errors > 0 && <div style={{ fontSize:12.5, color:'#EA580C', marginBottom:8 }}>⚠ {progress.errors} RFIs failed (check console)</div>}
            <div style={{ marginBottom:28, padding:'10px 16px', background:'#F0FDF4', border:'1.5px solid #BBF7D0', borderRadius:10, fontSize:13, color:'#15803D' }}>
              Results saved · Confidence scores computed · AI memory updated
            </div>
            <button onClick={onDismiss} className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:'13px' }}>View Results →</button>
          </>
        ) : isError ? (
          <>
            <div style={{ fontSize:38, marginBottom:16 }}>⚠️</div>
            <div style={{ fontSize:20, fontWeight:800, color:'#DC2626', marginBottom:8 }}>Classification Error</div>
            <div style={{ fontSize:13, color:'#6B7280', marginBottom:20 }}>{progress.error_msg || 'An unexpected error occurred. Check the server console.'}</div>
            <div style={{ marginBottom:20, padding:'8px 14px', background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:8, fontSize:12.5, color:'#DC2626' }}>
              {progress.done} of {progress.total} were classified before the error.
            </div>
            <button onClick={onDismiss} className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:'12px' }}>Dismiss</button>
          </>
        ) : isStopped ? (
          <>
            <div style={{ fontSize:38, marginBottom:16 }}>🛑</div>
            <div style={{ fontSize:20, fontWeight:800, color:'#F59E0B', marginBottom:8 }}>Classification Stopped</div>
            <div style={{ fontSize:14, color:'#6B7280', marginBottom:20 }}>
              Stopped after classifying <strong>{progress.done}</strong> of {progress.total} RFIs.
            </div>
            <div style={{ marginBottom:24, padding:'10px 16px', background:'#FFFBEB', border:'1.5px solid #FDE68A', borderRadius:10, fontSize:13, color:'#92400E' }}>
              Progress was saved. Resume by clicking Reclassify All again.
            </div>
            <button onClick={onDismiss} className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:'13px' }}>View Results →</button>
          </>
        ) : (
          <>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:24 }}>
              <div style={{ width:54, height:54, border:'3.5px solid #EFF6FF', borderTopColor:'#1D4ED8', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
            </div>
            <div style={{ fontSize:20, fontWeight:800, color:'#0F172A', marginBottom:6 }}>
              {isStopping ? 'Stopping after current batch…' : 'AI Classifying RFIs…'}
            </div>
            <div style={{ fontSize:12.5, color:'#9CA3AF', marginBottom:20 }}>
              {progress.status === 'queued' ? 'Queued — starting shortly…' : `Batch processing with ${progress.total} RFIs`}
            </div>

            {/* Agent pipeline steps */}
            <div style={{ background:'#F8FAFC', border:'1px solid #E9EDF5', borderRadius:12, padding:'14px 18px', marginBottom:20, textAlign:'left' }}>
              <div style={{ fontSize:10.5, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.6px', fontWeight:700, marginBottom:10 }}>Multi-Agent Pipeline</div>
              {steps.map((s, i) => {
                const isActive   = s.active
                const isDoneStep = s.done
                return (
                  <div key={s.id} style={{ display:'flex', alignItems:'center', gap:10, marginBottom: i < steps.length-1 ? 8 : 0 }}>
                    <div style={{ width:20, height:20, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700,
                      background: isDoneStep ? '#10B981' : isActive ? '#1D4ED8' : '#E5E7EB',
                      color: isDoneStep || isActive ? '#fff' : '#9CA3AF',
                      border: isActive ? '2px solid #BFDBFE' : 'none',
                    }}>
                      {isDoneStep ? '✓' : isActive ? <span style={{ display:'inline-block', animation:'spin 0.8s linear infinite' }}>↻</span> : (i+1)}
                    </div>
                    <span style={{ fontSize:12.5, color: isDoneStep ? '#374151' : isActive ? '#1D4ED8' : '#94A3B8', fontWeight: isActive ? 700 : 400 }}>{s.label}</span>
                  </div>
                )
              })}
            </div>

            {/* Progress bar */}
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
              <span style={{ fontSize:13, color:'#374151', fontWeight:600 }}>{progress.done} / {progress.total} RFIs</span>
              <span style={{ fontSize:13, fontWeight:800, color:'#1D4ED8' }}>{pct}%</span>
            </div>
            <div style={{ height:8, background:'#EFF6FF', borderRadius:6, overflow:'hidden', marginBottom:12 }}>
              <div style={{ height:'100%', background:'linear-gradient(90deg,#1D4ED8,#7C3AED)', borderRadius:6, width:`${pct}%`, transition:'width 1s ease' }} />
            </div>
            <div style={{ fontSize:11.5, color:'#94A3B8', fontFamily:'monospace', marginBottom:16, minHeight:16 }}>
              {progress.current ? `→ ${progress.current}` : '…'}
            </div>
            {progress.errors > 0 && <div style={{ fontSize:12, color:'#EA580C', marginBottom:8 }}>⚠ {progress.errors} error(s) — classification continues</div>}

            {/* Stop button */}
            <button
              onClick={onStop}
              disabled={isStopping}
              style={{ width:'100%', padding:'10px', borderRadius:10, border:'1.5px solid #FECACA', background: isStopping ? '#F9FAFB' : '#FEF2F2', color: isStopping ? '#9CA3AF' : '#DC2626', fontSize:13.5, fontWeight:700, cursor: isStopping ? 'not-allowed' : 'pointer', fontFamily:'inherit', transition:'all 0.15s' }}>
              {isStopping ? '⏳ Stopping after current batch…' : '⏹ Stop Classification'}
            </button>
          </>
        )}
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

function DisciplineModal({ projectId, disciplines, onUpdate, onClose }) {
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    const name = newName.trim()
    if (!name) return
    setLoading(true)
    try {
      await addDiscipline(projectId, name)
      setNewName('')
      const updated = await getDisciplines(projectId)
      onUpdate(updated)
      toast.success(`'${name}' added`)
    } catch {}
    setLoading(false)
  }

  const handleDelete = async (d) => {
    if (!window.confirm(`Delete discipline "${d.name}"? This won't change existing RFI data.`)) return
    try {
      await deleteDiscipline(projectId, d.id)
      const updated = await getDisciplines(projectId)
      onUpdate(updated)
      toast.success(`'${d.name}' removed`)
    } catch {}
  }

  const loadDefaults = async () => {
    setLoading(true)
    try {
      for (const name of DEFAULT_DISC) {
        try { await addDiscipline(projectId, name) } catch {}
      }
      const updated = await getDisciplines(projectId)
      onUpdate(updated)
      toast.success('Defaults loaded')
    } catch {}
    setLoading(false)
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal fade-up" style={{ width:440 }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize:17, fontWeight:800, color:'#0F172A', marginBottom:4 }}>Manage Disciplines</div>
        <div style={{ fontSize:12.5, color:'#94A3B8', marginBottom:16 }}>
          Project-specific disciplines for RFI filtering and assignment
        </div>

        {disciplines.length === 0 ? (
          <div style={{ textAlign:'center', padding:'18px 0', marginBottom:12 }}>
            <div style={{ fontSize:13, color:'#9CA3AF', marginBottom:12 }}>No disciplines configured for this project.</div>
            <button onClick={loadDefaults} disabled={loading} className="btn-ghost"
              style={{ fontSize:12.5 }}>
              {loading ? '…' : '⚡ Load Defaults'}
            </button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:14, maxHeight:280, overflowY:'auto' }}>
            {disciplines.map(d => (
              <div key={d.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', background:'#F8FAFC', borderRadius:8, border:'1px solid #E9EDF5' }}>
                <span style={{ flex:1, fontSize:13.5, color:'#374151', fontWeight:500 }}>{d.name}</span>
                <button onClick={() => handleDelete(d)}
                  style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:6, color:'#DC2626', padding:'3px 9px', fontSize:11.5, cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ display:'flex', gap:8, marginBottom:14 }}>
          <input className="input" style={{ flex:1, fontSize:13 }} placeholder="New discipline name…"
            value={newName} onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()} />
          <button className="btn-primary" onClick={handleAdd} disabled={loading || !newName.trim()}
            style={{ flexShrink:0, padding:'0 16px' }}>
            {loading ? '…' : '+ Add'}
          </button>
        </div>

        <div style={{ display:'flex', gap:8 }}>
          {disciplines.length === 0 && null}
          <button onClick={onClose} className="btn-ghost"
            style={{ flex:1, justifyContent:'center', fontSize:13 }}>Close</button>
        </div>
      </div>
    </div>
  )
}

export default function RFILogPage() {
  const { projectId } = useParams()
  const [data, setData] = useState({ rfis:[], total:0, unclassified_total:0 })
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [disc, setDisc] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState(null)
  const [classifying, setClassifying] = useState({})
  const [teamMembers, setTeamMembers] = useState(['Unassigned'])
  const [bulkRunning, setBulkRunning] = useState(false)
  const [progress, setProgress] = useState(null)
  const [correcting, setCorrecting] = useState(null)
  const [corr, setCorr] = useState({})
  const [disciplines, setDisciplines] = useState([])
  const [showDiscModal, setShowDiscModal] = useState(false)
  const [categories, setCategories] = useState([])
  const [confFilter, setConfFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState(new Set())

  const load = useCallback(() => {
    getRFIs(projectId, { page, per_page:50, search, discipline:disc, status, conf_filter:confFilter })
      .then(d => { setData(d); setSelectedIds(new Set()) })
      .catch(() => {})
  }, [projectId, page, search, disc, status, confFilter])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const saved = getTeamMembers(projectId)
    if (saved.length > 0) setTeamMembers(['Unassigned', ...saved.map(m => m.name)])
    getDisciplines(projectId).then(rows => setDisciplines(rows)).catch(() => {})
    getCategories().then(setCategories).catch(() => {})
  }, [projectId])

  const classify = async (rfi) => {
    setClassifying(p => ({ ...p, [rfi.id]:true }))
    try {
      await classifyRFI(rfi.id)
      toast.success(`${rfi.rfi_ref} classified`)
      load()
    } finally { setClassifying(p => ({ ...p, [rfi.id]:false })) }
  }

  const reclassify = async (rfi) => {
    setClassifying(p => ({ ...p, [rfi.id]:'re' }))
    try {
      await reclassifyRFI(rfi.id)
      toast.success(`${rfi.rfi_ref} re-classified`)
      load()
      if (selected?.id === rfi.id) setSelected(null)
    } catch { toast.error('Re-classify failed') }
    finally { setClassifying(p => ({ ...p, [rfi.id]:false })) }
  }

  const bulkClassify = async () => {
    setBulkRunning(true)
    setProgress({ status:'queued', total: data.unclassified_total || 0, done:0, current:'' })
    try {
      const r = await classifyAll(projectId)
      if (r.total !== undefined) setProgress(p => ({ ...p, total: r.total }))
      // Poll until done
      const poll = setInterval(async () => {
        try {
          const p = await getClassifyProgress(projectId)
          setProgress(p)
          if (p.status === 'done' || p.status === 'stopped') {
            clearInterval(poll)
            setBulkRunning(false)
            load()
          } else if (p.status === 'idle' && p.total === 0) {
            clearInterval(poll)
            setBulkRunning(false)
          }
        } catch { clearInterval(poll); setBulkRunning(false) }
      }, 2000)
    } catch {
      setBulkRunning(false)
      setProgress(null)
    }
  }

  const dismissProgress = () => {
    setProgress(null)
    load()
  }

  const toggleSelect = (id) => setSelectedIds(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const toggleSelectAll = () => {
    if (selectedIds.size === data.rfis.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(data.rfis.map(r => r.id)))
    }
  }

  const handleBatchReclassify = async () => {
    if (selectedIds.size === 0) return
    setBulkRunning(true)
    const ids = [...selectedIds]
    setProgress({ status:'queued', total: ids.length, done:0, current:'' })
    try {
      const r = await reclassifyBatch(projectId, ids)
      if (r.total !== undefined) setProgress(p => ({ ...p, total: r.total }))
      const poll = setInterval(async () => {
        try {
          const p = await getClassifyProgress(projectId)
          setProgress(p)
          if (p.status === 'done' || p.status === 'stopped') {
            clearInterval(poll); setBulkRunning(false); load()
          }
        } catch { clearInterval(poll); setBulkRunning(false) }
      }, 2000)
    } catch { setBulkRunning(false); setProgress(null) }
  }

  const handleStop = async () => {
    try {
      await stopClassify(projectId)
      setProgress(p => p ? { ...p, status: 'stopping' } : p)
    } catch {}
  }

  const saveCorrection = async () => {
    if (!correcting) return
    await updateRFI(correcting.id, corr)
    await addExample({ project_id:projectId, rfi_ref:correcting.rfi_ref, subject:correcting.subject, description_excerpt:(correcting.description||'').slice(0,300), discipline:correcting.discipline, correct_design_defect:corr.human_design_defect||correcting.ai_design_defect, correct_next_level_category:corr.human_next_level_category||correcting.ai_next_level_category, correct_sub_level_category:corr.human_sub_level_category||correcting.ai_sub_level_category, correct_location:corr.human_location||correcting.ai_location, added_by:'user' })
    toast.success('Correction saved & added to AI memory')
    setCorrecting(null); load()
  }

  const totalPages = Math.ceil(data.total / 50)
  const unclassifiedCount = data.unclassified_total || 0
  const discList = disciplines.length > 0 ? disciplines.map(d => d.name) : DEFAULT_DISC

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', background:'#F4F6FA' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">RFI Log</div>
          <div className="page-sub">{data.total} RFIs · {unclassifiedCount} unclassified</div>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn-ghost" onClick={() => exportExcel(projectId)}>↓ Export Excel</button>
          <button className="btn-primary" onClick={bulkClassify} disabled={bulkRunning}>
            {bulkRunning ? <span className="spin">↻</span> : '⚡'}
            {bulkRunning ? 'Classifying…' : 'Reclassify All'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding:'10px 20px', background:'#fff', borderBottom:'1px solid #E9EDF5', display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex:'0 0 260px' }}>
          <span style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'#9CA3AF', fontSize:14 }}>🔍</span>
          <input className="input" placeholder="Search RFI ref, subject, description…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} style={{ paddingLeft:34, fontSize:13 }} />
        </div>
        <select className="input" style={{ flex:'0 0 150px', fontSize:13 }} value={disc} onChange={e => { setDisc(e.target.value); setPage(1) }}>
          <option value="">All Disciplines</option>
          {discList.map(d => <option key={d}>{d}</option>)}
        </select>
        <button onClick={() => setShowDiscModal(true)} title="Manage disciplines"
          style={{ padding:'6px 12px', borderRadius:8, border:'1.5px solid #E5E7EB', background:'#F8FAFC', cursor:'pointer', fontSize:13, color:'#374151', fontFamily:'inherit', display:'flex', alignItems:'center', gap:5, flexShrink:0 }}>
          ⚙ Disciplines
        </button>
        <select className="input" style={{ flex:'0 0 160px', fontSize:13 }} value={confFilter} onChange={e => { setConfFilter(e.target.value); setPage(1) }}>
          <option value="">All Confidence</option>
          <option value="high">High ≥85%</option>
          <option value="medium">Medium 65–84%</option>
          <option value="low">Low &lt;65%</option>
          <option value="unclassified">Unclassified</option>
        </select>
        <span style={{ fontSize:12, color:'#9CA3AF', marginLeft:'auto' }}>{data.total} results</span>
      </div>

      {/* Table + Detail */}
      <div style={{ flex:1, overflow:'hidden', display:'flex' }}>
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          {/* Batch action bar */}
          {selectedIds.size > 0 && (
            <div style={{ padding:'8px 16px', background:'#1D4ED8', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
              <span style={{ fontSize:13, color:'#fff', fontWeight:600 }}>{selectedIds.size} RFI{selectedIds.size > 1 ? 's' : ''} selected</span>
              <button onClick={handleBatchReclassify} disabled={bulkRunning}
                style={{ background:'#fff', color:'#1D4ED8', border:'none', borderRadius:8, padding:'5px 14px', fontSize:12.5, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                ↻ Reclassify Selected
              </button>
              <button onClick={() => setSelectedIds(new Set())}
                style={{ background:'rgba(255,255,255,0.15)', color:'#fff', border:'1px solid rgba(255,255,255,0.3)', borderRadius:8, padding:'5px 12px', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
                Clear
              </button>
            </div>
          )}

          <div style={{ flex:1, overflowY:'auto', overflowX:'auto' }}>
            <table>
              <thead>
                <tr>
                  <th style={{ width:36 }}>
                    <input type="checkbox"
                      checked={data.rfis.length > 0 && selectedIds.size === data.rfis.length}
                      onChange={toggleSelectAll}
                      style={{ cursor:'pointer' }} />
                  </th>
                  <th style={{ width:46 }}>#</th>
                  <th style={{ width:140 }}>RFI Reference</th>
                  <th style={{ width:110 }}>Discipline</th>
                  <th>Subject</th>
                  <th style={{ width:185 }}>Design Defect</th>
                  <th style={{ width:175 }}>Category</th>
                  <th style={{ width:175 }}>Sub-Category</th>
                  <th style={{ width:120 }}>Location</th>
                  <th style={{ width:115 }}>Confidence</th>
                  <th style={{ width:90 }}>Severity</th>
                  <th style={{ width:160 }}>Consultant Response</th>
                  <th style={{ width:100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.rfis.map((rfi) => {
                  const overall = Math.round(rfi.conf_overall||0)
                  const confColor = overall>=85?'#10B981':overall>=65?'#F59E0B':'#EF4444'
                  const isSel = selected?.id === rfi.id
                  return (
                    <tr key={rfi.id} onClick={() => setSelected(isSel ? null : rfi)} style={{ cursor:'pointer', background:selectedIds.has(rfi.id)?'#EFF6FF':isSel?'#F0F6FF':undefined }}>
                      <td onClick={e => { e.stopPropagation(); toggleSelect(rfi.id) }} style={{ textAlign:'center' }}>
                        <input type="checkbox" checked={selectedIds.has(rfi.id)} onChange={() => toggleSelect(rfi.id)} style={{ cursor:'pointer' }} />
                      </td>
                      <td style={{ color:'#9CA3AF', fontSize:11 }}>{rfi.sr_no}</td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                          <span style={{ fontFamily:'monospace', fontSize:11.5, color:'#1D4ED8', fontWeight:600 }}>{rfi.rfi_ref}</span>
                          {rfi.human_corrected && <span title="Human corrected" style={{ color:'#F59E0B', fontSize:10 }}>✎</span>}
                        </div>
                      </td>
                      {/* Inline discipline edit */}
                      <td onClick={e => e.stopPropagation()}>
                        <select className="input" value={rfi.discipline} style={{ padding:'4px 6px', fontSize:11, color:'#15803D', fontWeight:600, background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:6 }}
                          onChange={e => { updateRFI(rfi.id, { discipline: e.target.value }).then(load).catch(() => {}) }}>
                          {rfi.discipline && !discList.includes(rfi.discipline) && (
                            <option value={rfi.discipline}>{rfi.discipline}</option>
                          )}
                          {discList.map(d => <option key={d}>{d}</option>)}
                        </select>
                      </td>
                      <td style={{ maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontSize:12.5 }}>{rfi.subject}</td>

                      <td>
                        {rfi.ai_design_defect ? (
                          <div>
                            <div style={{ fontSize:12, fontWeight:500, color:'#111827', marginBottom:3 }}>{rfi.human_design_defect || rfi.ai_design_defect}</div>
                            <ConfBar value={Math.round(rfi.conf_design_defect||0)} label="Design Defect" />
                          </div>
                        ) : <span style={{ color:'#E2E8F0' }}>—</span>}
                      </td>
                      <td>
                        {rfi.ai_next_level_category ? (
                          <div>
                            <div style={{ fontSize:12, color:'#374151', marginBottom:3 }}>{rfi.human_next_level_category || rfi.ai_next_level_category}</div>
                            <ConfBar value={Math.round(rfi.conf_next_level_category||0)} label="Category" />
                          </div>
                        ) : <span style={{ color:'#E2E8F0' }}>—</span>}
                      </td>
                      <td>
                        {rfi.ai_sub_level_category ? (
                          <div>
                            <div style={{ fontSize:12, color:'#374151', marginBottom:3 }}>{rfi.human_sub_level_category || rfi.ai_sub_level_category}</div>
                            <ConfBar value={Math.round(rfi.conf_sub_level_category||0)} label="Sub-Category" />
                          </div>
                        ) : <span style={{ color:'#E2E8F0' }}>—</span>}
                      </td>
                      <td style={{ fontSize:12 }}>
                        {rfi.ai_location ? (
                          <div>
                            <div style={{ color:'#374151', marginBottom:3 }}>{rfi.human_location || rfi.ai_location}</div>
                            <ConfBar value={Math.round(rfi.conf_location||0)} label="Location" />
                          </div>
                        ) : <span style={{ color:'#E2E8F0' }}>—</span>}
                      </td>
                      <td>
                        {rfi.ai_classified ? (
                          <div>
                            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                              <div style={{ width:58, height:6, background:'#F1F5F9', borderRadius:3, overflow:'hidden' }}>
                                <div style={{ width:`${overall}%`, height:'100%', background:confColor, borderRadius:3 }} />
                              </div>
                            </div>
                            <span style={{ fontSize:12, fontWeight:700, color:confColor, background:confColor+'15', padding:'1px 7px', borderRadius:20 }}>{overall}%</span>
                          </div>
                        ) : <span style={{ color:'#D1D5DB', fontSize:12 }}>—</span>}
                      </td>

                      {/* Inline severity edit */}
                      <td onClick={e => e.stopPropagation()}>
                        {rfi.ai_classified ? (
                          <select className="input" value={rfi.ai_severity||'Medium'} style={{ padding:'4px 6px', fontSize:11, fontWeight:700, color:SEV_COLOR[rfi.ai_severity]||'#D97706', background:(SEV_COLOR[rfi.ai_severity]||'#D97706')+'15', border:`1px solid ${SEV_COLOR[rfi.ai_severity]||'#D97706'}30`, borderRadius:6 }}
                            onChange={e => { updateRFI(rfi.id, { ai_severity: e.target.value }).then(load).catch(() => {}) }}>
                            {SEVERITIES.map(s => <option key={s}>{s}</option>)}
                          </select>
                        ) : <span style={{ color:'#E2E8F0' }}>—</span>}
                      </td>

                      {/* Consultant Response */}
                      <td>
                        {rfi.response_received ? (
                          <div title={rfi.consultant_response} style={{ fontSize:11.5, color:'#065F46', lineHeight:1.4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                            <span style={{ display:'inline-block', width:7, height:7, borderRadius:'50%', background:'#10B981', marginRight:5, verticalAlign:'middle', flexShrink:0 }} />
                            {rfi.consultant_response}
                          </div>
                        ) : <span style={{ color:'#E2E8F0', fontSize:11.5 }}>No response</span>}
                      </td>

                      <td onClick={e => e.stopPropagation()}>
                        {!rfi.ai_classified ? (
                          <button className="btn-primary" onClick={() => classify(rfi)} disabled={classifying[rfi.id]}
                            style={{ padding:'5px 10px', fontSize:11.5, gap:4 }}>
                            {classifying[rfi.id] ? <span className="spin" style={{ fontSize:12 }}>↻</span> : '⚡'}
                            {classifying[rfi.id] ? '' : 'Classify'}
                          </button>
                        ) : (
                          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                            <button className="btn-ghost" onClick={() => { setCorrecting(rfi); setCorr({ human_design_defect:rfi.human_design_defect||rfi.ai_design_defect, human_next_level_category:rfi.human_next_level_category||rfi.ai_next_level_category, human_sub_level_category:rfi.human_sub_level_category||rfi.ai_sub_level_category, human_location:rfi.human_location||rfi.ai_location, ai_severity:rfi.ai_severity||'Medium' }) }}
                              style={{ padding:'5px 10px', fontSize:11 }}>
                              ✎ Correct
                            </button>
                            <button className="btn-ghost" onClick={() => reclassify(rfi)} disabled={classifying[rfi.id]==='re'}
                              style={{ padding:'4px 10px', fontSize:10.5, color:'#7C3AED', borderColor:'#DDD6FE', background:'#F5F3FF' }}>
                              {classifying[rfi.id]==='re' ? <span className="spin">↻</span> : '↻'} Re-classify
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.total > 50 && (
            <div style={{ padding:'10px 16px', borderTop:'1.5px solid #E9EDF5', background:'#fff', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
              <span style={{ fontSize:12.5, color:'#6B7280' }}>
                Showing {(page-1)*50+1}–{Math.min(page*50, data.total)} of <strong>{data.total}</strong> RFIs
              </span>
              <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                <button className="btn-ghost" onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                  style={{ padding:'5px 12px', fontSize:12.5 }}>← Prev</button>
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  let pg
                  if (totalPages <= 7) { pg = i+1 }
                  else if (page <= 4) { pg = i+1 }
                  else if (page >= totalPages-3) { pg = totalPages-6+i }
                  else { pg = page-3+i }
                  return (
                    <button key={pg} onClick={() => setPage(pg)}
                      style={{ padding:'5px 10px', fontSize:12.5, borderRadius:7, border:`1.5px solid ${pg===page?'#1D4ED8':'#E5E7EB'}`, background:pg===page?'#1D4ED8':'#fff', color:pg===page?'#fff':'#374151', cursor:'pointer', fontFamily:'inherit', fontWeight:pg===page?700:400, minWidth:34, transition:'all 0.15s' }}>
                      {pg}
                    </button>
                  )
                })}
                <button className="btn-ghost" onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page>=totalPages}
                  style={{ padding:'5px 12px', fontSize:12.5 }}>Next →</button>
              </div>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ width:390, borderLeft:'1.5px solid #E9EDF5', overflowY:'auto', background:'#fff', flexShrink:0 }}>
            <div style={{ padding:'16px 18px', borderBottom:'1px solid #F3F5FA', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:'monospace', fontSize:12, color:'#1D4ED8', marginBottom:4, fontWeight:600 }}>{selected.rfi_ref}</div>
                <div style={{ fontSize:13.5, fontWeight:700, color:'#0F172A', lineHeight:1.4 }}>{selected.subject}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'#9CA3AF', fontSize:18, padding:'0 0 0 8px', flexShrink:0, lineHeight:1 }}>×</button>
            </div>

            <div style={{ padding:'16px 18px' }}>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
                <span style={{ background:'#EFF6FF', color:'#1D4ED8', fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:20 }}>{selected.discipline}</span>
                <span style={{ background:'#F3F4F6', color:'#374151', fontSize:11, padding:'3px 10px', borderRadius:20 }}>Date: {selected.received_date}</span>
                <span style={{ background:ST_COLOR[selected.status]+'18', color:ST_COLOR[selected.status], fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:20 }}>{selected.status}</span>
              </div>

              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:10.5, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:6, fontWeight:600 }}>Full Description</div>
                <div style={{ fontSize:12.5, color:'#374151', lineHeight:1.75, background:'#F8FAFC', padding:14, borderRadius:10, maxHeight:200, overflowY:'auto', whiteSpace:'pre-wrap', border:'1.5px solid #F1F5F9' }}>
                  {selected.description}
                </div>
              </div>

              {selected.level_location && (
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:10.5, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:4, fontWeight:600 }}>Level / Location (from file)</div>
                  <div style={{ fontSize:13, color:'#374151' }}>{selected.level_location}</div>
                </div>
              )}

              {selected.ai_classified ? (
                <div>
                  <div style={{ background:'#F8FAFF', border:'1.5px solid #DBEAFE', borderRadius:12, padding:16, marginBottom:12 }}>
                    <div style={{ fontSize:11, color:'#1D4ED8', textTransform:'uppercase', letterSpacing:'0.6px', fontWeight:700, marginBottom:12 }}>AI Classification Results</div>
                    {[['Design Defect', selected.human_design_defect||selected.ai_design_defect, selected.conf_design_defect],['Category', selected.human_next_level_category||selected.ai_next_level_category, selected.conf_next_level_category],['Sub-Category', selected.human_sub_level_category||selected.ai_sub_level_category, selected.conf_sub_level_category],['Location (AI extracted)', selected.human_location||selected.ai_location, selected.conf_location]].map(([label,val,conf]) => (
                      <div key={label} style={{ marginBottom:10 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:2 }}>
                          <span style={{ fontSize:11, color:'#6B7280', fontWeight:600 }}>{label}</span>
                          <ConfBar value={Math.round(conf||0)} label={label} />
                        </div>
                        <div style={{ fontSize:13, color:'#111827', fontWeight:500 }}>{val || '—'}</div>
                      </div>
                    ))}

                    {/* Severity edit in detail panel */}
                    <div style={{ borderTop:'1px solid #DBEAFE', paddingTop:10, marginTop:6 }}>
                      <div style={{ fontSize:11, color:'#6B7280', fontWeight:600, marginBottom:5 }}>Severity</div>
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                        {SEVERITIES.map(s => (
                          <button key={s} onClick={() => updateRFI(selected.id, { ai_severity:s }).then(load).catch(() => {})}
                            style={{ padding:'4px 12px', borderRadius:20, border:`1.5px solid ${SEV_COLOR[s]}50`, background:selected.ai_severity===s?SEV_COLOR[s]:'transparent', color:selected.ai_severity===s?'#fff':SEV_COLOR[s], fontSize:11.5, fontWeight:700, cursor:'pointer', transition:'all 0.15s' }}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Consultant Response section */}
                  <div style={{ background: selected.response_received ? '#F0FDF4' : '#F9FAFB', border: `1.5px solid ${selected.response_received ? '#BBF7D0' : '#E5E7EB'}`, borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ fontSize: 11, color: selected.response_received ? '#065F46' : '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 700 }}>
                        {selected.response_received ? '✓ Consultant Response' : 'Consultant Response'}
                      </div>
                      {selected.consultant_response_date && (
                        <span style={{ fontSize: 11, color: '#6B7280' }}>{selected.consultant_response_date}</span>
                      )}
                    </div>
                    {selected.response_received ? (
                      <>
                        <div style={{ fontSize: 13, color: '#111827', lineHeight: 1.6, marginBottom: 6 }}>{selected.consultant_response}</div>
                        {selected.consultant_name && (
                          <div style={{ fontSize: 11.5, color: '#6B7280' }}>Signed by: <strong>{selected.consultant_name}</strong></div>
                        )}
                      </>
                    ) : (
                      <div style={{ fontSize: 12.5, color: '#9CA3AF', fontStyle: 'italic' }}>No consultant response imported yet. Upload RFI PDFs via Upload Files.</div>
                    )}
                  </div>

                  {selected.ai_reasoning && (
                    <div style={{ marginBottom:12 }}>
                      <div style={{ fontSize:11.5, color:'#6B7280', lineHeight:1.6 }}>{selected.ai_reasoning}</div>
                      {selected.model_used && (
                        <div style={{ display:'inline-flex', alignItems:'center', gap:4, background:'#F0F9FF', border:'1px solid #BAE6FD', borderRadius:20, padding:'2px 10px', marginTop:6 }}>
                          <span style={{ fontSize:10, color:'#0369A1' }}>🤖</span>
                          <span style={{ fontSize:10.5, color:'#0369A1', fontWeight:600 }}>{selected.model_used}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {selected.ai_suggested_action && (
                    <div style={{ padding:'10px 13px', background:'#F0F9FF', borderRadius:9, border:'1.5px solid #BAE6FD', marginBottom:12 }}>
                      <div style={{ fontSize:10, color:'#0369A1', fontWeight:700, marginBottom:3, textTransform:'uppercase', letterSpacing:'0.5px' }}>Suggested Action</div>
                      <div style={{ fontSize:12.5, color:'#0C4A6E' }}>{selected.ai_suggested_action}</div>
                    </div>
                  )}
                </div>
              ) : (
                <button className="btn-primary" onClick={() => classify(selected)} disabled={classifying[selected.id]} style={{ width:'100%', justifyContent:'center' }}>
                  {classifying[selected.id] ? 'Classifying…' : '⚡ Classify with AI'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Full-screen Reclassify All modal */}
      <ClassifyModal progress={progress} onDismiss={dismissProgress} onStop={handleStop} />

      {/* Discipline management modal */}
      {showDiscModal && (
        <DisciplineModal
          projectId={projectId}
          disciplines={disciplines}
          onUpdate={setDisciplines}
          onClose={() => setShowDiscModal(false)}
        />
      )}

      {/* Correction modal */}
      {correcting && (() => {
        const selCat = categories.find(c => c.name === corr.human_design_defect)
        const selSub = selCat?.subcategories?.find(s => s.name === corr.human_next_level_category)
        const catNames = categories.map(c => c.name)
        const subNames = (selCat?.subcategories || []).map(s => s.name)
        const itemNames = (selSub?.items || []).map(i => i.name)

        // current values that are not in the live taxonomy (e.g. old hallucinated values)
        const hasUnknownCat  = corr.human_design_defect       && !catNames.includes(corr.human_design_defect)
        const hasUnknownSub  = corr.human_next_level_category && !subNames.includes(corr.human_next_level_category)
        const hasUnknownItem = corr.human_sub_level_category  && !itemNames.includes(corr.human_sub_level_category)

        return (
        <div className="overlay" onClick={() => setCorrecting(null)}>
          <div className="modal fade-up" style={{ width:520 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:17, fontWeight:800, color:'#0F172A', marginBottom:4 }}>Correct AI Classification</div>
            <div style={{ fontSize:12.5, color:'#94A3B8', marginBottom:6 }}>Saved to AI memory — improves all future classifications automatically</div>
            <div style={{ fontFamily:'monospace', fontSize:12, color:'#1D4ED8', marginBottom:14 }}>
              {correcting.rfi_ref} — <span style={{ fontFamily:'Inter,sans-serif', color:'#6B7280' }}>{correcting.subject?.slice(0,55)}…</span>
            </div>

            {/* Design Defect */}
            <div style={{ marginBottom:12 }}>
              <label style={{ display:'block', fontSize:12.5, fontWeight:600, color:'#374151', marginBottom:5 }}>Design Defect</label>
              <select className="input" value={corr.human_design_defect||''}
                onChange={e => setCorr(f => ({ ...f, human_design_defect: e.target.value, human_next_level_category: '', human_sub_level_category: '' }))}>
                <option value="">— Select Design Defect —</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                {hasUnknownCat && <option value={corr.human_design_defect}>{corr.human_design_defect} (current — not in taxonomy)</option>}
              </select>
            </div>

            {/* Category — filtered by selected Design Defect */}
            <div style={{ marginBottom:12 }}>
              <label style={{ display:'block', fontSize:12.5, fontWeight:600, color:'#374151', marginBottom:5 }}>Category</label>
              <select className="input" value={corr.human_next_level_category||''}
                disabled={!selCat}
                style={{ opacity: selCat ? 1 : 0.5 }}
                onChange={e => setCorr(f => ({ ...f, human_next_level_category: e.target.value, human_sub_level_category: '' }))}>
                <option value="">{selCat ? '— Select Category —' : '— Select Design Defect first —'}</option>
                {(selCat?.subcategories || []).map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                {hasUnknownSub && <option value={corr.human_next_level_category}>{corr.human_next_level_category} (current — not in taxonomy)</option>}
              </select>
            </div>

            {/* Sub-Category — filtered by selected Category */}
            <div style={{ marginBottom:12 }}>
              <label style={{ display:'block', fontSize:12.5, fontWeight:600, color:'#374151', marginBottom:5 }}>Sub-Category</label>
              <select className="input" value={corr.human_sub_level_category||''}
                disabled={!selSub}
                style={{ opacity: selSub ? 1 : 0.5 }}
                onChange={e => setCorr(f => ({ ...f, human_sub_level_category: e.target.value }))}>
                <option value="">{selSub ? '— Select Sub-Category —' : '— Select Category first —'}</option>
                {(selSub?.items || []).map(i => <option key={i.id} value={i.name}>{i.name}</option>)}
                {hasUnknownItem && <option value={corr.human_sub_level_category}>{corr.human_sub_level_category} (current — not in taxonomy)</option>}
              </select>
            </div>

            {/* Severity */}
            <div style={{ marginBottom:12 }}>
              <label style={{ display:'block', fontSize:12.5, fontWeight:600, color:'#374151', marginBottom:5 }}>Severity</label>
              <div style={{ display:'flex', gap:8 }}>
                {SEVERITIES.map(s => (
                  <button key={s} type="button"
                    onClick={() => setCorr(f => ({ ...f, ai_severity: s }))}
                    style={{ flex:1, padding:'7px 0', borderRadius:8, border:`1.5px solid ${SEV_COLOR[s]}50`, background: corr.ai_severity===s ? SEV_COLOR[s] : 'transparent', color: corr.ai_severity===s ? '#fff' : SEV_COLOR[s], fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 0.15s', fontFamily:'inherit' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Location — free text */}
            <div style={{ marginBottom:12 }}>
              <label style={{ display:'block', fontSize:12.5, fontWeight:600, color:'#374151', marginBottom:5 }}>Location</label>
              <input className="input" value={corr.human_location||''} onChange={e => setCorr(f => ({ ...f, human_location: e.target.value }))} />
            </div>

            {/* Hint */}
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'#F0F9FF', border:'1px solid #BAE6FD', borderRadius:8, padding:'8px 12px', marginBottom:14, fontSize:12 }}>
              <span style={{ color:'#0369A1', fontSize:14 }}>ℹ</span>
              <span style={{ color:'#0369A1' }}>
                Can't find the right category?{' '}
                <Link to={`/project/${projectId}/categories`} onClick={() => setCorrecting(null)}
                  style={{ color:'#1D4ED8', fontWeight:700, textDecoration:'underline' }}>
                  Create it in Categories →
                </Link>
              </span>
            </div>

            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setCorrecting(null)} style={{ flex:1, background:'#F8FAFC', color:'#374151', border:'1.5px solid #E5E7EB', borderRadius:9, padding:11, fontSize:13.5, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
              <button className="btn-primary" onClick={saveCorrection} style={{ flex:2, justifyContent:'center' }}>Save & Add to AI Memory</button>
            </div>
          </div>
        </div>
        )
      })()}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getTeamMembers, saveTeamMembers } from '../services/api'
import toast from 'react-hot-toast'

const DEFAULT_DISCIPLINES = [
  { id: 'civil',    label: 'Civil / Structure', color: '#1D4ED8', icon: '🏗️' },
  { id: 'mep',      label: 'MEP',               color: '#059669', icon: '⚡' },
  { id: 'facade',   label: 'Façade',             color: '#7C3AED', icon: '🏢' },
  { id: 'arch',     label: 'Architecture',       color: '#D97706', icon: '📐' },
  { id: 'landscape',label: 'Landscape',          color: '#16A34A', icon: '🌳' },
  { id: 'id',       label: 'Interior Design',    color: '#DB2777', icon: '🎨' },
]

const DEFAULT_ACTIVITIES = {
  civil:    ['IFC Drawing Review', 'Structural Calculation Check', 'RFI Response', 'Site Inspection', 'Design Coordination'],
  mep:      ['MEP Coordination', 'Load Schedule Review', 'Equipment Approval', 'BMS Integration', 'Fire System Review'],
  facade:   ['Facade Detailing', 'Curtain Wall Approval', 'Fire Rating Check', 'Thermal Analysis', 'Sealant Specification'],
  arch:     ['Floor Plan Review', 'Finishes Schedule', 'Door/Window Schedule', 'Authority Submission', 'Mock-up Approval'],
  landscape:['Planting Schedule', 'Hardscape Review', 'Irrigation Design', 'Species Approval'],
  id:       ['FF&E Schedule', 'Material Approval', 'Mock-up Review', 'Snag Resolution'],
}

const ROLES = ['Lead Engineer', 'Senior Engineer', 'Engineer', 'Coordinator', 'Reviewer', 'Approver', 'Consultant']

export default function TeamPage() {
  const { projectId } = useParams()
  const [members, setMembers]     = useState([])
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES)
  const [extraDiscs, setExtraDiscs] = useState([])   // custom disciplines added by user
  const [showAddUser, setShowAddUser]   = useState(false)
  const [showAddDisc, setShowAddDisc]   = useState(false)
  const [newDiscName, setNewDiscName]   = useState('')
  const [showAddActivity, setShowAddActivity] = useState(null) // discipline id
  const [newActivity, setNewActivity]   = useState('')
  const [form, setForm] = useState({ name:'', email:'', role:'Engineer', disciplines:[], phone:'', sou:'' })
  const [activeDisc, setActiveDisc] = useState('civil')

  useEffect(() => {
    const saved = getTeamMembers(projectId)
    setMembers(saved)
    const savedActs = localStorage.getItem(`activities_${projectId}`)
    if (savedActs) setActivities(JSON.parse(savedActs))
    const savedDiscs = localStorage.getItem(`extra_discs_${projectId}`)
    if (savedDiscs) setExtraDiscs(JSON.parse(savedDiscs))
  }, [projectId])

  const allDiscs = [
    ...DEFAULT_DISCIPLINES,
    ...extraDiscs.map(d => ({ id: d.id, label: d.label, color: '#64748B', icon: '🔧' })),
  ]

  const addCustomDisc = () => {
    const label = newDiscName.trim()
    if (!label) return
    const id = label.toLowerCase().replace(/\s+/g, '_')
    if (allDiscs.find(d => d.id === id)) return toast.error('Discipline already exists')
    const newList = [...extraDiscs, { id, label }]
    setExtraDiscs(newList)
    localStorage.setItem(`extra_discs_${projectId}`, JSON.stringify(newList))
    setNewDiscName(''); setShowAddDisc(false)
    toast.success(`'${label}' added`)
  }

  const saveMembers = (m) => {
    setMembers(m)
    saveTeamMembers(projectId, m)
  }

  const saveActivities = (a) => {
    setActivities(a)
    localStorage.setItem(`activities_${projectId}`, JSON.stringify(a))
  }

  const handleAddMember = () => {
    if (!form.name.trim()) return toast.error('Name is required')
    if (form.disciplines.length === 0) return toast.error('Select at least one discipline')
    const member = { id: Date.now().toString(), ...form, addedAt: new Date().toISOString() }
    saveMembers([...members, member])
    toast.success(`${form.name} added to team`)
    setShowAddUser(false)
    setForm({ name:'', email:'', role:'Engineer', disciplines:[], phone:'', sou:'' })
  }

  const removeMember = (id) => {
    saveMembers(members.filter(m => m.id !== id))
    toast.success('Member removed')
  }

  const addActivity = (disc) => {
    if (!newActivity.trim()) return
    const updated = { ...activities, [disc]: [...(activities[disc] || []), newActivity.trim()] }
    saveActivities(updated)
    setNewActivity('')
    setShowAddActivity(null)
    toast.success('Activity added')
  }

  const removeActivity = (disc, idx) => {
    const updated = { ...activities, [disc]: activities[disc].filter((_, i) => i !== idx) }
    saveActivities(updated)
  }

  const toggleDisc = (d) => {
    setForm(f => ({
      ...f,
      disciplines: f.disciplines.includes(d)
        ? f.disciplines.filter(x => x !== d)
        : [...f.disciplines, d]
    }))
  }

  const discMembers = members.filter(m => m.disciplines?.includes(activeDisc))


  return (
    <div style={{ flex:1, overflowY:'auto', background:'#F4F6FA' }}>
      <div className="page-header">
        <div>
          <div className="page-title">👥 Team & Activities</div>
          <div className="page-sub">{members.length} team members · Manage assignees and discipline activities</div>
        </div>
        <button className="btn-primary" onClick={() => setShowAddUser(true)}>+ Add Team Member</button>
      </div>

      <div style={{ padding:'20px 28px' }}>
        {/* Severity explanation box */}
        <div style={{ padding:'14px 18px', background:'#FFF7ED', border:'1.5px solid #FED7AA', borderRadius:12, marginBottom:22 }}>
          <div style={{ fontSize:13.5, fontWeight:700, color:'#92400E', marginBottom:8 }}>⚖️ How Severity is Calculated</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
            {[
              ['🔴 Critical', '#DC2626', 'Compliance/Code violations, fire safety, structural integrity, regulatory non-compliance'],
              ['🟠 High', '#EA580C', 'Multi-discipline coordination failures, structural mismatches, design assumption errors'],
              ['🟡 Medium', '#D97706', 'Documentation gaps, spatial/dimensional issues, buildability problems'],
              ['🟢 Low', '#16A34A', 'Aesthetics, user experience, durability concerns, minor discrepancies'],
            ].map(([label, color, desc]) => (
              <div key={label} style={{ background:'#fff', padding:'10px 12px', borderRadius:10, border:`1.5px solid ${color}25` }}>
                <div style={{ fontSize:12.5, fontWeight:700, color, marginBottom:4 }}>{label}</div>
                <div style={{ fontSize:11.5, color:'#6B7280', lineHeight:1.5 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap:18 }}>
          {/* Discipline tabs */}
          <div className="card" style={{ padding:0, overflow:'hidden', alignSelf:'start' }}>
            <div style={{ padding:'12px 16px', borderBottom:'1px solid #F3F5FA', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontSize:12, fontWeight:700, color:'#6B7280', textTransform:'uppercase', letterSpacing:'0.5px' }}>Disciplines</span>
              <button onClick={() => setShowAddDisc(v => !v)} title="Add discipline"
                style={{ background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:6, color:'#1D4ED8', padding:'2px 8px', fontSize:14, cursor:'pointer', fontWeight:700, lineHeight:1.4 }}>+</button>
            </div>
            {showAddDisc && (
              <div style={{ padding:'8px 12px', borderBottom:'1px solid #F3F5FA', display:'flex', gap:6 }}>
                <input className="input" style={{ flex:1, fontSize:12, padding:'5px 8px' }} placeholder="Discipline name…"
                  value={newDiscName} onChange={e => setNewDiscName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCustomDisc()} autoFocus />
                <button onClick={addCustomDisc} style={{ background:'#1D4ED8', color:'#fff', border:'none', borderRadius:6, padding:'4px 10px', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>Add</button>
              </div>
            )}
            {allDiscs.map(d => (
              <div key={d.id} onClick={() => setActiveDisc(d.id)}
                style={{ padding:'12px 16px', display:'flex', alignItems:'center', gap:10, cursor:'pointer', background:activeDisc===d.id?d.color+'12':'#fff', borderLeft:`3px solid ${activeDisc===d.id?d.color:'transparent'}`, borderBottom:'1px solid #F9FAFB', transition:'all 0.15s' }}>
                <span style={{ fontSize:18 }}>{d.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:activeDisc===d.id?d.color:'#374151' }}>{d.label}</div>
                  <div style={{ fontSize:11, color:'#9CA3AF' }}>
                    {members.filter(m => m.disciplines?.includes(d.id)).length} members
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right panel */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {/* Team members for this discipline */}
            <div className="card" style={{ padding:20 }}>
              <div style={{ fontSize:14, fontWeight:700, color:'#0F172A', marginBottom:14, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span>{allDiscs.find(d=>d.id===activeDisc)?.label} Team</span>
                <span style={{ fontSize:12, color:'#9CA3AF' }}>{discMembers.length} members</span>
              </div>
              {discMembers.length === 0 ? (
                <div style={{ textAlign:'center', padding:'24px', color:'#9CA3AF', fontSize:13 }}>
                  No team members for this discipline yet.<br/>
                  <button className="btn-primary" onClick={() => setShowAddUser(true)} style={{ marginTop:10, fontSize:12 }}>+ Add Member</button>
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:10 }}>
                  {discMembers.map(m => (
                    <div key={m.id} style={{ background:'#F8FAFF', border:'1.5px solid #E9EDF5', borderRadius:12, padding:'12px 14px', display:'flex', gap:10, alignItems:'flex-start' }}>
                      <div style={{ width:36, height:36, borderRadius:'50%', background:allDiscs.find(d=>d.id===activeDisc)?.color+'20', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:allDiscs.find(d=>d.id===activeDisc)?.color, flexShrink:0 }}>
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13.5, fontWeight:600, color:'#111827' }}>{m.name}</div>
                        <div style={{ fontSize:11.5, color:'#6B7280' }}>{m.role}</div>
                        {m.email && <div style={{ fontSize:11, color:'#94A3B8', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.email}</div>}
                        {m.sou && <div style={{ fontSize:10.5, color:'#6B7280', marginTop:3, lineHeight:1.4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }} title={m.sou}>{m.sou}</div>}
                        <div style={{ display:'flex', flexWrap:'wrap', gap:3, marginTop:4 }}>
                          {m.disciplines?.map(d => {
                            const disc = allDiscs.find(x=>x.id===d)
                            return disc ? <span key={d} style={{ fontSize:10, background:disc.color+'15', color:disc.color, padding:'1px 6px', borderRadius:20, fontWeight:600 }}>{disc.label.split('/')[0].trim()}</span> : null
                          })}
                        </div>
                      </div>
                      <button onClick={() => removeMember(m.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#E5E7EB', fontSize:14, padding:2 }}
                        onMouseEnter={e=>e.currentTarget.style.color='#EF4444'} onMouseLeave={e=>e.currentTarget.style.color='#E5E7EB'}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activities for this discipline */}
            <div className="card" style={{ padding:20 }}>
              <div style={{ fontSize:14, fontWeight:700, color:'#0F172A', marginBottom:14, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span>Activities & Sub-activities</span>
                <button className="btn-ghost" onClick={() => setShowAddActivity(activeDisc)} style={{ fontSize:12, padding:'5px 12px' }}>+ Add Activity</button>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {(activities[activeDisc] || []).map((act, idx) => (
                  <div key={idx} style={{ display:'flex', alignItems:'center', gap:6, background:'#F8FAFF', border:'1.5px solid #E9EDF5', borderRadius:20, padding:'5px 12px' }}>
                    <span style={{ fontSize:12.5, color:'#374151' }}>{act}</span>
                    <button onClick={() => removeActivity(activeDisc, idx)}
                      style={{ background:'none', border:'none', cursor:'pointer', color:'#E5E7EB', fontSize:12, padding:0, lineHeight:1 }}
                      onMouseEnter={e=>e.currentTarget.style.color='#EF4444'} onMouseLeave={e=>e.currentTarget.style.color='#E5E7EB'}>✕</button>
                  </div>
                ))}
                {(activities[activeDisc] || []).length === 0 && (
                  <div style={{ fontSize:13, color:'#9CA3AF' }}>No activities defined yet. Add activities to help classify RFI work items.</div>
                )}
              </div>

              {showAddActivity === activeDisc && (
                <div style={{ marginTop:14, display:'flex', gap:8 }}>
                  <input className="input" placeholder="e.g. Fire Suppression System Review"
                    value={newActivity} onChange={e => setNewActivity(e.target.value)}
                    onKeyDown={e => e.key==='Enter' && addActivity(activeDisc)}
                    style={{ fontSize:13 }} autoFocus />
                  <button className="btn-primary" onClick={() => addActivity(activeDisc)} style={{ flexShrink:0 }}>Add</button>
                  <button className="btn-ghost" onClick={() => setShowAddActivity(null)} style={{ flexShrink:0 }}>Cancel</button>
                </div>
              )}

              {/* Warning if no activities */}
              {(activities[activeDisc] || []).length === 0 && (
                <div style={{ marginTop:12, padding:'10px 14px', background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:8, fontSize:12.5, color:'#92400E' }}>
                  ⚠️ Without activities defined, the AI cannot map RFIs to work items for this discipline. Add activities to enable detailed classification.
                </div>
              )}
            </div>

            {/* All members summary */}
            {members.length > 0 && (
              <div className="card" style={{ padding:20 }}>
                <div style={{ fontSize:14, fontWeight:700, color:'#0F172A', marginBottom:14 }}>All Team Members ({members.length})</div>
                <table>
                  <thead><tr><th>Name</th><th>Role</th><th>Disciplines</th><th>Email</th><th>Action</th></tr></thead>
                  <tbody>
                    {members.map(m => (
                      <tr key={m.id}>
                        <td style={{ fontWeight:600 }}>{m.name}</td>
                        <td style={{ color:'#6B7280' }}>{m.role}</td>
                        <td>{m.disciplines?.map(d => allDiscs.find(x=>x.id===d)?.label.split('/')[0]).join(', ')}</td>
                        <td style={{ color:'#94A3B8', fontSize:12 }}>{m.email}</td>
                        <td><button onClick={() => removeMember(m.id)} style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:6, padding:'3px 10px', cursor:'pointer', color:'#DC2626', fontSize:11, fontWeight:600 }}>Remove</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add member modal */}
      {showAddUser && (
        <div className="overlay" onClick={() => setShowAddUser(false)}>
          <div className="modal fade-up" style={{ width:520 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:17, fontWeight:800, color:'#0F172A', marginBottom:16 }}>Add Team Member</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
              {[['Full Name *','name','e.g. Ahmed Al-Rashid'],['Email','email','ahmed@sobha.com'],['Phone','phone','+971 50 xxx xxxx']].map(([label,key,ph]) => (
                <div key={key} style={{ gridColumn:key==='name'?'1/-1':undefined }}>
                  <label style={{ display:'block', fontSize:12.5, fontWeight:600, color:'#374151', marginBottom:5 }}>{label}</label>
                  <input className="input" placeholder={ph} value={form[key]} onChange={e => setForm(f=>({...f,[key]:e.target.value}))} />
                </div>
              ))}
              <div>
                <label style={{ display:'block', fontSize:12.5, fontWeight:600, color:'#374151', marginBottom:5 }}>Role</label>
                <select className="input" value={form.role} onChange={e => setForm(f=>({...f,role:e.target.value}))}>
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:12.5, fontWeight:600, color:'#374151', marginBottom:5 }}>
                SOU — Scope of Understanding
                <span style={{ fontSize:11, fontWeight:400, color:'#9CA3AF', marginLeft:6 }}>(responsibilities / deliverables)</span>
              </label>
              <textarea className="input" rows={3}
                placeholder="e.g. Responsible for IFC drawing review, RFI responses, and design coordination for civil works…"
                value={form.sou} onChange={e => setForm(f => ({ ...f, sou: e.target.value }))}
                style={{ resize:'vertical', fontSize:13, lineHeight:1.6 }} />
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:12.5, fontWeight:600, color:'#374151', marginBottom:8 }}>Disciplines * (select all that apply)</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {allDiscs.map(d => (
                  <label key={d.id} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:20, border:`1.5px solid ${form.disciplines.includes(d.id)?d.color:'#E5E7EB'}`, background:form.disciplines.includes(d.id)?d.color+'15':'#fff', cursor:'pointer', fontSize:13, fontWeight:500 }}>
                    <input type="checkbox" checked={form.disciplines.includes(d.id)} onChange={() => toggleDisc(d.id)} style={{ display:'none' }} />
                    {d.icon} {d.label}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setShowAddUser(false)} style={{ flex:1, background:'#F8FAFC', color:'#374151', border:'1.5px solid #E5E7EB', borderRadius:9, padding:11, fontSize:13.5, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>Cancel</button>
              <button className="btn-primary" onClick={handleAddMember} style={{ flex:2, justifyContent:'center' }}>Add to Team</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

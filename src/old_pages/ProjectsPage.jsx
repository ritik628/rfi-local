import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProjects, createProject, deleteProject } from '../services/api'
import toast from 'react-hot-toast'

const ACCENT = ['#D4AF37','#3B82F6','#8B5CF6','#06B6D4','#10B981']

function SobhaLogo({ size = 46 }) {
  const [imgFailed, setImgFailed] = useState(false)
  const r = Math.round(size * 0.2)
  return (
    <div style={{ width:size, height:size, borderRadius:r, background:'#0a0a0a', flexShrink:0, overflow:'hidden', position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
      {!imgFailed && (
        <img
          src="/sobha-logo.png"
          alt="Sobha"
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }}
          onError={() => setImgFailed(true)}
        />
      )}
      {imgFailed && (
        <span style={{ fontSize:Math.round(size*0.55), fontWeight:900, color:'#C9A84C', fontFamily:'Georgia,serif', lineHeight:1, userSelect:'none' }}>S</span>
      )}
    </div>
  )
}

export default function ProjectsPage() {
  const navigate = useNavigate()
  const [projects, setProjects]   = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]           = useState({ name:'', description:'', client:'', consultant:'', contractor:'' })
  const [step, setStep]           = useState('idle') // idle | creating | done
  const [deleteTarget, setDeleteTarget] = useState(null) // {id, name, rfi_count}
  const [deleteBy, setDeleteBy]   = useState('')
  const [deleteNotes, setDeleteNotes] = useState('')
  const [deleting, setDeleting]   = useState(false)

  const load = () => getProjects().then(setProjects).catch(() => {})
  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!form.name.trim()) return toast.error('Project name is required')
    setStep('creating')
    // Safety: never stay stuck longer than 15s
    const safetyTimer = setTimeout(() => {
      setStep('idle')
      toast.error('Request timed out — please try again')
    }, 15000)
    try {
      await createProject(form)
      clearTimeout(safetyTimer)
      setStep('done')
      toast.success('Project created')
      load() // fire-and-forget refresh
      setTimeout(() => {
        setShowModal(false)
        setStep('idle')
        setForm({ name:'', description:'', client:'', consultant:'', contractor:'' })
      }, 1200)
    } catch (err) {
      clearTimeout(safetyTimer)
      setStep('idle')
      // toast already shown by axios interceptor
    }
  }

  const openDeleteModal = (e, p) => {
    e.stopPropagation()
    setDeleteTarget({ id: p.id, name: p.name, rfi_count: p.rfi_count || 0 })
    setDeleteBy(''); setDeleteNotes('')
  }

  const confirmDelete = async () => {
    if (!deleteBy.trim()) return toast.error('Please enter your name for the audit record')
    setDeleting(true)
    try {
      await deleteProject(deleteTarget.id, { deleted_by: deleteBy.trim(), notes: deleteNotes.trim() })
      toast.success(`"${deleteTarget.name}" deleted`)
      setDeleteTarget(null); load()
    } catch {}
    setDeleting(false)
  }

  const totalRFIs = projects.reduce((s, p) => s + (p.rfi_count || 0), 0)

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:'#07080A', fontFamily:"'Inter',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300..800&display=swap');
        *, *::before, *::after { box-sizing:border-box; }

        .pi { background:rgba(255,255,255,0.05); border:1.5px solid rgba(255,255,255,0.1); border-radius:10px; padding:12px 16px; font-size:15px; color:#F1F5F9; outline:none; transition:all 0.15s; font-family:inherit; width:100%; }
        .pi::placeholder { color:rgba(255,255,255,0.25); }
        .pi:focus { border-color:#D4AF37; box-shadow:0 0 0 3px rgba(212,175,55,0.13); background:rgba(255,255,255,0.07); }

        .btn-gold { background:linear-gradient(135deg,#A07010,#D4AF37 50%,#A07010); color:#000; border:none; border-radius:10px; padding:13px 28px; font-size:15px; font-weight:700; cursor:pointer; transition:all 0.2s; font-family:inherit; display:inline-flex; align-items:center; gap:8px; }
        .btn-gold:hover { box-shadow:0 6px 28px rgba(212,175,55,0.4); transform:translateY(-1px); filter:brightness(1.1); }
        .btn-gold:disabled { opacity:0.5; cursor:not-allowed; transform:none; box-shadow:none; filter:none; }

        .pcard { background:#0E0F11; border:1px solid rgba(255,255,255,0.07); border-radius:18px; padding:26px; cursor:pointer; transition:all 0.25s; }
        .pcard:hover { border-color:rgba(212,175,55,0.4); box-shadow:0 20px 60px rgba(0,0,0,0.5); transform:translateY(-4px); background:#121316; }

        .overlay { position:fixed; inset:0; background:rgba(0,0,0,0.82); backdrop-filter:blur(12px); display:flex; align-items:center; justify-content:center; z-index:200; }
        @keyframes slideUp { from{opacity:0;transform:translateY(24px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        .modal-box { animation:slideUp 0.22s ease; background:#0E0F11; border:1px solid rgba(255,255,255,0.1); border-radius:22px; padding:38px; width:540px; max-width:calc(100vw - 32px); box-shadow:0 48px 120px rgba(0,0,0,0.7); }

        @keyframes spin { to{transform:rotate(360deg)} }
        .sp { width:52px; height:52px; border:3.5px solid rgba(255,255,255,0.07); border-top-color:#D4AF37; border-radius:50%; animation:spin 0.8s linear infinite; }

        .gold-text { background:linear-gradient(135deg,#B8860B,#F0D060,#B8860B); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }

        .stat-card { background:rgba(255,255,255,0.032); border:1px solid rgba(255,255,255,0.065); border-radius:16px; padding:24px 28px; transition:all 0.2s; }
        .stat-card:hover { background:rgba(255,255,255,0.05); border-color:rgba(255,255,255,0.1); }

        .del-btn { background:none; border:none; cursor:pointer; color:rgba(255,255,255,0.18); padding:6px 8px; border-radius:8px; font-size:14px; line-height:1; transition:all 0.15s; }
        .del-btn:hover { color:#EF4444; background:rgba(239,68,68,0.1); }

        .cancel-btn { flex:1; background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.55); border:1px solid rgba(255,255,255,0.09); border-radius:10px; padding:13px; font-size:15px; font-weight:500; cursor:pointer; font-family:inherit; transition:background 0.15s; }
        .cancel-btn:hover { background:rgba(255,255,255,0.07); }

        .gold-divider { height:1px; background:linear-gradient(90deg,transparent,rgba(212,175,55,0.25),transparent); margin:16px 0; }
      `}</style>

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <header style={{ background:'rgba(0,0,0,0.95)', borderBottom:'1px solid rgba(255,255,255,0.07)', backdropFilter:'blur(20px)', flexShrink:0 }}>
        <div style={{ padding:'0 40px', display:'flex', alignItems:'center', justifyContent:'space-between', height:72 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <SobhaLogo size={46} />
            <div>
              <div style={{ fontSize:20, fontWeight:800, color:'#fff', letterSpacing:'-0.5px', lineHeight:1.15 }}>
                RFI Intelligence <span className="gold-text">Platform</span>
              </div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.35)', marginTop:2 }}>
                Sobha Design Defect Analysis · Azure OpenAI GPT-4o
              </div>
            </div>
          </div>
          <button className="btn-gold" onClick={() => { setStep('idle'); setShowModal(true) }}>
            <span style={{ fontSize:19, lineHeight:1, marginTop:-1 }}>+</span> New Project
          </button>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <main style={{ flex:1, padding:'44px 40px', display:'flex', flexDirection:'column', gap:40 }}>

        {/* Stats row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
          {[
            { label:'Total Projects',    value:projects.length,                                 icon:'🏗️', sub:'workspaces' },
            { label:'Total RFIs Loaded', value:totalRFIs,                                       icon:'📋', sub:'across all projects' },
            { label:'Active Workspaces', value:projects.filter(p=>p.rfi_count>0).length,        icon:'◈',  sub:'with data' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                <span style={{ fontSize:20 }}>{s.icon}</span>
                <span style={{ fontSize:14, color:'rgba(255,255,255,0.45)', fontWeight:500 }}>{s.label}</span>
              </div>
              <div style={{ fontSize:44, fontWeight:800, color:'#fff', lineHeight:1, letterSpacing:'-2px' }}>{s.value}</div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.25)', marginTop:7 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Projects section */}
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'baseline', gap:12, marginBottom:24 }}>
            <h2 style={{ fontSize:22, fontWeight:700, color:'rgba(255,255,255,0.88)', letterSpacing:'-0.3px', margin:0 }}>
              Project Workspaces
            </h2>
            <span style={{ fontSize:14, color:'rgba(255,255,255,0.28)' }}>
              {projects.length} workspace{projects.length !== 1 ? 's' : ''}
            </span>
          </div>

          {projects.length === 0 ? (
            <div style={{ textAlign:'center', padding:'90px 24px', border:'1.5px dashed rgba(255,255,255,0.08)', borderRadius:22, background:'rgba(255,255,255,0.012)' }}>
              <div style={{ fontSize:58, marginBottom:20 }}>🏗️</div>
              <div style={{ fontSize:24, fontWeight:700, color:'rgba(255,255,255,0.78)', marginBottom:10 }}>No projects yet</div>
              <div style={{ fontSize:16, color:'rgba(255,255,255,0.3)', marginBottom:36, lineHeight:1.6 }}>
                Create your first workspace to start uploading<br />and classifying RFIs with AI
              </div>
              <button className="btn-gold" onClick={() => { setStep('idle'); setShowModal(true) }}>
                + Create First Project
              </button>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:20 }}>
              {projects.map((p, i) => (
                <div key={p.id} className="pcard" onClick={() => navigate(`/project/${p.id}/dashboard`)}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:18 }}>
                    <div style={{
                      width:50, height:50, borderRadius:14, flexShrink:0,
                      background:`${ACCENT[i % ACCENT.length]}18`,
                      border:`1px solid ${ACCENT[i % ACCENT.length]}35`,
                      display:'flex', alignItems:'center', justifyContent:'center', fontSize:22,
                    }}>🏢</div>
                    <button className="del-btn" onClick={e => openDeleteModal(e, p)} title="Delete project">✕</button>
                  </div>

                  <div style={{ fontSize:18, fontWeight:700, color:'#fff', marginBottom:6, letterSpacing:'-0.2px' }}>{p.name}</div>
                  {p.description && (
                    <div style={{ fontSize:14, color:'rgba(255,255,255,0.38)', marginBottom:10, lineHeight:1.55, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                      {p.description}
                    </div>
                  )}
                  <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:14 }}>
                    {p.client    && <div style={{ fontSize:13.5, color:'rgba(255,255,255,0.28)' }}>Client · <span style={{ color:'rgba(255,255,255,0.58)', fontWeight:500 }}>{p.client}</span></div>}
                    {p.consultant && <div style={{ fontSize:13.5, color:'rgba(255,255,255,0.28)' }}>Consultant · <span style={{ color:'rgba(255,255,255,0.58)', fontWeight:500 }}>{p.consultant}</span></div>}
                  </div>

                  <div className="gold-divider" />

                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:12 }}>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(212,175,55,0.1)', color:'#D4AF37', fontSize:13.5, fontWeight:600, padding:'5px 14px', borderRadius:20, border:'1px solid rgba(212,175,55,0.22)' }}>
                      {p.rfi_count ?? 0} RFIs
                    </span>
                    <span style={{ fontSize:12.5, color:'rgba(255,255,255,0.2)' }}>
                      {new Date(p.created_at).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── Create Project Modal ─────────────────────────────────────────────── */}
      {showModal && (
        <div className="overlay" onClick={() => step === 'idle' && setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>

            {step === 'creating' && (
              <div style={{ textAlign:'center', padding:'20px 0 14px' }}>
                <div style={{ display:'flex', justifyContent:'center', marginBottom:28 }}>
                  <div className="sp" />
                </div>
                <div style={{ fontSize:20, fontWeight:700, color:'#fff', marginBottom:10 }}>Creating workspace…</div>
                <div style={{ fontSize:15, color:'rgba(255,255,255,0.38)', lineHeight:1.65 }}>
                  Setting up your project in Azure SQL.<br />This takes just a moment.
                </div>
                <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:30, flexWrap:'wrap' }}>
                  {['Validating name','Creating project','Preparing workspace'].map(s => (
                    <div key={s} style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(212,175,55,0.08)', border:'1px solid rgba(212,175,55,0.18)', borderRadius:20, padding:'5px 13px' }}>
                      <div style={{ width:7, height:7, borderRadius:'50%', background:'#D4AF37' }} />
                      <span style={{ fontSize:12.5, color:'rgba(255,255,255,0.5)' }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 'done' && (
              <div style={{ textAlign:'center', padding:'20px 0 14px' }}>
                <div style={{ display:'flex', justifyContent:'center', marginBottom:22 }}>
                  <svg width="60" height="60" viewBox="0 0 60 60">
                    <circle cx="30" cy="30" r="28" fill="rgba(212,175,55,0.1)" stroke="#D4AF37" strokeWidth="1.5" />
                    <polyline points="18,30 26,38 42,22" fill="none" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div style={{ fontSize:20, fontWeight:700, color:'#fff', marginBottom:8 }}>Project Created!</div>
                <div style={{ fontSize:14.5, color:'rgba(255,255,255,0.4)' }}>Closing in a moment…</div>
              </div>
            )}

            {step === 'idle' && (
              <>
                <div style={{ marginBottom:28 }}>
                  <div style={{ fontSize:23, fontWeight:800, color:'#fff', letterSpacing:'-0.4px', marginBottom:7 }}>
                    New Project Workspace
                  </div>
                  <div style={{ fontSize:15, color:'rgba(255,255,255,0.35)' }}>
                    Isolated RFI data, categories, and AI memory per project
                  </div>
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {[
                    ['Project Name *', 'name',        'e.g. S-Tower Phase 2', true],
                    ['Description',    'description', 'Brief project overview'],
                    ['Client',         'client',      'e.g. Sobha Gold FZ LLC'],
                    ['Consultant',     'consultant',  'e.g. PNC Architects'],
                    ['Contractor',     'contractor',  'e.g. Sobha Constructions'],
                  ].map(([label, key, ph, req]) => (
                    <div key={key}>
                      <label style={{ display:'block', fontSize:13.5, fontWeight:600, color:'rgba(255,255,255,0.52)', marginBottom:7 }}>{label}</label>
                      <input
                        className="pi"
                        placeholder={ph}
                        value={form[key]}
                        onChange={e => setForm(f => ({ ...f, [key]:e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && req && handleCreate()}
                        autoFocus={key === 'name'}
                      />
                    </div>
                  ))}
                </div>

                <div style={{ display:'flex', gap:10, marginTop:28 }}>
                  <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn-gold" onClick={handleCreate} style={{ flex:2, justifyContent:'center' }}>
                    Create Project
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ─────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="overlay" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="modal-box" style={{ width:480 }} onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:20 }}>
              <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(239,68,68,0.1)', border:'1.5px solid rgba(239,68,68,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>🗑️</div>
            </div>
            <div style={{ fontSize:20, fontWeight:800, color:'#fff', textAlign:'center', marginBottom:6 }}>Delete Project?</div>
            <div style={{ fontSize:14, color:'rgba(255,255,255,0.45)', textAlign:'center', marginBottom:4 }}>
              <strong style={{ color:'rgba(255,255,255,0.8)' }}>{deleteTarget.name}</strong>
            </div>
            <div style={{ fontSize:13, color:'rgba(239,68,68,0.8)', textAlign:'center', marginBottom:22 }}>
              This will permanently delete {deleteTarget.rfi_count} RFIs and all project data.
            </div>

            <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'14px 16px', marginBottom:16 }}>
              <div style={{ fontSize:11.5, color:'rgba(212,175,55,0.8)', fontWeight:600, marginBottom:10, textTransform:'uppercase', letterSpacing:'0.5px' }}>Audit Record</div>
              <div style={{ marginBottom:10 }}>
                <label style={{ display:'block', fontSize:12.5, color:'rgba(255,255,255,0.45)', marginBottom:5 }}>Your Name *</label>
                <input className="pi" placeholder="e.g. Ahmed Al-Rashid" value={deleteBy} onChange={e => setDeleteBy(e.target.value)} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:12.5, color:'rgba(255,255,255,0.45)', marginBottom:5 }}>Reason (optional)</label>
                <input className="pi" placeholder="e.g. Project cancelled, duplicate entry…" value={deleteNotes} onChange={e => setDeleteNotes(e.target.value)} />
              </div>
            </div>

            <div style={{ display:'flex', gap:10 }}>
              <button className="cancel-btn" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</button>
              <button onClick={confirmDelete} disabled={deleting || !deleteBy.trim()}
                style={{ flex:2, background: deleteBy.trim() ? 'linear-gradient(135deg,#991B1B,#DC2626)' : 'rgba(239,68,68,0.3)', color: deleteBy.trim() ? '#fff' : 'rgba(255,255,255,0.3)', border:'none', borderRadius:10, padding:13, fontSize:15, fontWeight:700, cursor: deleteBy.trim() && !deleting ? 'pointer' : 'not-allowed', fontFamily:'inherit', transition:'all 0.15s' }}>
                {deleting ? 'Deleting…' : 'Yes, Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

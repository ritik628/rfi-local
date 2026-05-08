import { Outlet, NavLink, useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { getProjects } from '../services/api'

function SobhaLogo({ size = 36 }) {
  const [imgFailed, setImgFailed] = useState(false)
  return (
    <div style={{ width:size, height:size, borderRadius:Math.round(size*0.22), background:'#0a0a0a', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden', position:'relative' }}>
      {!imgFailed && (
        <img src="/sobha-logo.png" alt="Sobha"
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

const NAV = [
  { to:'dashboard',  label:'Dashboard',          icon:'◈' },
  { to:'upload',     label:'Upload Files',        icon:'↑' },
  { to:'rfi-log',    label:'RFI Log',             icon:'◫' },
  { to:'categories', label:'Categories',          icon:'⊞' },
  { to:'ai-agent',   label:'AI Agent',            icon:'◉' },
  { to:'finetuning', label:'Fine-tuning',         icon:'⊙' },
  { to:'team',       label:'Team & Activities',   icon:'👥' },
]

export default function Layout() {
  const { projectId } = useParams()
  const navigate      = useNavigate()
  const [project, setProject] = useState(null)

  useEffect(() => {
    getProjects().then(ps => setProject(ps.find(p => p.id === projectId)))
  }, [projectId])

  return (
    <div style={{ display:'flex', height:'100vh', fontFamily:"'Inter',system-ui,sans-serif", background:'#F4F6FA' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300..800&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background:#F1F5F9; }
        ::-webkit-scrollbar-thumb { background:#CBD5E1; border-radius:3px; }
        body { font-family:'Inter',system-ui,sans-serif; }

        .snav { display:flex; align-items:center; gap:11px; padding:10px 14px; border-radius:10px; margin-bottom:2px; font-size:14px; font-weight:500; color:#64748B; text-decoration:none; transition:all 0.15s; cursor:pointer; }
        .snav:hover { background:#EFF6FF; color:#1D4ED8; }
        .snav.active { background:#1D4ED8; color:#fff; box-shadow:0 2px 8px rgba(29,78,216,0.25); }
        .snav .icon { width:22px; height:22px; display:flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0; }

        .btn-primary { background:#1D4ED8; color:#fff; border:none; border-radius:9px; padding:10px 20px; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.15s; font-family:inherit; display:inline-flex; align-items:center; gap:7px; white-space:nowrap; }
        .btn-primary:hover { background:#1E40AF; box-shadow:0 4px 12px rgba(29,78,216,0.3); }
        .btn-primary:disabled { background:#93C5FD; cursor:not-allowed; box-shadow:none; }
        .btn-ghost { background:transparent; color:#374151; border:1px solid #E5E7EB; border-radius:9px; padding:9px 16px; font-size:14px; font-weight:500; cursor:pointer; transition:all 0.15s; font-family:inherit; display:inline-flex; align-items:center; gap:6px; }
        .btn-ghost:hover { background:#F9FAFB; border-color:#D1D5DB; }
        .input { background:#fff; border:1.5px solid #E5E7EB; border-radius:9px; padding:10px 14px; font-size:14px; color:#111827; outline:none; transition:all 0.15s; font-family:inherit; width:100%; }
        .input:focus { border-color:#1D4ED8; box-shadow:0 0 0 3px rgba(29,78,216,0.08); }
        select.input { cursor:pointer; }
        textarea.input { resize:vertical; min-height:90px; }
        .card { background:#fff; border:1px solid #E9EDF5; border-radius:14px; }
        .card-hover { transition:all 0.2s; }
        .card-hover:hover { border-color:#BFDBFE; box-shadow:0 4px 20px rgba(29,78,216,0.07); }
        .badge { display:inline-flex; align-items:center; padding:3px 10px; border-radius:20px; font-size:12px; font-weight:600; white-space:nowrap; }
        .conf-wrap { display:flex; align-items:center; gap:8px; }
        .conf-bar { flex:1; height:5px; background:#F1F5F9; border-radius:3px; overflow:hidden; min-width:50px; }
        .conf-fill { height:100%; border-radius:3px; transition:width 0.6s ease; }
        .conf-pct { font-size:12px; font-weight:700; min-width:32px; }
        .ph { color:#9CA3AF; }
        table { width:100%; border-collapse:collapse; font-size:13.5px; }
        th { padding:11px 13px; text-align:left; font-size:12px; font-weight:600; color:#6B7280; text-transform:uppercase; letter-spacing:0.5px; background:#FAFBFD; border-bottom:1.5px solid #E9EDF5; white-space:nowrap; position:sticky; top:0; z-index:1; }
        td { padding:11px 13px; color:#374151; border-bottom:1px solid #F3F5FA; vertical-align:top; }
        tr:hover td { background:#FAFCFF; }
        .page-header { background:#fff; border-bottom:1px solid #E9EDF5; padding:18px 30px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
        .page-title { font-size:19px; font-weight:700; color:#0F172A; letter-spacing:-0.3px; }
        .page-sub { font-size:13px; color:#94A3B8; margin-top:3px; }
        .overlay { position:fixed; inset:0; background:rgba(15,23,42,0.5); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:200; }
        .modal { background:#fff; border-radius:18px; padding:32px; box-shadow:0 28px 72px rgba(0,0,0,0.2); }
        .tag { display:inline-block; padding:3px 10px; border-radius:6px; font-size:12px; font-weight:600; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation:fadeUp 0.25s ease; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .spin { animation:spin 0.8s linear infinite; display:inline-block; }
      `}</style>

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside style={{ width:242, background:'#fff', borderRight:'1px solid #E9EDF5', display:'flex', flexDirection:'column', flexShrink:0 }}>

        {/* Brand */}
        <div style={{ padding:'18px 16px 14px', borderBottom:'1px solid #F1F5F9' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <SobhaLogo size={36} />
            <div>
              <div style={{ fontSize:14.5, fontWeight:800, color:'#0F172A', letterSpacing:'-0.3px', lineHeight:1.2 }}>RFI Intel</div>
              <div style={{ fontSize:11, color:'#94A3B8', marginTop:1 }}>Design Defect AI</div>
            </div>
          </div>
        </div>

        {/* Active project chip */}
        {project && (
          <div style={{ padding:'12px 16px', borderBottom:'1px solid #F1F5F9', background:'#FAFBFF' }}>
            <div style={{ fontSize:10.5, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:4, fontWeight:600 }}>Active Project</div>
            <div style={{ fontSize:13.5, fontWeight:700, color:'#1E293B', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{project.name}</div>
            <div style={{ fontSize:12, color:'#94A3B8', marginTop:2 }}>{project.rfi_count ?? 0} RFIs loaded</div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex:1, padding:'10px 10px', overflowY:'auto' }}>
          {NAV.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `snav${isActive ? ' active' : ''}`}>
              <span className="icon">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Back link */}
        <div style={{ padding:'10px', borderTop:'1px solid #F1F5F9' }}>
          <div onClick={() => navigate('/')} className="snav" style={{ color:'#64748B' }}>
            <span className="icon">←</span> All Projects
          </div>
        </div>
      </aside>

      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <Outlet />
      </div>
    </div>
  )
}

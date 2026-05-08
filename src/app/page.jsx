'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getProjects, createProject, deleteProject } from '../services/api';
import toast from 'react-hot-toast';
import { Building, ClipboardList, LayoutGrid, Building2, Trash2 } from 'lucide-react';
import SobhaLogo from '../components/ui/SobhaLogo';

const ACCENT = ['#D4AF37','#3B82F6','#8B5CF6','#06B6D4','#10B981'];

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects]   = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState({ name:'', description:'', client:'', consultant:'', contractor:'' });
  const [step, setStep]           = useState('idle'); // idle | creating | done
  const [deleteTarget, setDeleteTarget] = useState(null); // {id, name, rfi_count}
  const [deleteBy, setDeleteBy]   = useState('');
  const [deleteNotes, setDeleteNotes] = useState('');
  const [deleting, setDeleting]   = useState(false);

  const load = () => getProjects().then(setProjects).catch(() => {});
  useEffect(() => { load() }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) return toast.error('Project name is required');
    setStep('creating');
    const safetyTimer = setTimeout(() => {
      setStep('idle');
      toast.error('Request timed out — please try again');
    }, 15000);
    try {
      await createProject(form);
      clearTimeout(safetyTimer);
      setStep('done');
      toast.success('Project created');
      load();
      setTimeout(() => {
        setShowModal(false);
        setStep('idle');
        setForm({ name:'', description:'', client:'', consultant:'', contractor:'' });
      }, 1200);
    } catch (err) {
      clearTimeout(safetyTimer);
      setStep('idle');
    }
  };

  const openDeleteModal = (e, p) => {
    e.stopPropagation();
    setDeleteTarget({ id: p.id, name: p.name, rfi_count: p.rfi_count || 0 });
    setDeleteBy(''); setDeleteNotes('');
  };

  const confirmDelete = async () => {
    if (!deleteBy.trim()) return toast.error('Please enter your name for the audit record');
    setDeleting(true);
    try {
      await deleteProject(deleteTarget.id, { deleted_by: deleteBy.trim(), notes: deleteNotes.trim() });
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null); load();
    } catch {}
    setDeleting(false);
  };

  const totalRFIs = projects.reduce((s, p) => s + (p.rfi_count || 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <header className="bg-background/95 border-b border-border/10 backdrop-blur-md shrink-0">
        <div className="px-10 flex items-center justify-between h-[72px]">
          <div className="flex items-center gap-3.5">
            <SobhaLogo size={46} />
            <div>
              <div className="text-[20px] font-semibold text-foreground tracking-tight leading-tight">
                RFI Intelligence <span className="text-primary">Platform</span>
              </div>
              <div className="text-[13px] text-muted-foreground mt-0.5">
                Sobha Design Defect Analysis · Azure OpenAI GPT-4o
              </div>
            </div>
          </div>
          <button 
            className="btn-base bg-primary text-primary-foreground px-7 py-3 gap-2 hover:-translate-y-[1px] hover:brightness-110 transition-all" 
            onClick={() => { setStep('idle'); setShowModal(true) }}
          >
            <span className="text-[19px] leading-none -mt-[1px]">+</span> New Project
          </button>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <main className="flex-1 px-10 py-11 flex flex-col gap-10">

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label:'Total Projects',    value:projects.length,                                 icon:<Building className="w-5 h-5" />, sub:'workspaces' },
            { label:'Total RFIs Loaded', value:totalRFIs,                                       icon:<ClipboardList className="w-5 h-5" />, sub:'across all projects' },
            { label:'Active Workspaces', value:projects.filter(p=>p.rfi_count>0).length,        icon:<LayoutGrid className="w-5 h-5" />,  sub:'with data' },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-2xl px-7 py-6 transition-all hover:bg-muted hover:border-primary/20 shadow-sm">
              <div className="flex items-center gap-2.5 mb-3.5">
                <span className="text-[20px] text-muted-foreground">{s.icon}</span>
                <span className="text-[14px] text-muted-foreground font-medium">{s.label}</span>
              </div>
              <div className="text-[44px] font-semibold text-foreground leading-none tracking-tight">{s.value}</div>
              <div className="text-[13px] text-muted-foreground mt-2">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Projects section */}
        <div className="flex-1">
          <div className="flex items-baseline gap-3 mb-6">
            <h2 className="text-[22px] font-semibold text-foreground tracking-tight m-0">
              Project Workspaces
            </h2>
            <span className="text-[14px] text-muted-foreground">
              {projects.length} workspace{projects.length !== 1 ? 's' : ''}
            </span>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-24 px-6 border-2 border-dashed border-border rounded-[22px] bg-muted/30">
              <div className="flex justify-center mb-5 text-muted-foreground">
                <Building className="w-16 h-16" />
              </div>
              <div className="text-[24px] font-medium text-foreground mb-2.5">No projects yet</div>
              <div className="text-[16px] text-muted-foreground mb-9 leading-relaxed">
                Create your first workspace to start uploading<br />and classifying RFIs with AI
              </div>
              <button 
                className="btn-base bg-primary text-primary-foreground px-7 py-3 gap-2 hover:-translate-y-[1px] hover:brightness-110 transition-all"
                onClick={() => { setStep('idle'); setShowModal(true) }}
              >
                + Create First Project
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {projects.map((p, i) => (
                <div 
                  key={p.id} 
                  className="bg-card border border-border rounded-xl p-4 cursor-pointer transition-all hover:border-primary/40 hover:shadow-sm hover:-translate-y-[2px] flex items-center justify-between group"
                  onClick={() => router.push(`/project/${p.id}/dashboard`)}
                >
                  <div className="flex items-center gap-4 flex-1 overflow-hidden">
                    <div className="w-12 h-12 rounded-[12px] shrink-0 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <Building2 className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <div className="text-[16px] font-medium text-foreground tracking-tight truncate">{p.name}</div>
                        {p.description && (
                          <div className="text-[13px] text-muted-foreground truncate">
                            &mdash; {p.description}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 text-[13px] text-muted-foreground">
                        <span className="inline-flex items-center bg-primary/10 text-primary text-[11px] font-medium px-2 py-0.5 rounded-full border border-primary/20">
                          {p.rfi_count ?? 0} RFIs
                        </span>
                        {p.client && <span className="truncate max-w-[150px]">Client: <span className="text-foreground">{p.client}</span></span>}
                        {p.consultant && <span className="truncate max-w-[150px]">Consultant: <span className="text-foreground">{p.consultant}</span></span>}
                        <span className="text-muted-foreground/40 shrink-0">•</span>
                        <span className="shrink-0">{new Date(p.created_at).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    className="opacity-0 group-hover:opacity-100 bg-transparent border-none cursor-pointer text-muted-foreground p-2 ml-4 rounded-lg transition-all hover:text-destructive hover:bg-destructive/10 shrink-0" 
                    onClick={e => openDeleteModal(e, p)} 
                    title="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── Create Project Modal ─────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50" onClick={() => step === 'idle' && setShowModal(false)}>
          <div className="animate-in fade-in zoom-in-95 duration-200 bg-card border border-border rounded-[22px] p-9 w-[540px] max-w-[calc(100vw-32px)] shadow-lg" onClick={e => e.stopPropagation()}>

            {step === 'creating' && (
              <div className="text-center py-5 pb-3.5">
                <div className="flex justify-center mb-7">
                  <div className="w-[52px] h-[52px] border-4 border-muted border-t-primary rounded-full animate-spin" />
                </div>
                <div className="text-[20px] font-semibold text-foreground mb-2.5">Creating workspace…</div>
                <div className="text-[15px] text-muted-foreground leading-relaxed">
                  Setting up your project in Azure SQL.<br />This takes just a moment.
                </div>
                <div className="flex justify-center gap-2 mt-7 flex-wrap">
                  {['Validating name','Creating project','Preparing workspace'].map(s => (
                    <div key={s} className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-[12.5px] text-muted-foreground">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 'done' && (
              <div className="text-center py-5 pb-3.5">
                <div className="flex justify-center mb-5.5">
                  <svg width="60" height="60" viewBox="0 0 60 60">
                    <circle cx="30" cy="30" r="28" fill="var(--color-primary)" opacity="0.1" stroke="currentColor" className="text-primary" strokeWidth="1.5" />
                    <polyline points="18,30 26,38 42,22" fill="none" stroke="currentColor" className="text-primary" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="text-[20px] font-semibold text-foreground mb-2">Project Created!</div>
                <div className="text-[14.5px] text-muted-foreground">Closing in a moment…</div>
              </div>
            )}

            {step === 'idle' && (
              <>
                <div className="mb-7">
                  <div className="text-[23px] font-semibold text-foreground tracking-tight mb-2">
                    New Project Workspace
                  </div>
                  <div className="text-[15px] text-muted-foreground">
                    Isolated RFI data, categories, and AI memory per project
                  </div>
                </div>

                <div className="flex flex-col gap-3.5">
                  {[
                    ['Project Name *', 'name',        'e.g. S-Tower Phase 2', true],
                    ['Description',    'description', 'Brief project overview'],
                    ['Client',         'client',      'e.g. Sobha Gold FZ LLC'],
                    ['Consultant',     'consultant',  'e.g. PNC Architects'],
                    ['Contractor',     'contractor',  'e.g. Sobha Constructions'],
                  ].map(([label, key, ph, req]) => (
                    <div key={key}>
                      <label className="block text-[13.5px] font-medium text-muted-foreground mb-2">{label}</label>
                      <input
                        className="w-full bg-input/10 border border-input rounded-lg px-4 py-3 text-[15px] text-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-ring placeholder-muted-foreground"
                        placeholder={ph}
                        value={form[key]}
                        onChange={e => setForm(f => ({ ...f, [key]:e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && req && handleCreate()}
                        autoFocus={key === 'name'}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex gap-2.5 mt-7">
                  <button className="flex-1 bg-muted/50 text-foreground border border-input rounded-lg py-3 text-[15px] font-medium hover:bg-muted transition-colors" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="flex-[2] btn-base bg-primary text-primary-foreground py-3 hover:brightness-110" onClick={handleCreate}>
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
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="animate-in fade-in zoom-in-95 duration-200 bg-card border border-border rounded-[22px] p-9 w-[480px] shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="flex justify-center mb-5">
              <div className="w-14 h-14 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center text-destructive">
                <Trash2 className="w-7 h-7" />
              </div>
            </div>
            <div className="text-[20px] font-semibold text-foreground text-center mb-1.5">Delete Project?</div>
            <div className="text-[14px] text-muted-foreground text-center mb-1">
              <strong className="text-foreground">{deleteTarget.name}</strong>
            </div>
            <div className="text-[13px] text-destructive text-center mb-5.5">
              This will permanently delete {deleteTarget.rfi_count} RFIs and all project data.
            </div>

            <div className="bg-muted/30 border border-border rounded-xl p-4 mb-4">
              <div className="text-[11.5px] text-primary font-medium mb-2.5 uppercase tracking-wide">Audit Record</div>
              <div className="mb-2.5">
                <label className="block text-[12.5px] text-muted-foreground mb-1.5">Your Name *</label>
                <input className="w-full bg-input/10 border border-input rounded-lg px-4 py-3 text-[15px] text-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-ring placeholder-muted-foreground" placeholder="e.g. Ahmed Al-Rashid" value={deleteBy} onChange={e => setDeleteBy(e.target.value)} />
              </div>
              <div>
                <label className="block text-[12.5px] text-muted-foreground mb-1.5">Reason (optional)</label>
                <input className="w-full bg-input/10 border border-input rounded-lg px-4 py-3 text-[15px] text-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-ring placeholder-muted-foreground" placeholder="e.g. Project cancelled, duplicate entry…" value={deleteNotes} onChange={e => setDeleteNotes(e.target.value)} />
              </div>
            </div>

            <div className="flex gap-2.5">
              <button className="flex-1 bg-muted/50 text-foreground border border-input rounded-lg py-3 text-[15px] font-medium hover:bg-muted transition-colors" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</button>
              <button onClick={confirmDelete} disabled={deleting || !deleteBy.trim()}
                className={`flex-[2] rounded-lg py-3 text-[15px] font-medium transition-all ${deleteBy.trim() && !deleting ? 'bg-destructive text-destructive-foreground cursor-pointer hover:brightness-110' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>
                {deleting ? 'Deleting…' : 'Yes, Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

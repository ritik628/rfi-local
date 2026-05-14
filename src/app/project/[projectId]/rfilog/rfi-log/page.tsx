'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { RFI, RFIListResponse, ClassifyProgress, CorrectionPayload, Category, Discipline, SingleClassifyState } from '@/types';
import { 
  getRFIs, 
  classifyRFI, 
  reclassifyRFI,
  classifyAll, 
  stopClassify, 
  reclassifyBatch,
  getClassifyProgress, 
  updateRFI, 
  addExample, 
  getCategories,
  getDisciplines,
  addDiscipline,
  deleteDiscipline,
  exportExcel,
} from '@/lib/api/api';
import toast from 'react-hot-toast';
import { 
  Search, 
  Download, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  Settings2
} from 'lucide-react';
import ClassifyModal from './components/ClassifyModal';
import DisciplineModal from './components/DisciplineModal';
import CorrectionModal from './components/CorrectionModal';
import RFITable from './components/RFITable';
import RFIViewerModal from '@/components/blocks/modals/RFIViewerModal';
import SingleClassifyModal from './components/SingleClassifyModal';
import ConfidenceBreakdown from './components/ConfidenceBreakdown';
import CustomSelect from '@/components/ui/CustomSelect';

const DEFAULT_DISC = ['Civil','MEP','Façade','Structure','Landscape','Architecture','Interior Design'];
const SEVERITIES = ['Critical','High','Medium','Low'];
const SEV_COLOR = { Critical:'text-rose-700 dark:text-rose-400', High:'text-orange-700 dark:text-orange-400', Medium:'text-blue-700 dark:text-blue-400', Low:'text-emerald-700 dark:text-emerald-400' };
const SEV_BG = { Critical:'bg-rose-100 dark:bg-rose-950/30', High:'bg-orange-100 dark:bg-orange-950/30', Medium:'bg-blue-100 dark:bg-blue-950/30', Low:'bg-emerald-100 dark:bg-emerald-950/30' };
const SEV_BORDER = { Critical:'border-rose-200 dark:border-rose-900/50', High:'border-orange-200 dark:border-orange-900/50', Medium:'border-blue-200 dark:border-blue-900/50', Low:'border-emerald-200 dark:border-emerald-900/50' };

import PageHeader from '@/components/blocks/PageHeader';

export default function RFILogPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const [data, setData] = useState<RFIListResponse>({ rfis:[], total:0, unclassified_total:0, metrics: null });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [disc, setDisc] = useState('');
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState<RFI | null>(null);
  const [classifying, setClassifying] = useState<Record<string, boolean | string>>({});
  const [bulkRunning, setBulkRunning] = useState(false);
  const [progress, setProgress] = useState<ClassifyProgress | null>(null);
  const [correcting, setCorrecting] = useState<RFI | null>(null);
  const [corr, setCorr] = useState<CorrectionPayload>({});
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [showDiscModal, setShowDiscModal] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [confFilter, setConfFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewingRFI, setViewingRFI] = useState<RFI | null>(null);
  const [singleClassify, setSingleClassify] = useState<SingleClassifyState>({ isVisible: false, status: 'idle', rfi: null });

  const load = useCallback(() => {
    getRFIs(projectId, { page, per_page:50, search, discipline:disc, status, conf_filter:confFilter })
      .then((d: RFIListResponse) => { setData(d); setSelectedIds(new Set()); })
      .catch(() => {});
  }, [projectId, page, search, disc, status, confFilter]);

  useEffect(() => { load(); }, [load]);
  
  useEffect(() => {
    getDisciplines(projectId).then(setDisciplines).catch(() => {});
    getCategories().then(setCategories).catch(() => {});
  }, [projectId]);

  const classify = async (rfi: RFI) => {
    setClassifying(p => ({ ...p, [rfi.id]:true }));
    setSingleClassify({ isVisible: true, status: 'retrieving', rfi });
    try {
      setTimeout(() => setSingleClassify(p => ({ ...p, status: 'analyzing' })), 600);
      await classifyRFI(rfi.id);
      setSingleClassify(p => ({ ...p, status: 'ensemble' }));
      setTimeout(() => setSingleClassify(p => ({ ...p, status: 'saving' })), 500);
      setTimeout(() => setSingleClassify(p => ({ ...p, status: 'done' })), 800);
      toast.success(`${rfi.rfi_ref} classified`);
      load();
    } catch {
      setSingleClassify({ isVisible: false, status: 'idle', rfi: null });
    } finally { 
      setClassifying(p => ({ ...p, [rfi.id]:false })); 
    }
  };

  const reclassify = async (rfi: RFI) => {
    setClassifying(p => ({ ...p, [rfi.id]:'re' }));
    setSingleClassify({ isVisible: true, status: 'retrieving', rfi });
    try {
      setTimeout(() => setSingleClassify(p => ({ ...p, status: 'analyzing' })), 600);
      await reclassifyRFI(rfi.id);
      setSingleClassify(p => ({ ...p, status: 'ensemble' }));
      setTimeout(() => setSingleClassify(p => ({ ...p, status: 'saving' })), 500);
      setTimeout(() => setSingleClassify(p => ({ ...p, status: 'done' })), 800);
      toast.success(`${rfi.rfi_ref} re-classified`);
      load();
    } catch {
      setSingleClassify({ isVisible: false, status: 'idle', rfi: null });
    } finally { 
      setClassifying(p => ({ ...p, [rfi.id]:false })); 
    }
  };

  const bulkClassify = async () => {
    setBulkRunning(true);
    setProgress({ status:'queued', total: data.unclassified_total || 0, done:0, current:'' });
    try {
      const r = await classifyAll(projectId);
      if (r.total !== undefined) setProgress(p => ({ ...p, total: r.total }));
      const poll = setInterval(async () => {
        try {
          const p = await getClassifyProgress(projectId);
          setProgress(p);
          if (p.status === 'done' || p.status === 'stopped') {
            clearInterval(poll);
            setBulkRunning(false);
            load();
          } else if (p.status === 'idle' && p.total === 0) {
            clearInterval(poll);
            setBulkRunning(false);
          }
        } catch { clearInterval(poll); setBulkRunning(false); }
      }, 2000);
    } catch {
      setBulkRunning(false);
      setProgress(null);
    }
  };

  const toggleSelect = (id: string) => setSelectedIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const toggleSelectAll = () => {
    if (selectedIds.size === data.rfis.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.rfis.map(r => r.id)));
    }
  };

  const handleBatchReclassify = async () => {
    if (selectedIds.size === 0) return;
    setBulkRunning(true);
    const ids = [...selectedIds] as string[];
    setProgress({ status:'queued', total: ids.length, done:0, current:'' });
    try {
      const r = await reclassifyBatch(projectId, ids);
      if (r.total !== undefined) setProgress(p => ({ ...p, total: r.total }));
      const poll = setInterval(async () => {
        try {
          const p = await getClassifyProgress(projectId);
          setProgress(p);
          if (p.status === 'done' || p.status === 'stopped') {
            clearInterval(poll); setBulkRunning(false); load();
          }
        } catch { clearInterval(poll); setBulkRunning(false); }
      }, 2000);
    } catch { setBulkRunning(false); setProgress(null); }
  };

  const handleStop = async () => {
    try {
      await stopClassify(projectId);
      setProgress(p => p ? { ...p, status: 'stopping' } : p);
    } catch {}
  };

  const saveCorrection = async () => {
    if (!correcting) return;
    try {
      await updateRFI(correcting.id, corr);
      await addExample({ 
        project_id:projectId, 
        rfi_ref:correcting.rfi_ref, 
        subject:correcting.subject, 
        description_excerpt:(correcting.description||'').slice(0,300), 
        discipline:correcting.discipline, 
        correct_design_defect:corr.human_design_defect||correcting.ai_design_defect, 
        correct_next_level_category:corr.human_next_level_category||correcting.ai_next_level_category, 
        correct_sub_level_category:corr.human_sub_level_category||correcting.ai_sub_level_category, 
        correct_location:corr.human_location||correcting.ai_location, 
        added_by:'user' 
      });
      toast.success('Correction saved & AI updated');
      setCorrecting(null); load();
    } catch {}
  };

  const totalPages = Math.ceil(data.total / 50);
  const unclassifiedCount = data.unclassified_total || 0;
  const discList = disciplines.length > 0 ? disciplines.map(d => d.name) : DEFAULT_DISC;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background overflow-hidden relative">
      <PageHeader 
        title="RFI Log"
        subtitle={
          <>
            {data.total} total RFIs &bull; <span className="font-medium text-amber-600">{unclassifiedCount} pending</span>
          </>
        }
        actions={
          <>
            <button 
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-card border border-border px-3 py-2 rounded-xl text-[11px] md:text-sm font-medium text-foreground hover:bg-muted/50 transition-colors shadow-sm"
              onClick={() => exportExcel(projectId)}
            >
              <Download className="w-3.5 h-3.5" /> Export
            </button>
            <button 
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[11px] md:text-sm font-medium shadow-sm transition-all ${
                bulkRunning ? 'bg-muted text-muted-foreground' : 'bg-primary text-white hover:opacity-90'
              }`}
              onClick={bulkClassify} 
              disabled={bulkRunning}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${bulkRunning ? 'animate-spin' : ''}`} />
              {bulkRunning ? 'Running...' : 'Classify All'}
            </button>
          </>
        }
      />

      <div className="px-4 md:px-12 pt-4">
        <ConfidenceBreakdown 
          highConf={data.metrics?.high || 0}
          needsReview={(data.metrics?.medium || 0) + (data.metrics?.low || 0)}
          lowConf={data.metrics?.low || 0}
          total={data.metrics?.total || data.total || 0}
          classified={data.metrics?.classified || 0}
        />
      </div>

      {/* Filter Bar */}
      <div className="px-4 md:px-12 py-3 border-b border-border bg-muted/10 flex flex-wrap items-center gap-2 md:gap-3 shrink-0">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input 
            className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2 text-xs md:text-sm focus:ring-1 focus:ring-primary outline-none" 
            placeholder="Search RFI..." 
            value={search} 
            onChange={e => { setSearch(e.target.value); setPage(1); }} 
          />
        </div>
        
        <CustomSelect 
          className="flex-1 md:flex-none"
          options={[
            { label: 'All Disciplines', value: '' },
            ...discList.map(d => ({ label: d, value: d }))
          ]}
          value={disc}
          onChange={setDisc}
        />

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowDiscModal(true)}
            className="p-2.5 border border-border rounded-xl bg-card hover:bg-muted/50 text-muted-foreground transition-all"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>

        <CustomSelect 
          className="w-full md:w-auto"
          options={[
            { label: 'All Confidence', value: '' },
            { label: 'High (≥85%)', value: 'high' },
            { label: 'Medium (65-84%)', value: 'medium' },
            { label: 'Low (<65%)', value: 'low' },
          ]}
          value={confFilter}
          onChange={setConfFilter}
        />
        <div className="hidden sm:block ml-auto text-[13px] font-heading font-medium text-muted-foreground/50">
          {data.total} RFIs LOADED
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 flex min-h-0 px-4 md:px-12">
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Batch Action Bar */}
          {selectedIds.size > 0 && (
            <div className="bg-primary px-8 py-2.5 flex items-center gap-4 text-white animate-in slide-in-from-top duration-200">
              <span className="text-sm font-medium tracking-tight">{selectedIds.size} RFIs selected</span>
              <button 
                onClick={handleBatchReclassify} 
                disabled={bulkRunning}
                className="bg-white text-primary px-4 py-1.5 rounded-lg text-xs font-medium uppercase tracking-widest hover:opacity-90 disabled:opacity-50"
              >
                Reclassify Selected
              </button>
              <button 
                onClick={() => setSelectedIds(new Set())}
                className="text-[10px] font-medium uppercase tracking-[0.2em] opacity-80 hover:opacity-100"
              >
                Clear selection
              </button>
            </div>
          )}

          <RFITable 
            rfis={data.rfis}
            selected={selected}
            setSelected={setSelected}
            onView={(rfi) => setViewingRFI(rfi)}
            selectedIds={selectedIds}
            toggleSelect={toggleSelect}
            toggleSelectAll={toggleSelectAll}
            discList={discList}
            load={load}
            classify={classify}
            reclassify={reclassify}
            classifying={classifying}
            setCorrecting={setCorrecting}
            setCorr={setCorr}
            SEV_BG={SEV_BG}
            SEV_COLOR={SEV_COLOR}
            SEV_BORDER={SEV_BORDER}
            SEVERITIES={SEVERITIES}
          />
        </div>

        {/* Pagination Footer */}
        <div className="absolute bottom-0 left-0 right-0 px-8 py-4 bg-card border-t border-border flex items-center justify-between shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
          <div className="text-[11px] font-heading font-medium text-muted-foreground uppercase tracking-widest">
            SHOWING {(page-1)*50+1}–{Math.min(page*50, data.total)} OF {data.total} RFIs
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="p-2 border border-border rounded-xl hover:bg-muted/50 disabled:opacity-30 transition-all"
              onClick={() => setPage(p => Math.max(1, p-1))} 
              disabled={page===1}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = page > 3 ? (page - 2 + i) : (i + 1);
                if (pg > totalPages) return null;
                return (
                  <button 
                    key={pg} 
                    onClick={() => setPage(pg)}
                    className={`w-9 h-9 rounded-xl text-xs font-medium transition-all border ${
                      pg === page 
                        ? 'bg-foreground text-background border-foreground shadow-sm' 
                        : 'bg-card border-border hover:border-border/80 text-muted-foreground'
                    }`}
                  >
                    {pg}
                  </button>
                );
              })}
            </div>

            <button 
              className="p-2 border border-border rounded-xl hover:bg-muted/50 disabled:opacity-30 transition-all"
              onClick={() => setPage(p => Math.min(totalPages, p+1))} 
              disabled={page===totalPages}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <ClassifyModal 
        progress={progress}
        onDismiss={() => { setProgress(null); load(); }}
        onStop={handleStop}
      />

      <CorrectionModal 
        correcting={correcting}
        corr={corr}
        setCorr={setCorr}
        categories={categories}
        SEVERITIES={SEVERITIES}
        saveCorrection={saveCorrection}
        onDismiss={() => setCorrecting(null)}
      />

      {showDiscModal && (
        <DisciplineModal 
          projectId={projectId}
          disciplines={disciplines}
          onUpdate={setDisciplines}
          onClose={() => setShowDiscModal(false)}
        />
      )}

      <RFIViewerModal 
        rfi={viewingRFI}
        onDismiss={() => setViewingRFI(null)}
      />

      <SingleClassifyModal 
        isVisible={singleClassify.isVisible}
        status={singleClassify.status}
        rfi={singleClassify.rfi}
        onDismiss={() => setSingleClassify({ isVisible: false, status: 'idle', rfi: null })}
      />
    </div>
  );
}

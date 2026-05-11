'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { 
  uploadFile, 
  getUploadedFiles, 
  deleteUploadedFile,
  importResponsePDFs, 
  getResponseImportProgress, 
  updateProject, 
  getProjects 
} from '../../../../services/api';
import toast from 'react-hot-toast';
import { 
  FileText, 
  Table, 
  Tag, 
  FileUp, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle,
  RefreshCw,
  Info
} from 'lucide-react';
import FileTypeSelector from './components/FileTypeSelector';
import UploadHistory from './components/UploadHistory';

const FILE_TYPES = [
  { 
    value: 'rfi_log',          
    label: 'RFI Log',                   
    icon: Table, 
    desc: 'SS-RFI-Log.xlsx — main input file with Civil, MEP, Façade sheets',      
    multi: false, 
    pdf: false 
  },
  { 
    value: 'design_defects',   
    label: 'Design Defects Template',   
    icon: FileText, 
    desc: 'Project XYZ Design Defects Analysis — output template',                 
    multi: false, 
    pdf: false 
  },
  { 
    value: 'categories',       
    label: 'Categories File',           
    icon: Tag, 
    desc: 'Categories taxonomy definition file',                                    
    multi: false, 
    pdf: false 
  },
  { 
    value: 'rfi_response_pdf', 
    label: 'Consultant Response PDFs',  
    icon: FileUp, 
    desc: 'PlanGrid RFI PDFs — extracts consultant responses and links to RFI Log', 
    multi: true,  
    pdf: true  
  },
];

const STATUS_CONFIG = {
  uploaded:   { color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200',  icon: Clock },
  processing: { color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200',   icon: RefreshCw },
  processed:  { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle2 },
  error:      { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20', icon: XCircle }
};

const MISMATCH_LABELS = {
  name:       'Project Name',
  consultant: 'Consultant',
  client:     'Client',
  contractor: 'Contractor',
};

export default function UploadPage() {
  const { projectId } = useParams();
  const [fileType, setFileType]   = useState('rfi_log');
  const [files, setFiles]         = useState([]);
  const [uploading, setUploading] = useState(false);

  // PDF import state
  const [pdfFiles, setPdfFiles]     = useState([]);
  const [importing, setImporting]   = useState(false);
  const [importProg, setImportProg] = useState(null);
  const [importDone, setImportDone] = useState(null);

  // Blob URLs: filename → objectURL (for PDF preview)
  const [pdfBlobUrls, setPdfBlobUrls] = useState({});
  const blobUrlsRef = useRef({});   
  const importDoneRef = useRef(null);

  // Preview navigation + tab
  const [previewIdx, setPreviewIdx] = useState(0);
  const [previewTab, setPreviewTab] = useState('pdf');  // 'pdf' | 'extracted'

  // Project info for mismatch comparison
  const [projectInfo, setProjectInfo] = useState(null);

  const selectedType = FILE_TYPES.find(ft => ft.value === fileType);
  const isPdfMode    = selectedType?.pdf;
  const fileResults  = importDone?.file_results || [];
  const mismatches   = importDone?.metadata_mismatches || {};
  const showPreview  = isPdfMode && fileResults.length > 0;
  const currentFile  = fileResults[previewIdx] || null;
  const currentPdfUrl = currentFile ? pdfBlobUrls[currentFile.filename] : null;

  const loadFiles = useCallback(() => {
    getUploadedFiles(projectId)
      .then(setFiles)
      .catch(() => {});
  }, [projectId]);

  useEffect(() => {
    loadFiles();
    const t = setInterval(loadFiles, 5000);
    return () => clearInterval(t);
  }, [loadFiles]);

  useEffect(() => {
    getProjects().then(projects => {
      const p = projects.find(x => x.id === projectId);
      if (p) setProjectInfo(p);
    }).catch(() => {});
  }, [projectId]);

  // Poll import progress
  useEffect(() => {
    if (!importing) return;
    const poll = setInterval(async () => {
      try {
        const p = await getResponseImportProgress(projectId);
        setImportProg(p);
        if (p.status === 'done' || p.status === 'error') {
          clearInterval(poll);
          setImporting(false);
          if (p.status === 'done') {
            setImportDone(p);
            setPreviewIdx(0);
            setPreviewTab('extracted');
            loadFiles();
          }
        }
      } catch {}
    }, 1500);
    return () => clearInterval(poll);
  }, [importing, projectId, loadFiles]);

  useEffect(() => { importDoneRef.current = importDone; }, [importDone]);

  useEffect(() => {
    return () => {
      Object.values(blobUrlsRef.current).forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const _createBlobUrl = (file) => {
    const url = URL.createObjectURL(file);
    blobUrlsRef.current[file.name] = url;
    return url;
  };

  const _revokeBlobUrl = (filename) => {
    if (blobUrlsRef.current[filename]) {
      URL.revokeObjectURL(blobUrlsRef.current[filename]);
      delete blobUrlsRef.current[filename];
    }
  };

  const clearAllPdfs = () => {
    Object.values(blobUrlsRef.current).forEach(url => URL.revokeObjectURL(url));
    blobUrlsRef.current = {};
    setPdfBlobUrls({});
    setPdfFiles([]);
    setImportDone(null);
    setImportProg(null);
    setImporting(false);
  };

  const removePdf = (idx, filename) => {
    _revokeBlobUrl(filename);
    setPdfBlobUrls(prev => {
      const n = { ...prev };
      delete n[filename];
      return n;
    });
    setPdfFiles(prev => prev.filter((_, j) => j !== idx));
  };

  const handleDelete = async (fileId, filename) => {
    if (!confirm(`Delete "${filename}" and all its extracted RFIs?`)) return;
    try {
      const res = await deleteUploadedFile(fileId);
      toast.success(res.message || 'File deleted');
      loadFiles();
    } catch { 
      toast.error('Delete failed'); 
    }
  };

  const handleFixMismatch = async (field, pdfValue) => {
    try {
      await updateProject(projectId, { [field]: pdfValue });
      toast.success(`${MISMATCH_LABELS[field]} updated to "${pdfValue}"`);
      setImportDone(prev => ({
        ...prev,
        metadata_mismatches: { ...prev.metadata_mismatches, [field]: undefined },
      }));
      setProjectInfo(prev => prev ? { ...prev, [field]: pdfValue } : prev);
    } catch { 
      toast.error('Update failed'); 
    }
  };

  const handleIgnoreMismatch = (field) => {
    setImportDone(prev => ({
      ...prev,
      metadata_mismatches: { ...prev.metadata_mismatches, [field]: undefined },
    }));
  };

  const onDropExcel = useCallback(async (accepted) => {
    const file = accepted[0];
    if (!file) return;
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      return toast.error('Only Excel files (.xlsx, .xls) supported');
    }
    setUploading(true);
    try {
      const res = await uploadFile(projectId, file, fileType);
      toast.success(res.message || 'File uploaded successfully');
      loadFiles();
    } finally { 
      setUploading(false); 
    }
  }, [projectId, fileType, loadFiles]);

  const onDropPdf = useCallback((accepted) => {
    const pdfs = accepted.filter(f => f.name.toLowerCase().endsWith('.pdf'));
    if (!pdfs.length) return toast.error('Only PDF files are supported for this type');
    
    const newUrls = {};
    pdfs.forEach(f => { newUrls[f.name] = _createBlobUrl(f); });
    setPdfBlobUrls(prev => ({ ...prev, ...newUrls }));
    
    if (importDoneRef.current) {
      setPdfFiles(pdfs);
      setImportDone(null);
      setImportProg(null);
    } else {
      setPdfFiles(prev => {
        const names = new Set(prev.map(f => f.name));
        return [...prev, ...pdfs.filter(f => !names.has(f.name))];
      });
    }
  }, []);

  const handleImportPdfs = async () => {
    if (!pdfFiles.length) return;
    setImporting(true);
    setImportDone(null);
    setImportProg({ status: 'queued', total: pdfFiles.length, done: 0 });
    try {
      await importResponsePDFs(projectId, pdfFiles);
    } catch {
      setImporting(false);
    }
  };

  const { getRootProps: getExcelProps, getInputProps: getExcelInput, isDragActive: isDragExcel } = useDropzone({
    onDrop: onDropExcel, 
    multiple: false,
    accept: { 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 
      'application/vnd.ms-excel': ['.xls'] 
    }
  });

  const { getRootProps: getPdfProps, getInputProps: getPdfInput, isDragActive: isDragPdf } = useDropzone({
    onDrop: onDropPdf, 
    multiple: true, 
    accept: { 'application/pdf': ['.pdf'] }
  });

  const pct = importProg?.total > 0 ? Math.round((importProg.done / importProg.total) * 100) : 0;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-border bg-card">
        <h1 className="text-2xl font-semibold text-foreground">Upload Files</h1>
        <p className="text-sm text-muted-foreground mt-1">Upload RFI log Excel files or consultant response PDFs</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-themed">
        <div className={`max-w-[1400px] mx-auto grid gap-8 ${showPreview ? 'lg:grid-cols-[400px,1fr] grid-cols-1' : 'grid-cols-1 max-w-[800px]'}`}>
          
          {/* Left Column: Configuration and Upload */}
          <div className="space-y-6">
            
            <FileTypeSelector 
              fileTypes={FILE_TYPES}
              selectedValue={fileType}
              onSelect={(val) => { setFileType(val); setImportDone(null); }}
            />

            {/* 2. Upload Area */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h2 className="text-xs font-semibold text-foreground mb-4 uppercase tracking-wider">2. Upload content</h2>
              
              {isPdfMode ? (
                <div className="space-y-4">
                  <div 
                    {...getPdfProps()} 
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      isDragPdf 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-border/80 bg-muted/30'
                    }`}
                  >
                    <input {...getPdfInput()} />
                    <FileUp className={`w-10 h-10 mx-auto mb-4 ${isDragPdf ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="text-sm font-semibold text-foreground mb-1">
                      {isDragPdf ? 'Drop RFI PDFs here' : 'Drag & drop RFI PDFs, or click'}
                    </div>
                    <p className="text-xs text-muted-foreground">Multiple PDFs supported</p>
                  </div>

                  {pdfFiles.length > 0 && !importing && !importDone && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">
                          {pdfFiles.length} file{pdfFiles.length > 1 ? 's' : ''} queued
                        </span>
                        <button 
                          onClick={clearAllPdfs}
                          className="text-xs text-destructive hover:underline font-medium"
                        >
                          Clear all
                        </button>
                      </div>
                      <div className="max-h-40 overflow-y-auto space-y-1.5 pr-2 scrollbar-themed">
                        {pdfFiles.map((f, i) => (
                          <div key={i} className="flex items-center gap-3 bg-muted/40 border border-border rounded-lg p-2.5">
                            <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="flex-1 text-xs text-foreground truncate font-medium">{f.name}</span>
                            <span className="text-[10px] text-muted-foreground shrink-0">{(f.size / 1024).toFixed(0)} KB</span>
                            <button 
                              onClick={() => removePdf(i, f.name)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button 
                        className="w-full bg-foreground text-background font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        onClick={handleImportPdfs}
                      >
                        <RefreshCw className="w-4 h-4" /> Extract Responses
                      </button>
                    </div>
                  )}

                  {(importing || ['running', 'queued'].includes(importProg?.status)) && (
                    <div className="bg-muted/50 border border-border rounded-xl p-5 space-y-4">
                      <div className="flex justify-between items-center text-sm font-semibold">
                        <span className="text-foreground flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                          Extracting...
                        </span>
                        <span className="text-muted-foreground">
                          {importProg?.done || 0} / {importProg?.total || pdfFiles.length}
                        </span>
                      </div>
                      <div className="h-2 bg-border rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300" 
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      {importProg?.current && (
                        <p className="text-[10px] text-muted-foreground truncate uppercase tracking-tight">
                          Processing: {importProg.current}
                        </p>
                      )}
                    </div>
                  )}

                  {importDone && (
                    <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-5 space-y-4 text-center">
                      <div className="inline-flex p-2 bg-emerald-100 rounded-full text-emerald-600 mb-2">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-semibold text-emerald-800 uppercase tracking-wide">Import Complete</h3>
                      
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: 'Matched', val: importDone.matched, color: 'text-emerald-600' },
                          { label: 'Unmatched', val: importDone.unmatched, color: 'text-amber-600' },
                          { label: 'Errors', val: importDone.errors, color: 'text-destructive' }
                        ].map(stat => (
                          <div key={stat.label} className="bg-white border border-border/50 rounded-lg py-3 px-1">
                            <div className={`text-xl font-semibold ${stat.color}`}>{stat.val}</div>
                            <div className="text-[10px] text-muted-foreground uppercase font-semibold">{stat.label}</div>
                          </div>
                        ))}
                      </div>

                      {importDone.unmatched_refs?.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-left">
                          <div className="flex items-center gap-2 text-amber-800 text-[11px] font-semibold uppercase mb-2">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {importDone.unmatched_refs.length} failed matches
                          </div>
                          <div className="max-h-24 overflow-y-auto space-y-1 scrollbar-themed">
                            {importDone.unmatched_refs.map((ref, i) => (
                              <div key={i} className="text-[10px] text-amber-700 bg-amber-100/50 px-2 py-1 rounded truncate">
                                {ref}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <button 
                        onClick={clearAllPdfs}
                        className="w-full bg-white border border-border text-foreground font-semibold py-2.5 rounded-xl hover:bg-muted/30 transition-colors text-sm"
                      >
                        Import more PDFs
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div 
                  {...getExcelProps()} 
                  className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                    isDragExcel 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-border/80 bg-muted/30'
                  }`}
                >
                  <input {...getExcelInput()} />
                  {uploading ? (
                    <RefreshCw className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
                  ) : (
                    <Table className={`w-12 h-12 mx-auto mb-4 ${isDragExcel ? 'text-primary' : 'text-muted-foreground'}`} />
                  )}
                  <div className="text-sm font-semibold text-foreground mb-1">
                    {uploading ? 'Processing Excel...' : isDragExcel ? 'Drop Excel file here' : 'Drag & drop Excel, or click'}
                  </div>
                  <p className="text-xs text-muted-foreground">SS-RFI-Log.xlsx supported (max 50MB)</p>
                </div>
              )}
            </div>

            <UploadHistory 
              files={files}
              statusConfig={STATUS_CONFIG}
              onDelete={handleDelete}
            />

            {/* 4. Guidelines */}
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-semibold text-primary uppercase tracking-widest flex items-center gap-2">
                <Info className="w-4 h-4" /> Guidelines
              </h3>
              <div className="text-xs text-foreground/70 space-y-2 leading-relaxed">
                {isPdfMode ? (
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Supports <strong>PlanGrid RFI Export</strong> PDFs only.</li>
                    <li>Extraction: <strong>RFI No, Response, Signed By, Date</strong>.</li>
                    <li>Matching is performed by <strong>content content</strong>, not filename.</li>
                  </ul>
                ) : (
                  <ul className="list-disc pl-4 space-y-1">
                    <li>RFI Log must contain discipline sheets (CIVIL, MEP, etc).</li>
                    <li>Required: <strong>RFI Ref, Subject, Location, Description</strong>.</li>
                    <li>Maximum file size: <strong>50 MB</strong>.</li>
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: PDF Preview and Extraction Data */}
          {showPreview && (
            <div className="min-w-0 h-full">
              <div className="bg-card border border-border rounded-xl shadow-lg flex flex-col h-full sticky top-8 max-h-[calc(100vh-8rem)]">
                
                {/* Preview Header */}
                <div className="p-4 border-b border-border bg-muted/10 flex items-center justify-between shrink-0">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-widest">Extraction Preview</h3>
                  <div className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-1 rounded">
                    {previewIdx + 1} OF {fileResults.length} FILES
                  </div>
                </div>

                {/* File Navigation */}
                <div className="flex items-center border-b border-border bg-card shrink-0">
                  <button 
                    onClick={() => setPreviewIdx(i => Math.max(0, i - 1))} 
                    disabled={previewIdx === 0}
                    className="p-4 border-r border-border hover:bg-muted/50 disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex-1 flex gap-1.5 px-3 overflow-x-auto scrollbar-none py-3">
                    {fileResults.map((fr, i) => (
                      <button 
                        key={i} 
                        onClick={() => setPreviewIdx(i)}
                        className={`shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                          i === previewIdx 
                            ? 'bg-foreground text-background border-foreground shadow-sm' 
                            : fr.matched 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-muted text-muted-foreground border-border'
                        }`}
                      >
                        {fr.matched ? '✓' : '!'} FILE {i + 1}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setPreviewIdx(i => Math.min(fileResults.length - 1, i + 1))} 
                    disabled={previewIdx === fileResults.length - 1}
                    className="p-4 border-l border-border hover:bg-muted/50 disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Tab Switcher */}
                <div className="flex border-b border-border shrink-0">
                  {[
                    { id: 'pdf', label: 'PDF DOCUMENT', icon: FileText },
                    { id: 'extracted', label: 'EXTRACTED DATA', icon: Table }
                  ].map(tab => (
                    <button 
                      key={tab.id} 
                      onClick={() => setPreviewTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${
                        previewTab === tab.id 
                          ? 'border-primary text-primary bg-primary/5' 
                          : 'border-transparent text-muted-foreground hover:bg-muted/30'
                      }`}
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden">
                  {previewTab === 'pdf' ? (
                    <div className="h-full bg-muted/20 relative">
                      {currentPdfUrl ? (
                        <iframe
                          key={currentPdfUrl}
                          src={currentPdfUrl}
                          className="w-full h-full border-none"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-4">
                          <FileText className="w-12 h-12 opacity-20" />
                          <p className="text-xs font-medium">Document preview unavailable</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full overflow-y-auto p-8 space-y-8 scrollbar-themed">
                      
                      {/* File Info Header */}
                      <div className="flex items-start justify-between gap-6 pb-6 border-b border-border">
                        <div className="min-w-0">
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active Filename</span>
                          <h4 className="text-lg font-semibold text-foreground truncate mt-1" title={currentFile.filename}>
                            {currentFile.filename}
                          </h4>
                        </div>
                        <div className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          currentFile.matched 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : currentFile.error 
                              ? 'bg-destructive/10 text-destructive border-destructive/20' 
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {currentFile.matched 
                            ? `Matched ${currentFile.match_method === 'filename' ? '(Name)' : '(Content)'}` 
                            : currentFile.error ? 'Extraction Error' : 'No RFI Match'}
                        </div>
                      </div>

                      {currentFile.error && (
                        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 flex gap-3">
                          <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
                          <p className="text-sm text-destructive font-medium leading-relaxed">{currentFile.error}</p>
                        </div>
                      )}

                      {/* Primary Data Grid */}
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                            <RefreshCw className="w-3 h-3" /> RFI Reference
                          </label>
                          <div className="bg-muted/30 border border-border rounded-lg px-4 py-3 text-sm font-bold text-foreground">
                            {currentFile.rfi_no || 'Not detected'}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> Response Date
                          </label>
                          <div className="bg-muted/30 border border-border rounded-lg px-4 py-3 text-sm font-bold text-foreground">
                            {currentFile.response_date || 'Not detected'}
                          </div>
                        </div>
                      </div>

                      {/* Subject */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                          <Info className="w-3 h-3" /> Subject Line
                        </label>
                        <div className="bg-muted/30 border border-border rounded-lg px-4 py-3 text-sm font-medium text-foreground leading-relaxed">
                          {currentFile.subject || 'Not detected'}
                        </div>
                      </div>

                      {/* Consultant Response */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3" /> Extracted Consultant Response
                        </label>
                        <div className="bg-emerald-50/30 border border-emerald-100 rounded-xl p-5 text-sm text-foreground/90 leading-[1.8] min-h-[120px] whitespace-pre-wrap">
                          {currentFile.consultant_response || 'No response content extracted'}
                        </div>
                      </div>

                      {/* Signature Info */}
                      {currentFile.consultant_name && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Authorization</label>
                          <div className="bg-muted/30 border border-border rounded-xl p-5">
                            <div className="text-sm font-bold text-foreground">{currentFile.consultant_name}</div>
                            {currentFile.consultant_position && (
                              <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold">
                                {currentFile.consultant_position}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* PDF Metadata vs Project Comparison */}
                      <div className="space-y-4 pt-4">
                        <label className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" /> System Metadata Validation
                        </label>
                        
                        {/* Comparison Table */}
                        <div className="bg-amber-50/50 border border-amber-200 rounded-xl overflow-hidden">
                          <div className="grid grid-cols-2 bg-amber-100/50 text-[9px] font-black text-amber-800 uppercase tracking-widest px-4 py-2 border-b border-amber-200">
                            <div>PDF DATA POINT</div>
                            <div>VALUE EXTRACTED</div>
                          </div>
                          <div className="divide-y divide-amber-100">
                            {[
                              { label: 'Project', value: currentFile.project },
                              { label: 'Consultant', value: currentFile.consultant },
                              { label: 'Client', value: currentFile.client },
                              { label: 'Contractor', value: currentFile.contractor },
                            ].filter(f => f.value).map(item => (
                              <div key={item.label} className="grid grid-cols-2 px-4 py-3 items-center">
                                <div className="text-[11px] font-bold text-amber-900/60 uppercase">{item.label}</div>
                                <div className="text-xs font-semibold text-amber-900 truncate">{item.value}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Mismatch Resolution UI */}
                        {Object.entries(mismatches).some(([, v]) => v) && (
                          <div className="space-y-3 mt-6">
                            <div className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1.5 rounded-lg inline-block">
                              Discrepancies found with Project Settings
                            </div>
                            <div className="space-y-4">
                              {Object.entries(mismatches).map(([field, val]) => {
                                if (!val) return null;
                                return (
                                  <div key={field} className="bg-card border border-amber-200 rounded-xl p-4 shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="flex items-center justify-between mb-3">
                                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Mismatch: {MISMATCH_LABELS[field]}</span>
                                      <div className="flex gap-2">
                                        <button 
                                          onClick={() => handleIgnoreMismatch(field)}
                                          className="text-[10px] font-bold text-muted-foreground hover:text-foreground underline"
                                        >
                                          Ignore
                                        </button>
                                        <button 
                                          onClick={() => handleFixMismatch(field, val)}
                                          className="text-[10px] font-bold text-amber-600 hover:text-amber-700 underline"
                                        >
                                          Update Project
                                        </button>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="flex-1 bg-muted/50 p-2 rounded-lg text-xs border border-border">
                                        <div className="text-[8px] font-bold text-muted-foreground uppercase mb-0.5">Current</div>
                                        <div className="font-semibold text-foreground truncate">{projectInfo?.[field] || '—'}</div>
                                      </div>
                                      <div className="text-amber-400 font-bold">→</div>
                                      <div className="flex-1 bg-amber-50 p-2 rounded-lg text-xs border border-amber-200">
                                        <div className="text-[8px] font-bold text-amber-600 uppercase mb-0.5">Detected</div>
                                        <div className="font-bold text-amber-900 truncate">{val}</div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

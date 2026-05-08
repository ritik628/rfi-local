import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { uploadFile, getUploadedFiles, deleteUploadedFile,
         importResponsePDFs, getResponseImportProgress, updateProject, getProjects } from '../services/api'
import toast from 'react-hot-toast'

const FILE_TYPES = [
  { value: 'rfi_log',          label: 'RFI Log',                   icon: '📋', desc: 'SS-RFI-Log.xlsx — main input file with Civil, MEP, Façade sheets',      multi: false, pdf: false },
  { value: 'design_defects',   label: 'Design Defects Template',   icon: '📊', desc: 'Project XYZ Design Defects Analysis — output template',                 multi: false, pdf: false },
  { value: 'categories',       label: 'Categories File',           icon: '🏷️', desc: 'Categories taxonomy definition file',                                    multi: false, pdf: false },
  { value: 'rfi_response_pdf', label: 'Consultant Response PDFs',  icon: '📄', desc: 'PlanGrid RFI PDFs — extracts consultant responses and links to RFI Log', multi: true,  pdf: true  },
]

const ST = { uploaded: '#F59E0B', processing: '#3B82F6', processed: '#10B981', error: '#EF4444' }
const SI = { uploaded: '⏳', processing: '↻', processed: '✓', error: '✕' }

// Field key must match ProjectUpdate Pydantic model field names
const MISMATCH_LABELS = {
  name:       'Project Name',
  consultant: 'Consultant',
  client:     'Client',
  contractor: 'Contractor',
}

export default function UploadPage() {
  const { projectId } = useParams()
  const [fileType, setFileType]   = useState('rfi_log')
  const [files, setFiles]         = useState([])
  const [uploading, setUploading] = useState(false)

  // PDF import state
  const [pdfFiles, setPdfFiles]     = useState([])
  const [importing, setImporting]   = useState(false)
  const [importProg, setImportProg] = useState(null)
  const [importDone, setImportDone] = useState(null)

  // Blob URLs: filename → objectURL (for PDF preview)
  const [pdfBlobUrls, setPdfBlobUrls] = useState({})
  const blobUrlsRef = useRef({})   // keep in sync for cleanup
  const importDoneRef = useRef(null)

  // Preview navigation + tab
  const [previewIdx, setPreviewIdx] = useState(0)
  const [previewTab, setPreviewTab] = useState('pdf')  // 'pdf' | 'extracted'

  // Project info for mismatch comparison
  const [projectInfo, setProjectInfo] = useState(null)

  const selectedType = FILE_TYPES.find(ft => ft.value === fileType)
  const isPdfMode    = selectedType?.pdf
  const fileResults  = importDone?.file_results || []
  const mismatches   = importDone?.metadata_mismatches || {}
  const showPreview  = isPdfMode && fileResults.length > 0
  const currentFile  = fileResults[previewIdx] || null
  const currentPdfUrl = currentFile ? pdfBlobUrls[currentFile.filename] : null

  const loadFiles = useCallback(() => getUploadedFiles(projectId).then(setFiles).catch(() => {}), [projectId])

  useEffect(() => {
    loadFiles()
    const t = setInterval(loadFiles, 4000)
    return () => clearInterval(t)
  }, [loadFiles])

  useEffect(() => {
    getProjects().then(projects => {
      const p = projects.find(x => x.id === projectId)
      if (p) setProjectInfo(p)
    }).catch(() => {})
  }, [projectId])

  // Poll import progress
  useEffect(() => {
    if (!importing) return
    const poll = setInterval(async () => {
      try {
        const p = await getResponseImportProgress(projectId)
        setImportProg(p)
        if (p.status === 'done' || p.status === 'error') {
          clearInterval(poll)
          setImporting(false)
          if (p.status === 'done') {
            setImportDone(p)
            setPreviewIdx(0)
            setPreviewTab('extracted')  // switch to extracted data tab first
            loadFiles()
          }
        }
      } catch {}
    }, 1500)
    return () => clearInterval(poll)
  }, [importing, projectId, loadFiles])

  // Keep importDoneRef in sync so onDropPdf can read it without stale closure
  useEffect(() => { importDoneRef.current = importDone }, [importDone])

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(blobUrlsRef.current).forEach(url => URL.revokeObjectURL(url))
    }
  }, [])

  const _createBlobUrl = (file) => {
    const url = URL.createObjectURL(file)
    blobUrlsRef.current[file.name] = url
    return url
  }

  const _revokeBlobUrl = (filename) => {
    if (blobUrlsRef.current[filename]) {
      URL.revokeObjectURL(blobUrlsRef.current[filename])
      delete blobUrlsRef.current[filename]
    }
  }

  const clearAllPdfs = () => {
    Object.values(blobUrlsRef.current).forEach(url => URL.revokeObjectURL(url))
    blobUrlsRef.current = {}
    setPdfBlobUrls({})
    setPdfFiles([])
    setImportDone(null)
    setImportProg(null)
    setImporting(false)
  }

  const removePdf = (idx, filename) => {
    _revokeBlobUrl(filename)
    setPdfBlobUrls(prev => { const n = { ...prev }; delete n[filename]; return n })
    setPdfFiles(prev => prev.filter((_, j) => j !== idx))
  }

  const handleDelete = async (fileId, filename) => {
    if (!confirm(`Delete "${filename}" and all its extracted RFIs?`)) return
    try {
      const res = await deleteUploadedFile(fileId)
      toast.success(res.message || 'File deleted')
      loadFiles()
    } catch { toast.error('Delete failed') }
  }

  const handleFixMismatch = async (field, pdfValue) => {
    try {
      await updateProject(projectId, { [field]: pdfValue })
      toast.success(`${MISMATCH_LABELS[field]} updated to "${pdfValue}"`)
      setImportDone(prev => ({
        ...prev,
        metadata_mismatches: { ...prev.metadata_mismatches, [field]: undefined },
      }))
      setProjectInfo(prev => prev ? { ...prev, [field]: pdfValue } : prev)
    } catch { toast.error('Update failed') }
  }

  const handleIgnoreMismatch = (field) => {
    setImportDone(prev => ({
      ...prev,
      metadata_mismatches: { ...prev.metadata_mismatches, [field]: undefined },
    }))
  }

  const onDropExcel = useCallback(async (accepted) => {
    const file = accepted[0]
    if (!file) return
    if (!file.name.match(/\.(xlsx|xls)$/i)) return toast.error('Only Excel files (.xlsx, .xls) supported')
    setUploading(true)
    try {
      const res = await uploadFile(projectId, file, fileType)
      toast.success(res.message || 'File uploaded successfully')
      loadFiles()
    } finally { setUploading(false) }
  }, [projectId, fileType, loadFiles])

  const onDropPdf = useCallback((accepted) => {
    const pdfs = accepted.filter(f => f.name.toLowerCase().endsWith('.pdf'))
    if (!pdfs.length) return toast.error('Only PDF files are supported for this type')
    const newUrls = {}
    pdfs.forEach(f => { newUrls[f.name] = _createBlobUrl(f) })
    setPdfBlobUrls(prev => ({ ...prev, ...newUrls }))
    if (importDoneRef.current) {
      // After a completed import: start fresh with only the new files
      setPdfFiles(pdfs)
      setImportDone(null)
      setImportProg(null)
    } else {
      setPdfFiles(prev => {
        const names = new Set(prev.map(f => f.name))
        return [...prev, ...pdfs.filter(f => !names.has(f.name))]
      })
    }
  }, [])

  const handleImportPdfs = async () => {
    if (!pdfFiles.length) return
    setImporting(true)
    setImportDone(null)
    setImportProg({ status: 'queued', total: pdfFiles.length, done: 0 })
    try {
      await importResponsePDFs(projectId, pdfFiles)
    } catch {
      setImporting(false)
    }
  }

  const { getRootProps: getExcelProps, getInputProps: getExcelInput, isDragActive: isDragExcel } = useDropzone({
    onDrop: onDropExcel, multiple: false,
    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'application/vnd.ms-excel': ['.xls'] }
  })
  const { getRootProps: getPdfProps, getInputProps: getPdfInput, isDragActive: isDragPdf } = useDropzone({
    onDrop: onDropPdf, multiple: true, accept: { 'application/pdf': ['.pdf'] }
  })

  const pct = importProg?.total > 0 ? Math.round((importProg.done / importProg.total) * 100) : 0

  // ── Left panel ───────────────────────────────────────────────────────────────
  const LeftPanel = (
    <div>

      {/* 1. Select file type */}
      <div className="card" style={{ padding: 22, marginBottom: 20 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', marginBottom: 14 }}>1. Select file type</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FILE_TYPES.map(ft => (
            <label key={ft.value} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', background: fileType === ft.value ? '#EFF6FF' : '#FAFBFD', border: `1.5px solid ${fileType === ft.value ? '#BFDBFE' : '#E9EDF5'}`, borderRadius: 11, cursor: 'pointer' }}>
              <input type="radio" name="fileType" value={ft.value} checked={fileType === ft.value} onChange={() => { setFileType(ft.value); setImportDone(null) }} />
              <span style={{ fontSize: 18 }}>{ft.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{ft.label}</span>
                  {ft.multi && <span style={{ fontSize: 10.5, background: '#DBEAFE', color: '#1D4ED8', padding: '1px 7px', borderRadius: 20, fontWeight: 600 }}>BULK</span>}
                </div>
                <div style={{ fontSize: 11.5, color: '#6B7280', marginTop: 1 }}>{ft.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* 2. Upload file */}
      <div className="card" style={{ padding: 22, marginBottom: 20 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', marginBottom: 14 }}>2. Upload file</div>

        {isPdfMode ? (
          <>
            <div {...getPdfProps()} style={{ border: `2px dashed ${isDragPdf ? '#7C3AED' : '#D1D5DB'}`, borderRadius: 12, padding: '24px 16px', textAlign: 'center', background: isDragPdf ? '#F5F3FF' : '#FAFAFA', cursor: 'pointer', marginBottom: 12 }}>
              <input {...getPdfInput()} />
              <div style={{ fontSize: 28, marginBottom: 6 }}>{isDragPdf ? '📂' : '📄'}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 2 }}>
                {isDragPdf ? 'Drop RFI PDFs here' : 'Drag & drop RFI PDFs, or click to browse'}
              </div>
              <div style={{ fontSize: 11.5, color: '#9CA3AF' }}>Multiple PDFs · Filename doesn't need to match RFI No.</div>
            </div>

            {pdfFiles.length > 0 && !importing && !importDone && (
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  {pdfFiles.length} PDF{pdfFiles.length > 1 ? 's' : ''} queued
                </div>
                <div style={{ maxHeight: 150, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
                  {pdfFiles.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 8, padding: '5px 10px' }}>
                      <span style={{ fontSize: 13 }}>📄</span>
                      <span style={{ flex: 1, fontSize: 12, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                      <span style={{ fontSize: 11, color: '#9CA3AF', flexShrink: 0 }}>{(f.size / 1024).toFixed(0)} KB</span>
                      <button onClick={() => removePdf(i, f.name)}
                        style={{ background: 'none', border: 'none', color: '#D1D5DB', cursor: 'pointer', fontSize: 13, padding: 2 }}
                        onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                        onMouseLeave={e => e.currentTarget.style.color = '#D1D5DB'}>✕</button>
                    </div>
                  ))}
                </div>
                <button className="btn-primary" onClick={handleImportPdfs} style={{ width: '100%', justifyContent: 'center' }}>
                  ⚡ Extract Consultant Responses ({pdfFiles.length} PDFs)
                </button>
              </div>
            )}

            {(importing || importProg?.status === 'running' || importProg?.status === 'queued') && (
              <div style={{ background: '#F8FAFC', border: '1.5px solid #E5E7EB', borderRadius: 10, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Extracting…</span>
                  <span style={{ fontSize: 13, color: '#6B7280' }}>{importProg?.done || 0} / {importProg?.total || pdfFiles.length}</span>
                </div>
                <div style={{ height: 8, background: '#E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: '#7C3AED', borderRadius: 4, transition: 'width 0.3s' }} />
                </div>
                {importProg?.current && (
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {importProg.current}
                  </div>
                )}
              </div>
            )}

            {importDone && (
              <div style={{ background: '#F0FDF4', border: '1.5px solid #BBF7D0', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#15803D', marginBottom: 10 }}>✓ Import Complete</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
                  {[['Matched', importDone.matched, '#15803D'], ['Unmatched', importDone.unmatched, '#D97706'], ['Errors', importDone.errors, '#DC2626']].map(([label, val, color]) => (
                    <div key={label} style={{ textAlign: 'center', background: '#fff', borderRadius: 8, padding: '8px 4px', border: `1.5px solid ${color}20` }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color }}>{val}</div>
                      <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>{label}</div>
                    </div>
                  ))}
                </div>

                {importDone.unmatched_refs?.length > 0 && (
                  <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '10px 12px', marginBottom: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#92400E', marginBottom: 6 }}>
                      ⚠ {importDone.unmatched_refs.length} unmatched / error files
                    </div>
                    <div style={{ maxHeight: 120, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {importDone.unmatched_refs.map((ref, i) => (
                        <div key={i} style={{ fontSize: 11.5, color: '#78350F', background: '#FEF3C7', padding: '3px 8px', borderRadius: 5, wordBreak: 'break-all' }}>
                          {ref}
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: '#92400E', marginTop: 6, lineHeight: 1.5 }}>
                      Matching is by <strong>RFI No. extracted from PDF content</strong>, not the filename.
                    </div>
                  </div>
                )}

                <button onClick={clearAllPdfs}
                  style={{ width: '100%', background: '#F8FAFC', border: '1.5px solid #E5E7EB', borderRadius: 8, padding: '8px 0', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Import more PDFs
                </button>
              </div>
            )}
          </>
        ) : (
          <div {...getExcelProps()} style={{ border: `2px dashed ${isDragExcel ? '#1D4ED8' : '#D1D5DB'}`, borderRadius: 12, padding: '44px 24px', textAlign: 'center', background: isDragExcel ? '#EFF6FF' : '#FAFAFA', cursor: 'pointer' }}>
            <input {...getExcelInput()} />
            <div style={{ fontSize: 40, marginBottom: 12 }}>{uploading ? '⏳' : isDragExcel ? '📂' : '📁'}</div>
            {uploading ? (
              <div style={{ fontSize: 14.5, color: '#1D4ED8', fontWeight: 600 }}>Uploading & extracting RFIs…</div>
            ) : isDragExcel ? (
              <div style={{ fontSize: 14.5, color: '#1D4ED8', fontWeight: 600 }}>Drop your Excel file here</div>
            ) : (
              <>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Drag & drop your Excel file, or click to browse</div>
                <div style={{ fontSize: 12.5, color: '#9CA3AF' }}>Supports .xlsx and .xls up to 50 MB</div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 3. Uploaded Files */}
      {files.length > 0 && (
        <div className="card" style={{ overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F5FA', fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
            3. Uploaded Files ({files.length})
          </div>
          {files.map(f => (
            <div key={f.id} style={{ padding: '12px 18px', borderBottom: '1px solid #F9FAFB', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 34, height: 34, background: f.file_type === 'rfi_response_pdf' ? '#F5F3FF' : '#F0FDF4', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
                {f.file_type === 'rfi_response_pdf' ? '📄' : '📊'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.filename}</div>
                <div style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 2 }}>
                  {f.file_type === 'rfi_response_pdf'
                    ? `${f.row_count > 0 ? `${f.row_count} RFIs matched` : 'Processing…'}`
                    : `${f.row_count > 0 ? `${f.row_count} RFIs extracted` : 'Processing…'}`
                  } · {new Date(f.created_at).toLocaleString('en-GB')}
                </div>
                {f.error_msg && f.file_type === 'rfi_response_pdf' && f.status === 'processed' && (
                  <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{f.error_msg}</div>
                )}
                {f.error_msg && f.file_type !== 'rfi_response_pdf' && (
                  <div style={{ fontSize: 11, color: '#DC2626', marginTop: 3, background: '#FEF2F2', padding: '4px 8px', borderRadius: 5 }}>{f.error_msg}</div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: ST[f.status] + '18', padding: '4px 10px', borderRadius: 20, border: `1px solid ${ST[f.status]}30` }}>
                  <span style={{ color: ST[f.status], fontSize: 12 }} className={f.status === 'processing' ? 'spin' : undefined}>{SI[f.status]}</span>
                  <span style={{ fontSize: 11.5, color: ST[f.status], fontWeight: 600, textTransform: 'capitalize' }}>{f.status}</span>
                </div>
                <button onClick={() => handleDelete(f.id, f.filename)}
                  style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 7, color: '#DC2626', padding: '5px 9px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Expected Input Format */}
      <div style={{ padding: '14px 16px', background: '#F0F9FF', border: '1.5px solid #BAE6FD', borderRadius: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0369A1', marginBottom: 7 }}>
          {isPdfMode ? '📄 PDF Format (PlanGrid RFI Export)' : '📋 Expected Input Format'}
        </div>
        {isPdfMode ? (
          <div style={{ fontSize: 12, color: '#0C4A6E', lineHeight: 1.7 }}>
            Each PDF must be a PlanGrid RFI export (one RFI per file).<br />
            Extracted: <strong>RFI No. · Consultant Response · Signed By · Position · Response Date</strong><br />
            Matching by <strong>RFI No. extracted from PDF content</strong> — not the filename.<br />
            Filename is used as fallback only if extraction fails.
          </div>
        ) : (
          <div style={{ fontSize: 12, color: '#0C4A6E', lineHeight: 1.7 }}>
            RFI Log with discipline sheets (RFI-CIVIL, RFI-MEP, RFI-FACADE etc.)<br />
            Required columns: <strong>RFI Ref · Subject · Level/Location · Description · Received Date</strong>
          </div>
        )}
      </div>
    </div>
  )

  // ── Right panel (PDF + extracted data preview) ────────────────────────────
  const RightPanel = showPreview && (
    <div style={{ minWidth: 0 }}>
      <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'sticky', top: 20 }}>

        {/* Panel header + nav counter */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #F3F5FA', background: '#FAFBFD', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', flex: 1 }}>Extraction Preview</span>
          <span style={{ fontSize: 12, color: '#6B7280' }}>{previewIdx + 1} / {fileResults.length} files</span>
        </div>

        {/* File navigation bar */}
        <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #F3F5FA' }}>
          <button onClick={() => setPreviewIdx(i => Math.max(0, i - 1))} disabled={previewIdx === 0}
            style={{ padding: '9px 14px', background: 'none', border: 'none', borderRight: '1px solid #F3F5FA', cursor: previewIdx === 0 ? 'default' : 'pointer', color: previewIdx === 0 ? '#D1D5DB' : '#374151', fontSize: 15, fontFamily: 'inherit' }}>
            ←
          </button>
          <div style={{ flex: 1, display: 'flex', overflowX: 'auto', padding: '4px 6px', gap: 4 }}>
            {fileResults.map((fr, i) => (
              <button key={i} onClick={() => setPreviewIdx(i)}
                title={fr.filename}
                style={{ flexShrink: 0, padding: '3px 8px', borderRadius: 6, border: `1.5px solid ${i === previewIdx ? '#7C3AED' : '#E5E7EB'}`, background: i === previewIdx ? '#F5F3FF' : '#F9FAFB', fontSize: 11, color: i === previewIdx ? '#7C3AED' : (fr.matched ? '#15803D' : '#DC2626'), cursor: 'pointer', fontFamily: 'inherit', fontWeight: i === previewIdx ? 700 : 400 }}>
                {fr.matched ? '✓' : '✗'} {i + 1}
              </button>
            ))}
          </div>
          <button onClick={() => setPreviewIdx(i => Math.min(fileResults.length - 1, i + 1))} disabled={previewIdx === fileResults.length - 1}
            style={{ padding: '9px 14px', background: 'none', border: 'none', borderLeft: '1px solid #F3F5FA', cursor: previewIdx === fileResults.length - 1 ? 'default' : 'pointer', color: previewIdx === fileResults.length - 1 ? '#D1D5DB' : '#374151', fontSize: 15, fontFamily: 'inherit' }}>
            →
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid #F3F5FA' }}>
          {[['pdf', '📄 PDF'], ['extracted', '📋 Extracted Data']].map(([tab, label]) => (
            <button key={tab} onClick={() => setPreviewTab(tab)}
              style={{ flex: 1, padding: '9px 0', background: previewTab === tab ? '#fff' : '#F9FAFB', border: 'none', borderBottom: previewTab === tab ? '2px solid #7C3AED' : '2px solid transparent', color: previewTab === tab ? '#7C3AED' : '#6B7280', fontWeight: previewTab === tab ? 700 : 400, fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
              {label}
            </button>
          ))}
        </div>

        {/* PDF tab */}
        {previewTab === 'pdf' && (
          <div style={{ background: '#1a1a2e' }}>
            {currentPdfUrl ? (
              <iframe
                key={currentPdfUrl}
                src={currentPdfUrl}
                title={`PDF: ${currentFile?.filename}`}
                style={{ width: '100%', height: 'calc(100vh - 340px)', minHeight: 500, border: 'none', display: 'block' }}
              />
            ) : (
              <div style={{ height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', gap: 10 }}>
                <div style={{ fontSize: 36 }}>📄</div>
                <div style={{ fontSize: 13, color: '#6B7280', textAlign: 'center' }}>
                  {fileResults.length > 0
                    ? 'PDF preview not available — file was imported in a previous session'
                    : 'No PDF selected'}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Extracted data tab */}
        {previewTab === 'extracted' && currentFile && (
          <div style={{ padding: 16, overflowY: 'auto', maxHeight: 'calc(100vh - 320px)' }}>

            {/* File + match badge */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>File</div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#111827', wordBreak: 'break-all', lineHeight: 1.4 }}>{currentFile.filename}</div>
              </div>
              <span style={{ flexShrink: 0, padding: '4px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 700,
                background: currentFile.matched ? '#D1FAE5' : currentFile.error ? '#FEE2E2' : '#FEF3C7',
                color:      currentFile.matched ? '#065F46' : currentFile.error ? '#991B1B' : '#92400E',
                border: `1px solid ${currentFile.matched ? '#6EE7B7' : currentFile.error ? '#FCA5A5' : '#FDE68A'}`,
              }}>
                {currentFile.matched
                  ? `✓ Matched${currentFile.match_method === 'filename' ? ' (filename)' : ''}`
                  : currentFile.error ? '✕ Error' : '✗ No match'}
              </span>
            </div>

            {currentFile.error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: '#991B1B', marginBottom: 12 }}>
                {currentFile.error}
              </div>
            )}

            {/* RFI info fields */}
            {[
              { label: 'RFI No.', value: currentFile.rfi_no },
              { label: 'Subject', value: currentFile.subject },
            ].filter(f => f.value).map(({ label, value }) => (
              <div key={label} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 12.5, color: '#374151', background: '#F9FAFB', padding: '6px 10px', borderRadius: 6, border: '1px solid #E5E7EB' }}>{value}</div>
              </div>
            ))}

            {/* Consultant Response */}
            {currentFile.consultant_response && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Consultant Response</div>
                <div style={{ fontSize: 12.5, color: '#374151', background: '#F0FDF4', padding: '10px 12px', borderRadius: 8, border: '1px solid #BBF7D0', lineHeight: 1.65, maxHeight: 180, overflowY: 'auto' }}>
                  {currentFile.consultant_response}
                  {currentFile.consultant_response.length >= 400 && (
                    <span style={{ color: '#9CA3AF' }}> … (preview truncated)</span>
                  )}
                </div>
              </div>
            )}

            {/* Signed by + position + date in grid */}
            {(currentFile.consultant_name || currentFile.response_date) && (
              <div style={{ display: 'grid', gridTemplateColumns: currentFile.response_date ? '1fr 1fr' : '1fr', gap: 10, marginBottom: 12 }}>
                {currentFile.consultant_name && (
                  <div>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Signed By</div>
                    <div style={{ fontSize: 12.5, color: '#374151', background: '#F9FAFB', padding: '8px 10px', borderRadius: 6, border: '1px solid #E5E7EB', lineHeight: 1.5 }}>
                      <div style={{ fontWeight: 600 }}>{currentFile.consultant_name}</div>
                      {currentFile.consultant_position && (
                        <div style={{ fontSize: 11.5, color: '#6B7280', marginTop: 2 }}>{currentFile.consultant_position}</div>
                      )}
                    </div>
                  </div>
                )}
                {currentFile.response_date && (
                  <div>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>Response Date</div>
                    <div style={{ fontSize: 12.5, color: '#374151', background: '#F9FAFB', padding: '8px 10px', borderRadius: 6, border: '1px solid #E5E7EB' }}>
                      {currentFile.response_date}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Project metadata from PDF (highlighted if different from project) */}
            {[
              { label: 'Project (from PDF)', value: currentFile.project },
              { label: 'Consultant (from PDF)', value: currentFile.consultant },
              { label: 'Client (from PDF)', value: currentFile.client },
              { label: 'Contractor (from PDF)', value: currentFile.contractor },
            ].filter(f => f.value).map(({ label, value }) => (
              <div key={label} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 12, color: '#78350F', background: '#FFFBEB', padding: '5px 10px', borderRadius: 6, border: '1px solid #FDE68A' }}>{value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Metadata mismatch alerts */}
        {Object.entries(mismatches).some(([, v]) => v) && (
          <div style={{ borderTop: '2px solid #FDE68A', background: '#FFFBEB', padding: 14 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#92400E', marginBottom: 10 }}>
              ⚠ Project info mismatch — PDF vs current project settings
            </div>
            {Object.entries(mismatches).map(([field, val]) => {
              if (!val) return null
              return (
                <div key={field} style={{ background: '#fff', border: '1px solid #FDE68A', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>{MISMATCH_LABELS[field]}</div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                    <div style={{ flex: 1, fontSize: 11.5, background: '#FEF3C7', padding: '4px 8px', borderRadius: 6 }}>
                      <span style={{ color: '#92400E', fontWeight: 600 }}>PDF: </span>
                      <span style={{ color: '#78350F' }}>{val.pdf}</span>
                    </div>
                    <div style={{ flex: 1, fontSize: 11.5, background: '#EFF6FF', padding: '4px 8px', borderRadius: 6 }}>
                      <span style={{ color: '#1D4ED8', fontWeight: 600 }}>Project: </span>
                      <span style={{ color: '#1E40AF' }}>{val.db || '(empty)'}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => handleFixMismatch(field, val.pdf)}
                      style={{ flex: 1, padding: '6px 0', background: '#10B981', border: 'none', borderRadius: 6, color: '#fff', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                      ✓ Use PDF value
                    </button>
                    <button onClick={() => handleIgnoreMismatch(field)}
                      style={{ padding: '6px 12px', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 6, color: '#6B7280', fontSize: 11.5, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Keep current
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#F4F6FA' }}>
      <div className="page-header">
        <div>
          <div className="page-title">Upload Files</div>
          <div className="page-sub">Upload RFI log Excel files to extract and classify</div>
        </div>
      </div>

      <div style={{
        padding: '24px 28px',
        display: showPreview ? 'grid' : 'block',
        gridTemplateColumns: showPreview ? '1fr 3fr' : undefined,
        gap: showPreview ? 20 : undefined,
        alignItems: 'flex-start',
        maxWidth: showPreview ? undefined : 760,
        margin: '0 auto',
      }}>
        {LeftPanel}
        {RightPanel}
      </div>
    </div>
  )
}

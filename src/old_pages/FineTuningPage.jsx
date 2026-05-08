import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getExamples, deleteExample, addExample, getCategories } from '../services/api'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
  subject: '', description_excerpt: '', discipline: '',
  correct_design_defect: '', correct_next_level_category: '',
  correct_sub_level_category: '', correct_location: '', added_by: ''
}

function ExampleForm({ form, setForm, cats, onSave, onCancel, title, saveLabel }) {
  const selCat = cats.find(c => c.name === form.correct_design_defect)
  const selSub = selCat?.subcategories?.find(s => s.name === form.correct_next_level_category)

  return (
    <div className="card" style={{ padding: 22, marginBottom: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>{title}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[['Subject *', 'subject'], ['Discipline', 'discipline'], ['Added By', 'added_by']].map(([label, key]) => (
          <div key={key}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>{label}</label>
            <input className="input" style={{ fontSize: 13 }} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
          </div>
        ))}
        <div>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Location</label>
          <input className="input" style={{ fontSize: 13 }} value={form.correct_location} onChange={e => setForm(f => ({ ...f, correct_location: e.target.value }))} />
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Description / Context</label>
          <textarea className="input" rows={3} style={{ fontSize: 13, resize: 'vertical' }} value={form.description_excerpt}
            onChange={e => setForm(f => ({ ...f, description_excerpt: e.target.value }))}
            placeholder="Paste a snippet of the RFI description to give the AI more context…" />
        </div>

        {/* Cascading: Design Defect */}
        <div style={{ gridColumn: '1/-1' }}>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Design Defect *</label>
          <select className="input" style={{ fontSize: 13 }} value={form.correct_design_defect}
            onChange={e => setForm(f => ({ ...f, correct_design_defect: e.target.value, correct_next_level_category: '', correct_sub_level_category: '' }))}>
            <option value="">— Select Design Defect —</option>
            {cats.map(c => <option key={c.id} value={c.name}>{c.no}. {c.name}</option>)}
          </select>
        </div>

        {/* Category */}
        <div>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Category</label>
          <select className="input" style={{ fontSize: 13, opacity: selCat ? 1 : 0.5 }} value={form.correct_next_level_category}
            disabled={!selCat}
            onChange={e => setForm(f => ({ ...f, correct_next_level_category: e.target.value, correct_sub_level_category: '' }))}>
            <option value="">{selCat ? '— Select Category —' : '— Select Design Defect first —'}</option>
            {(selCat?.subcategories || []).map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
        </div>

        {/* Sub-Category */}
        <div>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>Sub-Category</label>
          <select className="input" style={{ fontSize: 13, opacity: selSub ? 1 : 0.5 }} value={form.correct_sub_level_category}
            disabled={!selSub}
            onChange={e => setForm(f => ({ ...f, correct_sub_level_category: e.target.value }))}>
            <option value="">{selSub ? '— Select Sub-Category —' : '— Select Category first —'}</option>
            {(selSub?.items || []).map(i => <option key={i.id} value={i.name}>{i.name}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        <button onClick={onCancel}
          style={{ background: '#F8FAFC', color: '#374151', border: '1.5px solid #E5E7EB', borderRadius: 9, padding: '10px 18px', fontSize: 13.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
          Cancel
        </button>
        <button className="btn-primary" onClick={onSave}>{saveLabel}</button>
      </div>
    </div>
  )
}

export default function FineTuningPage() {
  const { projectId } = useParams()
  const [examples, setExamples] = useState([])
  const [cats, setCats] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState(EMPTY_FORM)

  const load = () => getExamples(projectId).then(setExamples).catch(() => {})
  useEffect(() => { load(); getCategories().then(setCats).catch(() => {}) }, [projectId])

  const handleAdd = async () => {
    if (!addForm.subject || !addForm.correct_design_defect) return toast.error('Subject and Design Defect are required')
    await addExample({ ...addForm, project_id: projectId })
    toast.success('Example added to AI memory')
    setShowAdd(false); setAddForm(EMPTY_FORM); load()
  }

  const startEdit = (ex) => {
    setEditingId(ex.id)
    setEditForm({
      subject: ex.subject || '', description_excerpt: ex.description_excerpt || '',
      discipline: ex.discipline || '', correct_design_defect: ex.correct_design_defect || '',
      correct_next_level_category: ex.correct_next_level_category || '',
      correct_sub_level_category: ex.correct_sub_level_category || '',
      correct_location: ex.correct_location || '', added_by: ex.added_by || ''
    })
  }

  const handleSaveEdit = async () => {
    if (!editForm.subject || !editForm.correct_design_defect) return toast.error('Subject and Design Defect are required')
    // Soft-delete old + insert new (no PATCH endpoint needed)
    await deleteExample(editingId)
    await addExample({ ...editForm, project_id: projectId })
    toast.success('Memory entry updated')
    setEditingId(null); load()
  }

  const handleDelete = async (id) => {
    await deleteExample(id)
    toast.success('Removed from memory')
    load()
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#F4F6FA' }}>
      <div className="page-header">
        <div>
          <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>🧠 Fine-tuning Memory</div>
          <div className="page-sub">Human corrections that teach the AI to classify better</div>
        </div>
        <button className="btn-primary" onClick={() => { setShowAdd(s => !s); setEditingId(null) }}>+ Add Example</button>
      </div>

      <div style={{ padding: '24px 28px' }}>
        {/* How it works */}
        <div style={{ background: 'linear-gradient(135deg,#F5F3FF,#EFF6FF)', border: '1.5px solid #DDD6FE', borderRadius: 14, padding: '18px 22px', marginBottom: 22, display: 'flex', gap: 20 }}>
          <div style={{ fontSize: 36 }}>🧠</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#6D28D9', marginBottom: 6 }}>How fine-tuning works</div>
            <div style={{ fontSize: 13, color: '#4C1D95', lineHeight: 1.7 }}>
              When the AI misclassifies an RFI, use <strong>✎ Correct</strong> in the RFI Log. The correction is saved here and automatically injected into future AI prompts as a labelled example — no model retraining needed.
              The AI learns immediately from each correction, using the full subject + description context to improve accuracy for similar RFIs.
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 22 }}>
          {[
            ['Examples in Memory', examples.length, '#7C3AED'],
            ['Max Used per Prompt', 20, '#1D4ED8'],
            ['Impact', examples.length > 0 ? 'Active' : 'None yet', '#10B981']
          ].map(([label, val, color]) => (
            <div key={label} className="card" style={{ padding: '16px 18px', borderTop: `3px solid ${color}` }}>
              <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 500, marginTop: 5 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Add form */}
        {showAdd && (
          <ExampleForm
            form={addForm} setForm={setAddForm} cats={cats}
            onSave={handleAdd} onCancel={() => setShowAdd(false)}
            title="Add Training Example Manually" saveLabel="+ Add to Memory"
          />
        )}

        {/* Examples list */}
        {examples.length === 0 ? (
          <div className="card" style={{ padding: '52px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>🧠</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#374151', marginBottom: 6 }}>No corrections yet</div>
            <div style={{ fontSize: 13.5, color: '#9CA3AF' }}>Classify RFIs and use ✎ Correct to build the AI memory</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {examples.map(ex => (
              <div key={ex.id}>
                {/* Edit form inline */}
                {editingId === ex.id ? (
                  <ExampleForm
                    form={editForm} setForm={setEditForm} cats={cats}
                    onSave={handleSaveEdit} onCancel={() => setEditingId(null)}
                    title="Edit Training Example" saveLabel="Save Changes"
                  />
                ) : (
                  <div className="card" style={{ padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{ex.subject}</div>
                      {ex.description_excerpt && (
                        <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8, lineHeight: 1.5, fontStyle: 'italic', borderLeft: '3px solid #E5E7EB', paddingLeft: 10 }}>
                          {ex.description_excerpt.length > 180 ? ex.description_excerpt.slice(0, 180) + '…' : ex.description_excerpt}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11.5, background: '#EFF6FF', color: '#1D4ED8', padding: '2px 10px', borderRadius: 20, fontWeight: 600 }}>{ex.correct_design_defect}</span>
                        {ex.correct_next_level_category && (
                          <span style={{ fontSize: 11.5, background: '#F0FDF4', color: '#15803D', padding: '2px 10px', borderRadius: 20 }}>
                            → {ex.correct_next_level_category}
                          </span>
                        )}
                        {ex.correct_sub_level_category && (
                          <span style={{ fontSize: 11.5, background: '#FFFBEB', color: '#92400E', padding: '2px 10px', borderRadius: 20 }}>
                            → {ex.correct_sub_level_category}
                          </span>
                        )}
                        {ex.correct_location && (
                          <span style={{ fontSize: 11.5, background: '#F5F3FF', color: '#7C3AED', padding: '2px 10px', borderRadius: 20 }}>📍 {ex.correct_location}</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 8 }}>
                        Added by {ex.added_by || 'user'} · {new Date(ex.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => startEdit(ex)}
                        title="Edit this example"
                        style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 7, color: '#0369A1', padding: '5px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                        ✎ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(ex.id)}
                        title="Remove from memory"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E5E7EB', padding: 4, borderRadius: 6, fontSize: 14 }}
                        onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                        onMouseLeave={e => e.currentTarget.style.color = '#E5E7EB'}>
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

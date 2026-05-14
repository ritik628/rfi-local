'use client';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { addDiscipline, deleteDiscipline, getDisciplines } from '@/lib/api/api';
import toast from 'react-hot-toast';

const DEFAULT_DISC = ['Civil','MEP','Façade','Structure','Landscape','Architecture','Interior Design'];

export default function DisciplineModal({ projectId, disciplines, onUpdate, onClose }) {
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    setLoading(true);
    try {
      await addDiscipline(projectId, name);
      setNewName('');
      const updated = await getDisciplines(projectId);
      onUpdate(updated);
      toast.success(`'${name}' added`);
    } catch {}
    setLoading(false);
  };

  const handleDelete = async (d) => {
    if (!window.confirm(`Delete discipline "${d.name}"?`)) return;
    try {
      await deleteDiscipline(projectId, d.id);
      const updated = await getDisciplines(projectId);
      onUpdate(updated);
      toast.success(`'${d.name}' removed`);
    } catch {}
  };

  const loadDefaults = async () => {
    setLoading(true);
    try {
      for (const name of DEFAULT_DISC) {
        try { await addDiscipline(projectId, name); } catch {}
      }
      const updated = await getDisciplines(projectId);
      onUpdate(updated);
      toast.success('Defaults loaded');
    } catch {}
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <h2 className="text-lg font-medium text-foreground mb-1">Manage Disciplines</h2>
        <p className="text-xs text-muted-foreground mb-6">Configure project-specific disciplines for RFI sorting</p>

        <div className="space-y-2 mb-6 max-h-60 overflow-y-auto scrollbar-themed pr-2">
          {disciplines.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-muted-foreground mb-4">No disciplines configured</p>
              <button 
                onClick={loadDefaults} 
                className="text-xs font-medium text-primary hover:underline"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Load Standard Defaults'}
              </button>
            </div>
          ) : (
            disciplines.map(d => (
              <div key={d.id} className="flex items-center justify-between p-3 bg-muted/40 border border-border rounded-xl">
                <span className="text-sm font-medium text-foreground">{d.name}</span>
                <button onClick={() => handleDelete(d)} className="text-muted-foreground hover:text-destructive p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2 mb-6">
          <input 
            className="flex-1 bg-muted border border-border rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" 
            placeholder="New discipline..." 
            value={newName} 
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()} 
          />
          <button 
            className="bg-primary text-white font-medium px-4 py-2 rounded-xl text-sm hover:opacity-90 disabled:opacity-50"
            onClick={handleAdd}
            disabled={loading || !newName.trim()}
          >
            Add
          </button>
        </div>

        <button 
          onClick={onClose} 
          className="w-full bg-muted border border-border text-foreground font-medium py-2 rounded-xl text-sm hover:bg-muted/80"
        >
          Close
        </button>
      </div>
    </div>
  );
}

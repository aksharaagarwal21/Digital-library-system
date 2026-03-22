import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import { categoriesAPI } from '../services/api';
import toast from 'react-hot-toast';

function CategoryModal({ cat, onClose, onSave }) {
  const [form, setForm] = useState(cat || { name: '', description: '', icon: '📚', color: '#4F46E5' });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const icons = ['📚','📖','🔬','🏛️','🧠','📐','💼','🎨','⚕️','🌱','💻','🌍','⚡','🎭','🏆'];

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (cat) await categoriesAPI.update(cat.id, form);
      else await categoriesAPI.create(form);
      toast.success(cat ? 'Category updated!' : 'Category created!');
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-sm">
        <div className="modal-header">
          <h3 className="modal-title">{cat ? 'Edit Category' : 'New Category'}</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Category Name *</label>
            <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. Science Fiction" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input className="form-input" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Short description" />
          </div>
          <div className="form-group">
            <label className="form-label">Icon</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {icons.map(ic => (
                <button key={ic} type="button" onClick={() => set('icon', ic)} style={{ width: 36, height: 36, borderRadius: 8, fontSize: 18, cursor: 'pointer', border: form.icon === ic ? '2px solid var(--accent)' : '1px solid var(--border)', background: form.icon === ic ? 'var(--accent-glow)' : 'var(--bg-elevated)' }}>{ic}</button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Color</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="color" value={form.color} onChange={e => set('color', e.target.value)} style={{ width: 40, height: 36, borderRadius: 6, border: '1px solid var(--border)', cursor: 'pointer', padding: 2, background: 'var(--bg-card)' }} />
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{form.color}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? 'Saving…' : (cat ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editCat, setEditCat] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try { const res = await categoriesAPI.getAll(); setCategories(res.data.data); }
    catch { toast.error('Failed to load categories'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try { await categoriesAPI.delete(id); toast.success('Category deleted'); fetch(); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div style={{ padding: '28px 32px', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26 }}>Categories</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>{categories.length} categories</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditCat(null); setShowModal(true); }}><Plus size={16} /> New Category</button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {categories.map(cat => (
            <div key={cat.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, position: 'relative', overflow: 'hidden', transition: 'all 0.2s ease' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = cat.color + '60'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: cat.color }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: cat.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{cat.icon}</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditCat(cat); setShowModal(true); }}><Edit2 size={14} /></button>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(cat.id)} style={{ color: 'var(--rose)' }}><Trash2 size={14} /></button>
                </div>
              </div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{cat.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>{cat.description || 'No description'}</div>
              <div style={{ fontSize: 11, color: cat.color, fontWeight: 600 }}>{cat.bookCount} books</div>
            </div>
          ))}
        </div>
      )}

      {showModal && <CategoryModal cat={editCat} onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); fetch(); }} />}
    </div>
  );
}

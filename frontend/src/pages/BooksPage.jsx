import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Eye, BookOpen, X, Loader2, Star } from 'lucide-react';
import { booksAPI, categoriesAPI } from '../services/api';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

function BookModal({ book, categories, onClose, onSave }) {
  const [form, setForm] = useState(book || {
    title: '', author: '', isbn: '', categoryId: '', publisher: '', publishedYear: '', language: 'English',
    pages: '', description: '', totalCopies: 1, price: '', shelfLocation: '', tags: ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, tags: typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : form.tags };
      if (book?.id) await booksAPI.update(book.id, payload);
      else await booksAPI.create(payload);
      toast.success(book ? 'Book updated!' : 'Book added!');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save book');
    } finally {
      setSaving(false);
    }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <h3 className="modal-title">{book ? 'Edit Book' : 'Add New Book'}</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Title *</label>
              <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} required placeholder="Book title" />
            </div>
            <div className="form-group">
              <label className="form-label">Author *</label>
              <input className="form-input" value={form.author} onChange={e => set('author', e.target.value)} required placeholder="Author name" />
            </div>
            <div className="form-group">
              <label className="form-label">ISBN</label>
              <input className="form-input" value={form.isbn} onChange={e => set('isbn', e.target.value)} placeholder="978-..." />
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-select" value={form.categoryId || form.category?.id || ''} onChange={e => set('categoryId', e.target.value)} required>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Publisher</label>
              <input className="form-input" value={form.publisher} onChange={e => set('publisher', e.target.value)} placeholder="Publisher name" />
            </div>
            <div className="form-group">
              <label className="form-label">Published Year</label>
              <input className="form-input" type="number" value={form.publishedYear} onChange={e => set('publishedYear', e.target.value)} placeholder="e.g. 2020" />
            </div>
            <div className="form-group">
              <label className="form-label">Language</label>
              <select className="form-select" value={form.language} onChange={e => set('language', e.target.value)}>
                {['English','Hindi','Tamil','Telugu','Kannada','Malayalam','French','German','Spanish'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Pages</label>
              <input className="form-input" type="number" value={form.pages} onChange={e => set('pages', e.target.value)} placeholder="Number of pages" />
            </div>
            <div className="form-group">
              <label className="form-label">Total Copies *</label>
              <input className="form-input" type="number" min="1" value={form.totalCopies} onChange={e => set('totalCopies', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Price (₹)</label>
              <input className="form-input" type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label className="form-label">Shelf Location</label>
              <input className="form-input" value={form.shelfLocation} onChange={e => set('shelfLocation', e.target.value)} placeholder="e.g. A-12" />
            </div>
            <div className="form-group">
              <label className="form-label">Tags (comma separated)</label>
              <input className="form-input" value={Array.isArray(form.tags) ? form.tags.join(', ') : form.tags} onChange={e => set('tags', e.target.value)} placeholder="fiction, classic, romance" />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Book description..." rows={3} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? 'Saving…' : (book ? 'Update Book' : 'Add Book')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BookDetailModal({ book, onClose }) {
  const tags = Array.isArray(book.tags) ? book.tags : (typeof book.tags === 'string' ? JSON.parse(book.tags || '[]') : []);
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-md">
        <div className="modal-header">
          <h3 className="modal-title">Book Details</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 20, alignItems: 'start' }}>
          <div style={{ width: 120, height: 160, background: 'var(--bg-elevated)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, border: '1px solid var(--border)' }}>📖</div>
          <div>
            <h2 style={{ fontSize: 20, marginBottom: 4 }}>{book.title}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>by {book.author}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              <span className="badge badge-blue">{book.category?.icon} {book.category?.name}</span>
              <span className={`badge ${book.availableCopies > 0 ? 'badge-green' : 'badge-red'}`}>{book.availableCopies > 0 ? 'Available' : 'All Borrowed'}</span>
              {book.rating > 0 && <span className="badge badge-yellow">⭐ {parseFloat(book.rating).toFixed(1)}</span>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
              {book.isbn && <div><strong style={{ color: 'var(--text-secondary)' }}>ISBN:</strong> {book.isbn}</div>}
              {book.publisher && <div><strong style={{ color: 'var(--text-secondary)' }}>Publisher:</strong> {book.publisher}</div>}
              {book.publishedYear && <div><strong style={{ color: 'var(--text-secondary)' }}>Year:</strong> {book.publishedYear}</div>}
              {book.pages && <div><strong style={{ color: 'var(--text-secondary)' }}>Pages:</strong> {book.pages}</div>}
              {book.language && <div><strong style={{ color: 'var(--text-secondary)' }}>Language:</strong> {book.language}</div>}
              {book.price && <div><strong style={{ color: 'var(--text-secondary)' }}>Price:</strong> ₹{book.price}</div>}
              <div><strong style={{ color: 'var(--text-secondary)' }}>Total Copies:</strong> {book.totalCopies}</div>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Available:</strong> {book.availableCopies}</div>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Borrowed:</strong> {book.borrowedCopies}</div>
              <div><strong style={{ color: 'var(--text-secondary)' }}>Total Borrows:</strong> {book.totalBorrows}</div>
              {book.shelfLocation && <div><strong style={{ color: 'var(--text-secondary)' }}>Shelf:</strong> {book.shelfLocation}</div>}
            </div>
          </div>
        </div>
        {book.description && <div style={{ marginTop: 16, padding: 14, background: 'var(--bg-secondary)', borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{book.description}</div>}
        {tags.length > 0 && (
          <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {tags.map(tag => <span key={tag} style={{ padding: '2px 10px', borderRadius: 100, background: 'var(--bg-elevated)', border: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)' }}>#{tag}</span>)}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editBook, setEditBook] = useState(null);
  const [viewBook, setViewBook] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const { isLibrarian } = useAuthStore();

  const fetchBooks = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (categoryFilter) params.categoryId = categoryFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await booksAPI.getAll(params);
      setBooks(res.data.data);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load books'); }
    finally { setLoading(false); }
  }, [search, categoryFilter, statusFilter]);

  useEffect(() => { categoriesAPI.getAll().then(r => setCategories(r.data.data)); }, []);
  useEffect(() => { fetchBooks(1); }, [fetchBooks]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this book?')) return;
    setDeleting(id);
    try { await booksAPI.delete(id); toast.success('Book deleted'); fetchBooks(pagination.page); }
    catch { toast.error('Failed to delete'); }
    finally { setDeleting(null); }
  };

  const statusBadge = (book) => {
    if (book.availableCopies > 0) return <span className="badge badge-green">Available</span>;
    return <span className="badge badge-red">All Borrowed</span>;
  };

  return (
    <div style={{ padding: '28px 32px', animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26 }}>Book Catalog</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>{pagination.total} books in library</p>
        </div>
        {isLibrarian() && (
          <button className="btn btn-primary" onClick={() => { setEditBook(null); setShowModal(true); }}>
            <Plus size={16} /> Add Book
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-bar">
          <Search size={15} className="search-icon" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title, author, ISBN…" />
        </div>
        <select className="form-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ width: 180 }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
        <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 150 }}>
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="borrowed">Borrowed</option>
          <option value="maintenance">Maintenance</option>
        </select>
        {(search || categoryFilter || statusFilter) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setCategoryFilter(''); setStatusFilter(''); }}>
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Book</th>
              <th>ISBN</th>
              <th>Category</th>
              <th>Copies</th>
              <th>Status</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i}>
                  {[...Array(7)].map((_, j) => <td key={j}><div className="skeleton" style={{ height: 20, borderRadius: 4 }} /></td>)}
                </tr>
              ))
            ) : books.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No books found</td></tr>
            ) : books.map(book => (
              <tr key={book.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 42, borderRadius: 4, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, border: '1px solid var(--border)' }}>📖</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{book.author}</div>
                    </div>
                  </div>
                </td>
                <td><span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-muted)' }}>{book.isbn || '—'}</span></td>
                <td>
                  {book.category && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                    <span>{book.category.icon}</span> {book.category.name}
                  </span>}
                </td>
                <td>
                  <div style={{ fontSize: 12 }}>
                    <span style={{ color: 'var(--emerald)', fontWeight: 600 }}>{book.availableCopies}</span>
                    <span style={{ color: 'var(--text-muted)' }}>/{book.totalCopies}</span>
                  </div>
                </td>
                <td>{statusBadge(book)}</td>
                <td>
                  {book.rating > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--gold)' }}>
                      <Star size={12} fill="currentColor" /> {parseFloat(book.rating).toFixed(1)}
                    </span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setViewBook(book)} title="View"><Eye size={15} /></button>
                    {isLibrarian() && <>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditBook(book); setShowModal(true); }} title="Edit"><Edit2 size={15} /></button>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(book.id)} disabled={deleting === book.id} title="Delete" style={{ color: 'var(--rose)' }}>
                        {deleting === book.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                      </button>
                    </>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button className="page-btn" onClick={() => fetchBooks(pagination.page - 1)} disabled={pagination.page === 1}>‹</button>
          {[...Array(pagination.pages)].map((_, i) => (
            <button key={i} className={`page-btn ${pagination.page === i + 1 ? 'active' : ''}`} onClick={() => fetchBooks(i + 1)}>{i + 1}</button>
          ))}
          <button className="page-btn" onClick={() => fetchBooks(pagination.page + 1)} disabled={pagination.page === pagination.pages}>›</button>
        </div>
      )}

      {showModal && <BookModal book={editBook} categories={categories} onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); fetchBooks(pagination.page); }} />}
      {viewBook && <BookDetailModal book={viewBook} onClose={() => setViewBook(null)} />}
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, CheckCircle, X, Loader2, Search, AlertTriangle } from 'lucide-react';
import { borrowsAPI, booksAPI, membersAPI } from '../services/api';
import { format, isPast } from 'date-fns';
import toast from 'react-hot-toast';

function IssueModal({ onClose, onSave }) {
  const [bookSearch, setBookSearch] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const defaultDue = new Date(); defaultDue.setDate(defaultDue.getDate() + 14);

  useEffect(() => { setDueDate(defaultDue.toISOString().split('T')[0]); }, []);

  useEffect(() => {
    if (bookSearch.length < 2) { setBooks([]); return; }
    const t = setTimeout(() => {
      booksAPI.getAll({ search: bookSearch, limit: 5 }).then(r => setBooks(r.data.data.filter(b => b.availableCopies > 0)));
    }, 300);
    return () => clearTimeout(t);
  }, [bookSearch]);

  useEffect(() => {
    if (memberSearch.length < 2) { setMembers([]); return; }
    const t = setTimeout(() => {
      membersAPI.getAll({ search: memberSearch, limit: 5, isActive: 'true' }).then(r => setMembers(r.data.data));
    }, 300);
    return () => clearTimeout(t);
  }, [memberSearch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBook || !selectedMember) return toast.error('Select book and member');
    setSaving(true);
    try {
      await borrowsAPI.borrow({ bookId: selectedBook.id, memberId: selectedMember.id, dueDate, notes });
      toast.success('Book issued successfully!');
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to issue book'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-md">
        <div className="modal-header">
          <h3 className="modal-title">Issue Book</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Book search */}
          <div className="form-group">
            <label className="form-label">Search Book *</label>
            {selectedBook ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--emerald)' }}>
                <span style={{ flex: 1 }}>📖 <strong>{selectedBook.title}</strong> — {selectedBook.author}</span>
                <span style={{ fontSize: 12, color: 'var(--emerald)' }}>{selectedBook.availableCopies} avail.</span>
                <button type="button" onClick={() => setSelectedBook(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={14} /></button>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <input className="form-input" value={bookSearch} onChange={e => setBookSearch(e.target.value)} placeholder="Type book title or author…" />
                {books.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, zIndex: 10, overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
                    {books.map(b => (
                      <div key={b.id} onClick={() => { setSelectedBook(b); setBookSearch(''); setBooks([]); }} style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{b.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.author}</div>
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--emerald)' }}>{b.availableCopies} available</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Member search */}
          <div className="form-group">
            <label className="form-label">Search Member *</label>
            {selectedMember ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--accent)' }}>
                <span style={{ flex: 1 }}>👤 <strong>{selectedMember.name}</strong> — {selectedMember.membershipId}</span>
                <button type="button" onClick={() => setSelectedMember(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={14} /></button>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <input className="form-input" value={memberSearch} onChange={e => setMemberSearch(e.target.value)} placeholder="Type member name or ID…" />
                {members.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, zIndex: 10, overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
                    {members.map(m => (
                      <div key={m.id} onClick={() => { setSelectedMember(m); setMemberSearch(''); setMembers([]); }} style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.membershipId} · {m.email}</div>
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{m.membershipType}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Due Date *</label>
            <input className="form-input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} min={new Date().toISOString().split('T')[0]} required />
          </div>
          <div className="form-group">
            <label className="form-label">Notes (optional)</label>
            <input className="form-input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional notes…" />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving || !selectedBook || !selectedMember}>
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? 'Issuing…' : 'Issue Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReturnModal({ borrow, onClose, onSave }) {
  const [condition, setCondition] = useState('good');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const isOverdue = isPast(new Date(borrow.dueDate));
  const daysLate = isOverdue ? Math.ceil((new Date() - new Date(borrow.dueDate)) / 86400000) : 0;
  const fine = daysLate * 5;

  const handleReturn = async () => {
    setSaving(true);
    try {
      await borrowsAPI.return({ borrowId: borrow.id, condition, notes });
      toast.success(`Book returned${fine > 0 ? `. Fine: ₹${fine}` : '!'}`);
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to return'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-sm">
        <div className="modal-header">
          <h3 className="modal-title">Return Book</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ marginBottom: 16, padding: 14, background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{borrow.book?.title}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Borrowed by: {borrow.member?.name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Due: {format(new Date(borrow.dueDate), 'dd MMM yyyy')}</div>
        </div>
        {isOverdue && (
          <div style={{ padding: '10px 14px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 8, marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
            <AlertTriangle size={16} style={{ color: 'var(--rose)', flexShrink: 0 }} />
            <div style={{ fontSize: 13 }}>
              <strong style={{ color: 'var(--rose)' }}>Overdue by {daysLate} day{daysLate > 1 ? 's' : ''}</strong>
              <div style={{ color: 'var(--text-muted)' }}>Fine: ₹{fine} (₹5/day)</div>
            </div>
          </div>
        )}
        <div className="form-group" style={{ marginBottom: 12 }}>
          <label className="form-label">Book Condition</label>
          <select className="form-select" value={condition} onChange={e => setCondition(e.target.value)}>
            <option value="good">Good</option>
            <option value="damaged">Damaged</option>
            <option value="lost">Lost</option>
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 20 }}>
          <label className="form-label">Notes</label>
          <input className="form-input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any return notes…" />
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-success" onClick={handleReturn} disabled={saving}>
            {saving && <Loader2 size={14} className="animate-spin" />}
            <CheckCircle size={15} />
            {saving ? 'Processing…' : 'Confirm Return'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BorrowsPage() {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [showIssue, setShowIssue] = useState(false);
  const [returnBorrow, setReturnBorrow] = useState(null);
  const [renewingId, setRenewingId] = useState(null);

  const fetchBorrows = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const res = await borrowsAPI.getAll(params);
      setBorrows(res.data.data);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load borrows'); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchBorrows(1); }, [fetchBorrows]);

  const handleRenew = async (id) => {
    setRenewingId(id);
    try { await borrowsAPI.renew(id); toast.success('Renewed for 14 more days!'); fetchBorrows(pagination.page); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to renew'); }
    finally { setRenewingId(null); }
  };

  const statusBadge = (status) => {
    const map = { active: 'badge-green', returned: 'badge-gray', overdue: 'badge-red', renewed: 'badge-blue', lost: 'badge-yellow' };
    return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
  };

  return (
    <div style={{ padding: '28px 32px', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26 }}>Borrow Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>{pagination.total} total records</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowIssue(true)}>
          <Plus size={16} /> Issue Book
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {['', 'active', 'overdue', 'returned', 'renewed'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}>
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Book</th>
              <th>Member</th>
              <th>Borrow Date</th>
              <th>Due Date</th>
              <th>Return Date</th>
              <th>Status</th>
              <th>Fine</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? [...Array(6)].map((_, i) => (
              <tr key={i}>{[...Array(8)].map((_, j) => <td key={j}><div className="skeleton" style={{ height: 18, borderRadius: 4 }} /></td>)}</tr>
            )) : borrows.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No borrow records found</td></tr>
            ) : borrows.map(b => {
              const overdue = !b.returnDate && isPast(new Date(b.dueDate));
              return (
                <tr key={b.id} style={{ background: overdue ? 'rgba(244,63,94,0.03)' : '' }}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.book?.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.book?.author}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{b.member?.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{b.member?.membershipId}</div>
                  </td>
                  <td style={{ fontSize: 13 }}>{format(new Date(b.borrowDate), 'dd MMM yyyy')}</td>
                  <td style={{ fontSize: 13, color: overdue ? 'var(--rose)' : '' }}>
                    {overdue && <AlertTriangle size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />}
                    {format(new Date(b.dueDate), 'dd MMM yyyy')}
                  </td>
                  <td style={{ fontSize: 13 }}>{b.returnDate ? format(new Date(b.returnDate), 'dd MMM yyyy') : '—'}</td>
                  <td>{statusBadge(b.status)}</td>
                  <td style={{ fontSize: 13, color: b.fine > 0 ? 'var(--rose)' : 'var(--text-muted)' }}>
                    {b.fine > 0 ? `₹${b.fine}` : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {(b.status === 'active' || b.status === 'overdue') && (
                        <button className="btn btn-success btn-sm" onClick={() => setReturnBorrow(b)}>
                          <CheckCircle size={13} /> Return
                        </button>
                      )}
                      {(b.status === 'active' || b.status === 'renewed') && b.renewals < b.maxRenewals && (
                        <button className="btn btn-secondary btn-sm" onClick={() => handleRenew(b.id)} disabled={renewingId === b.id}>
                          {renewingId === b.id ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                          Renew
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pagination.pages > 1 && (
        <div className="pagination">
          <button className="page-btn" onClick={() => fetchBorrows(pagination.page - 1)} disabled={pagination.page === 1}>‹</button>
          {[...Array(Math.min(pagination.pages, 7))].map((_, i) => (
            <button key={i} className={`page-btn ${pagination.page === i + 1 ? 'active' : ''}`} onClick={() => fetchBorrows(i + 1)}>{i + 1}</button>
          ))}
          <button className="page-btn" onClick={() => fetchBorrows(pagination.page + 1)} disabled={pagination.page === pagination.pages}>›</button>
        </div>
      )}

      {showIssue && <IssueModal onClose={() => setShowIssue(false)} onSave={() => { setShowIssue(false); fetchBorrows(1); }} />}
      {returnBorrow && <ReturnModal borrow={returnBorrow} onClose={() => setReturnBorrow(null)} onSave={() => { setReturnBorrow(null); fetchBorrows(pagination.page); }} />}
    </div>
  );
}

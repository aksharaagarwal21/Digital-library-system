import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, X, Loader2, User } from 'lucide-react';
import { membersAPI, authAPI } from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

function MemberModal({ member, onClose, onSave }) {
  const isNew = !member;
  const [form, setForm] = useState(member ? {
    name: member.name, email: member.email, phone: member.phone || '',
    address: member.address || '', membershipType: member.membershipType,
    borrowLimit: member.borrowLimit, isActive: member.isActive,
  } : { name: '', email: '', password: '', phone: '', address: '', membershipType: 'basic', borrowLimit: 5 });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isNew) await authAPI.register({ ...form, role: 'member' });
      else await membersAPI.update(member.id, form);
      toast.success(isNew ? 'Member registered!' : 'Member updated!');
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save member'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-md">
        <div className="modal-header">
          <h3 className="modal-title">{isNew ? 'Register Member' : 'Edit Member'}</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Member's full name" />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="email@example.com" />
            </div>
            {isNew && (
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input className="form-input" type="password" value={form.password} onChange={e => set('password', e.target.value)} required placeholder="Min 6 characters" />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91-..." />
            </div>
            <div className="form-group">
              <label className="form-label">Membership Type</label>
              <select className="form-select" value={form.membershipType} onChange={e => set('membershipType', e.target.value)}>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="vip">VIP</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Borrow Limit</label>
              <input className="form-input" type="number" min="1" max="20" value={form.borrowLimit} onChange={e => set('borrowLimit', e.target.value)} />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Address</label>
              <input className="form-input" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Full address" />
            </div>
            {!isNew && (
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.isActive} onChange={e => set('isActive', e.target.value === 'true')}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? 'Saving…' : (isNew ? 'Register Member' : 'Update Member')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MemberDetailModal({ member, onClose }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-md">
        <div className="modal-header">
          <h3 className="modal-title">Member Details</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--violet))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {member.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: 20, marginBottom: 4 }}>{member.name}</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="badge badge-blue">{member.membershipId}</span>
              <span className={`badge ${member.membershipType === 'vip' ? 'badge-yellow' : member.membershipType === 'premium' ? 'badge-violet' : 'badge-gray'}`}>{member.membershipType?.toUpperCase()}</span>
              <span className={`badge ${member.isActive ? 'badge-green' : 'badge-red'}`}>{member.isActive ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
          {[
            ['Email', member.email],
            ['Phone', member.phone || '—'],
            ['Borrow Limit', member.borrowLimit],
            ['Total Borrowed', member.totalBorrowed],
            ['Fines Due', member.finesDue > 0 ? `₹${member.finesDue}` : 'None'],
            ['Joined', member.joinedAt ? format(new Date(member.joinedAt), 'dd MMM yyyy') : '—'],
            ['Last Login', member.lastLogin ? format(new Date(member.lastLogin), 'dd MMM yyyy') : 'Never'],
            ['Address', member.address || '—'],
          ].map(([k, v]) => (
            <div key={k} style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{k}</div>
              <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{v}</div>
            </div>
          ))}
        </div>
        {member.recentBorrows?.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <h4 style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>Recent Borrows</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {member.recentBorrows.slice(0, 3).map(b => (
                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 6 }}>
                  <span>{b.book?.title}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{format(new Date(b.borrowDate), 'dd MMM yyyy')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [membershipFilter, setMembershipFilter] = useState('');
  const [editMember, setEditMember] = useState(null);
  const [viewMember, setViewMember] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { isAdmin } = useAuthStore();

  const fetchMembers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (membershipFilter) params.membershipType = membershipFilter;
      const res = await membersAPI.getAll(params);
      setMembers(res.data.data);
      setPagination(res.data.pagination);
    } catch { toast.error('Failed to load members'); }
    finally { setLoading(false); }
  }, [search, membershipFilter]);

  useEffect(() => { fetchMembers(1); }, [fetchMembers]);

  const handleViewMember = async (m) => {
    try {
      const res = await membersAPI.getOne(m.id);
      setViewMember(res.data.data);
    } catch { setViewMember(m); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this member?')) return;
    try { await membersAPI.delete(id); toast.success('Member deactivated'); fetchMembers(pagination.page); }
    catch (err) { toast.error(err.response?.data?.message || 'Cannot delete member with active borrows'); }
  };

  const typeBadge = (t) => {
    const map = { basic: 'badge-gray', premium: 'badge-violet', vip: 'badge-yellow' };
    return <span className={`badge ${map[t] || 'badge-gray'}`}>{t?.toUpperCase()}</span>;
  };

  return (
    <div style={{ padding: '28px 32px', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26 }}>Members</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>{pagination.total} registered members</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditMember(null); setShowModal(true); }}>
          <Plus size={16} /> Add Member
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-bar">
          <Search size={15} className="search-icon" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, email, member ID…" />
        </div>
        <select className="form-select" value={membershipFilter} onChange={e => setMembershipFilter(e.target.value)} style={{ width: 160 }}>
          <option value="">All Types</option>
          <option value="basic">Basic</option>
          <option value="premium">Premium</option>
          <option value="vip">VIP</option>
        </select>
        {(search || membershipFilter) && <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setMembershipFilter(''); }}><X size={14} /> Clear</button>}
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr><th>Member</th><th>ID</th><th>Type</th><th>Borrow Limit</th><th>Total Borrowed</th><th>Fines</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? [...Array(6)].map((_, i) => (
              <tr key={i}>{[...Array(9)].map((_, j) => <td key={j}><div className="skeleton" style={{ height: 18, borderRadius: 4 }} /></td>)}</tr>
            )) : members.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No members found</td></tr>
            ) : members.map(m => (
              <tr key={m.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--violet))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {m.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.email}</div>
                    </div>
                  </div>
                </td>
                <td><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{m.membershipId}</span></td>
                <td>{typeBadge(m.membershipType)}</td>
                <td style={{ fontSize: 13 }}>{m.borrowLimit}</td>
                <td style={{ fontSize: 13 }}>{m.totalBorrowed}</td>
                <td style={{ fontSize: 13, color: m.finesDue > 0 ? 'var(--rose)' : 'var(--text-muted)' }}>
                  {m.finesDue > 0 ? `₹${m.finesDue}` : '—'}
                </td>
                <td><span className={`badge ${m.isActive ? 'badge-green' : 'badge-red'}`}>{m.isActive ? 'Active' : 'Inactive'}</span></td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.joinedAt ? format(new Date(m.joinedAt), 'dd MMM yyyy') : '—'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleViewMember(m)}><Eye size={15} /></button>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditMember(m); setShowModal(true); }}><Edit2 size={15} /></button>
                    {isAdmin() && <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(m.id)} style={{ color: 'var(--rose)' }}><Trash2 size={15} /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination.pages > 1 && (
        <div className="pagination">
          <button className="page-btn" onClick={() => fetchMembers(pagination.page - 1)} disabled={pagination.page === 1}>‹</button>
          {[...Array(pagination.pages)].map((_, i) => <button key={i} className={`page-btn ${pagination.page === i + 1 ? 'active' : ''}`} onClick={() => fetchMembers(i + 1)}>{i + 1}</button>)}
          <button className="page-btn" onClick={() => fetchMembers(pagination.page + 1)} disabled={pagination.page === pagination.pages}>›</button>
        </div>
      )}

      {showModal && <MemberModal member={editMember} onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); fetchMembers(pagination.page); }} />}
      {viewMember && <MemberDetailModal member={viewMember} onClose={() => setViewMember(null)} />}
    </div>
  );
}

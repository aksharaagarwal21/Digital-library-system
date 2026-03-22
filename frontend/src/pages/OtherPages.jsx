import React, { useState, useEffect } from 'react';
import { RefreshCw, BookOpen, Loader2, User, Lock, Save } from 'lucide-react';
import { borrowsAPI, authAPI } from '../services/api';
import { format, isPast } from 'date-fns';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

export function MyBooksPage() {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renewingId, setRenewingId] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try { const res = await borrowsAPI.getMy(); setBorrows(res.data.data); }
    catch { toast.error('Failed to load your books'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleRenew = async (id) => {
    setRenewingId(id);
    try { await borrowsAPI.renew(id); toast.success('Renewed for 14 more days!'); fetch(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to renew'); }
    finally { setRenewingId(null); }
  };

  const active = borrows.filter(b => ['active', 'overdue', 'renewed'].includes(b.status));
  const history = borrows.filter(b => b.status === 'returned');

  return (
    <div style={{ padding: '28px 32px', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26 }}>My Books</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>Track your borrowed books and history</p>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 140, borderRadius: 12 }} />)}
        </div>
      ) : active.length === 0 && history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <h3 style={{ marginBottom: 8 }}>No books yet</h3>
          <p>You haven't borrowed any books from the library.</p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 18, marginBottom: 16 }}>Currently Borrowed <span style={{ background: 'var(--accent-glow)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 100, fontSize: 12 }}>{active.length}</span></h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {active.map(b => {
                  const overdue = isPast(new Date(b.dueDate));
                  return (
                    <div key={b.id} style={{ background: 'var(--bg-card)', border: `1px solid ${overdue ? 'rgba(244,63,94,0.3)' : 'var(--border)'}`, borderRadius: 12, padding: 20, position: 'relative', overflow: 'hidden' }}>
                      {overdue && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--rose)' }} />}
                      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                        <div style={{ width: 52, height: 70, background: 'var(--bg-elevated)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, border: '1px solid var(--border)' }}>📖</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.book?.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>{b.book?.author}</div>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                            <span className={`badge ${overdue ? 'badge-red' : 'badge-green'}`}>{overdue ? '⚠ Overdue' : 'Active'}</span>
                            {b.renewals > 0 && <span className="badge badge-blue">Renewed {b.renewals}×</span>}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            <div>Borrowed: {format(new Date(b.borrowDate), 'dd MMM yyyy')}</div>
                            <div style={{ color: overdue ? 'var(--rose)' : '' }}>Due: {format(new Date(b.dueDate), 'dd MMM yyyy')}</div>
                            {b.fine > 0 && <div style={{ color: 'var(--rose)', fontWeight: 600 }}>Fine: ₹{b.fine}</div>}
                          </div>
                        </div>
                      </div>
                      {b.renewals < b.maxRenewals && (
                        <button className="btn btn-secondary btn-sm" style={{ marginTop: 12, width: '100%', justifyContent: 'center' }} onClick={() => handleRenew(b.id)} disabled={renewingId === b.id}>
                          {renewingId === b.id ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                          {renewingId === b.id ? 'Renewing…' : `Renew (${b.maxRenewals - b.renewals} left)`}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {history.length > 0 && (
            <div>
              <h2 style={{ fontSize: 18, marginBottom: 16 }}>Borrowing History</h2>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead><tr><th>Book</th><th>Borrowed</th><th>Returned</th><th>Fine</th></tr></thead>
                  <tbody>
                    {history.map(b => (
                      <tr key={b.id}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{b.book?.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.book?.author}</div>
                        </td>
                        <td style={{ fontSize: 13 }}>{format(new Date(b.borrowDate), 'dd MMM yyyy')}</td>
                        <td style={{ fontSize: 13 }}>{b.returnDate ? format(new Date(b.returnDate), 'dd MMM yyyy') : '—'}</td>
                        <td style={{ fontSize: 13, color: b.fine > 0 ? 'var(--rose)' : 'var(--text-muted)' }}>{b.fine > 0 ? `₹${b.fine}` : 'None'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await authAPI.updateProfile(form);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
    finally { setSaving(false); }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) return toast.error('Passwords do not match');
    if (passForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setSaving(true);
    try {
      await authAPI.changePassword({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      toast.success('Password changed!');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: 640, animation: 'fadeIn 0.3s ease' }}>
      <h1 style={{ fontSize: 26, marginBottom: 24 }}>Profile Settings</h1>

      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, padding: 20, background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--violet))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, color: '#fff' }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{user?.name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role} · {user?.membershipId || user?.email}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            <span className={`badge ${user?.membershipType === 'vip' ? 'badge-yellow' : user?.membershipType === 'premium' ? 'badge-violet' : 'badge-gray'}`}>{user?.membershipType?.toUpperCase() || 'N/A'}</span>
            <span className="badge badge-green">Active</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg-card)', padding: 4, borderRadius: 10, border: '1px solid var(--border)' }}>
        {[{ id: 'profile', icon: User, label: 'Profile' }, { id: 'security', icon: Lock, label: 'Security' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, fontWeight: 500, transition: 'all 0.15s ease', background: tab === t.id ? 'var(--bg-elevated)' : 'transparent', color: tab === t.id ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" value={user?.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91-..." />
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea className="form-textarea" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} rows={2} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
            {saving && <Loader2 size={14} className="animate-spin" />}
            <Save size={15} /> {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      )}

      {tab === 'security' && (
        <form onSubmit={handlePasswordSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input className="form-input" type="password" value={passForm.currentPassword} onChange={e => setPassForm(f => ({ ...f, currentPassword: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input className="form-input" type="password" value={passForm.newPassword} onChange={e => setPassForm(f => ({ ...f, newPassword: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input className="form-input" type="password" value={passForm.confirmPassword} onChange={e => setPassForm(f => ({ ...f, confirmPassword: e.target.value }))} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
            {saving && <Loader2 size={14} className="animate-spin" />}
            <Lock size={15} /> {saving ? 'Saving…' : 'Change Password'}
          </button>
        </form>
      )}
    </div>
  );
}

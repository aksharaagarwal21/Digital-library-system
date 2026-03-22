import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const pageTitles = {
  '/dashboard': { title: 'Dashboard', sub: 'Overview & Analytics' },
  '/books': { title: 'Book Catalog', sub: 'Browse and manage all books' },
  '/borrows': { title: 'Borrow Management', sub: 'Track issues and returns' },
  '/members': { title: 'Members', sub: 'Manage library members' },
  '/categories': { title: 'Categories', sub: 'Organize book categories' },
  '/my-books': { title: 'My Books', sub: 'Your borrowed books' },
  '/profile': { title: 'Profile Settings', sub: 'Manage your account' },
};

export default function Topbar() {
  const location = useLocation();
  const { user } = useAuthStore();
  const page = pageTitles[location.pathname] || { title: 'LibraVault', sub: '' };

  return (
    <header style={{
      height: 64, background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px', position: 'sticky', top: 0, zIndex: 90,
    }}>
      <div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600, lineHeight: 1.1 }}>{page.title}</h2>
        {page.sub && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{page.sub}</p>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>
          <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{user?.name}</div>
          <div style={{ textTransform: 'capitalize' }}>{user?.membershipId || user?.role}</div>
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent), var(--violet))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer',
        }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}

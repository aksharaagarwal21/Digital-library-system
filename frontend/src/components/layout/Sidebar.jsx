import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Users, ArrowLeftRight,
  Tag, Settings, LogOut, ChevronLeft, ChevronRight,
  BookMarked, Star, Bell
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'librarian'] },
  { path: '/books', icon: BookOpen, label: 'Books', roles: ['admin', 'librarian', 'member'] },
  { path: '/borrows', icon: ArrowLeftRight, label: 'Borrows', roles: ['admin', 'librarian'] },
  { path: '/members', icon: Users, label: 'Members', roles: ['admin', 'librarian'] },
  { path: '/my-books', icon: BookMarked, label: 'My Books', roles: ['member'] },
  { path: '/categories', icon: Tag, label: 'Categories', roles: ['admin', 'librarian'] },
  { path: '/profile', icon: Settings, label: 'Settings', roles: ['admin', 'librarian', 'member'] },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout, isLibrarian } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNav = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <>
      <aside style={{
        width: collapsed ? 72 : 260,
        position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, minHeight: 72 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, var(--accent), var(--violet))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, boxShadow: '0 4px 12px var(--accent-glow)'
          }}>📚</div>
          {!collapsed && (
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', lineHeight: 1.1 }}>LibraVault</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>DIGITAL LIBRARY</div>
            </div>
          )}
        </div>

        {/* User info */}
        {!collapsed && (
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, var(--accent), var(--violet))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: '#fff'
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</div>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {filteredNav.map(({ path, icon: Icon, label }) => (
            <NavLink key={path} to={path} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: collapsed ? '10px 16px' : '10px 12px',
              borderRadius: 'var(--radius-sm)',
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              background: isActive ? 'var(--accent-glow)' : 'transparent',
              border: isActive ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
              transition: 'all 0.15s ease',
              fontWeight: isActive ? 600 : 400,
              fontSize: 14,
              textDecoration: 'none',
              justifyContent: collapsed ? 'center' : 'flex-start',
            })}>
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
          <button onClick={handleLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 12px', borderRadius: 'var(--radius-sm)',
            background: 'transparent', border: '1px solid transparent',
            color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14,
            transition: 'all 0.15s ease', justifyContent: collapsed ? 'center' : 'flex-start',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.1)'; e.currentTarget.style.color = 'var(--rose)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
            <LogOut size={18} />
            {!collapsed && 'Sign Out'}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: 'absolute', top: '50%', right: -12,
            width: 24, height: 24, borderRadius: '50%',
            background: 'var(--bg-elevated)', border: '1px solid var(--border-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-muted)', zIndex: 10,
            transform: 'translateY(-50%)',
          }}>
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Spacer */}
      <div style={{ width: collapsed ? 72 : 260, flexShrink: 0, transition: 'width 0.3s ease' }} />
    </>
  );
}

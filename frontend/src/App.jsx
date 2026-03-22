import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BooksPage from './pages/BooksPage';
import BorrowsPage from './pages/BorrowsPage';
import MembersPage from './pages/MembersPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { MyBooksPage, ProfilePage } from './pages/OtherPages';
import './styles/global.css';

function ProtectedLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar />
        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-primary)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

function RequireAuth({ children, roles }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/books" replace />;
  return children;
}

function PublicOnly({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  const { user } = useAuthStore();

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-light)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#f43f5e', secondary: '#fff' } },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
        <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />

        {/* Protected */}
        <Route path="/dashboard" element={
          <RequireAuth roles={['admin', 'librarian']}>
            <ProtectedLayout><DashboardPage /></ProtectedLayout>
          </RequireAuth>
        } />
        <Route path="/books" element={
          <RequireAuth>
            <ProtectedLayout><BooksPage /></ProtectedLayout>
          </RequireAuth>
        } />
        <Route path="/borrows" element={
          <RequireAuth roles={['admin', 'librarian']}>
            <ProtectedLayout><BorrowsPage /></ProtectedLayout>
          </RequireAuth>
        } />
        <Route path="/members" element={
          <RequireAuth roles={['admin', 'librarian']}>
            <ProtectedLayout><MembersPage /></ProtectedLayout>
          </RequireAuth>
        } />
        <Route path="/categories" element={
          <RequireAuth roles={['admin', 'librarian']}>
            <ProtectedLayout><CategoriesPage /></ProtectedLayout>
          </RequireAuth>
        } />
        <Route path="/my-books" element={
          <RequireAuth>
            <ProtectedLayout><MyBooksPage /></ProtectedLayout>
          </RequireAuth>
        } />
        <Route path="/profile" element={
          <RequireAuth>
            <ProtectedLayout><ProfilePage /></ProtectedLayout>
          </RequireAuth>
        } />

        {/* Redirect */}
        <Route path="/" element={
          user ? <Navigate to={['admin', 'librarian'].includes(user.role) ? '/dashboard' : '/books'} replace /> : <Navigate to="/login" replace />
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

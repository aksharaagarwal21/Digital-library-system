import { create } from 'zustand';
import { authAPI } from '../services/api';

const getStoredUser = () => {
  try { return JSON.parse(localStorage.getItem('libra_user')); } catch { return null; }
};

const useAuthStore = create((set, get) => ({
  user: getStoredUser(),
  token: localStorage.getItem('libra_token'),
  isAuthenticated: !!localStorage.getItem('libra_token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authAPI.login({ email, password });
      localStorage.setItem('libra_token', data.token);
      localStorage.setItem('libra_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isAuthenticated: true, loading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      set({ error: msg, loading: false });
      return { success: false, message: msg };
    }
  },

  logout: () => {
    localStorage.removeItem('libra_token');
    localStorage.removeItem('libra_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (userData) => {
    const updated = { ...get().user, ...userData };
    localStorage.setItem('libra_user', JSON.stringify(updated));
    set({ user: updated });
  },

  isAdmin: () => get().user?.role === 'admin',
  isLibrarian: () => ['admin', 'librarian'].includes(get().user?.role),
  isMember: () => get().user?.role === 'member',
}));

export default useAuthStore;

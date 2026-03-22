import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('libra_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('libra_token');
      localStorage.removeItem('libra_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/change-password', data),
};

// Books
export const booksAPI = {
  getAll: (params) => API.get('/books', { params }),
  getOne: (id) => API.get(`/books/${id}`),
  getFeatured: () => API.get('/books/featured'),
  create: (data) => API.post('/books', data),
  update: (id, data) => API.put(`/books/${id}`, data),
  delete: (id) => API.delete(`/books/${id}`),
};

// Categories
export const categoriesAPI = {
  getAll: () => API.get('/categories'),
  create: (data) => API.post('/categories', data),
  update: (id, data) => API.put(`/categories/${id}`, data),
  delete: (id) => API.delete(`/categories/${id}`),
};

// Members
export const membersAPI = {
  getAll: (params) => API.get('/members', { params }),
  getOne: (id) => API.get(`/members/${id}`),
  update: (id, data) => API.put(`/members/${id}`, data),
  delete: (id) => API.delete(`/members/${id}`),
};

// Borrows
export const borrowsAPI = {
  getAll: (params) => API.get('/borrows', { params }),
  getMy: () => API.get('/borrows/my'),
  borrow: (data) => API.post('/borrows/borrow', data),
  return: (data) => API.post('/borrows/return', data),
  renew: (id) => API.put(`/borrows/${id}/renew`),
};

// Dashboard
export const dashboardAPI = {
  getStats: () => API.get('/dashboard/stats'),
};

export default API;

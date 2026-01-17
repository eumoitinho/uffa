import axios from 'axios';

// URL base da API - configure conforme seu backend PostgreSQL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==================== AUTENTICAÇÃO ====================

export const loginWithGoogle = async (credential) => {
  const response = await api.post('/auth/google', { credential });
  return response.data;
};

// ==================== USUÁRIOS ====================

export const getUserById = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await api.put(`/users/${userId}`, userData);
  return response.data;
};

export const getUserProfilePhoto = async (userId) => {
  const response = await api.get(`/users/${userId}/photo`);
  return response.data.photo;
};

export const uploadUserPhoto = async (userId, photoFile) => {
  const formData = new FormData();
  formData.append('photo', photoFile);

  const response = await api.post(`/users/${userId}/photo`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.photoUrl;
};

// ==================== TRANSAÇÕES ====================

export const getTransactions = async (userId) => {
  const response = await api.get(`/users/${userId}/transactions`);
  return response.data;
};

export const addTransaction = async (userId, transaction) => {
  const response = await api.post(`/users/${userId}/transactions`, transaction);
  return response.data;
};

export const updateTransaction = async (userId, transaction) => {
  const response = await api.put(`/users/${userId}/transactions/${transaction.id}`, transaction);
  return response.data;
};

export const deleteTransaction = async (userId, transactionId) => {
  const response = await api.delete(`/users/${userId}/transactions/${transactionId}`);
  return response.data;
};

export const checkTransactionExists = async (userId, transactionId) => {
  try {
    const response = await api.get(`/users/${userId}/transactions/${transactionId}`);
    return !!response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return false;
    }
    throw error;
  }
};

// ==================== OPEN FINANCE ====================

export const getOpenFinanceWidgetToken = async ({ name, cpf, cnpj }) => {
  const response = await api.post('/openfinance/widget-token', { name, cpf, cnpj });
  return response.data;
};

export const registerOpenFinanceLink = async (link, institution) => {
  const response = await api.post('/openfinance/links', { link, institution });
  return response.data;
};

export const getOpenFinanceLinks = async () => {
  const response = await api.get('/openfinance/links');
  return response.data;
};

export const syncOpenFinance = async ({ linkId, dateFrom, dateTo }) => {
  const response = await api.post('/openfinance/sync', { linkId, dateFrom, dateTo });
  return response.data;
};

export default api;

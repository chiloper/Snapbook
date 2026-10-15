import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('snapbook_api_url');
    if (custom) return custom.replace(/\/+$/, '');
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/+$/, '');
    }
  }
  return (process.env.NEXT_PUBLIC_API_URL || 'https://snapbook-api.onrender.com').replace(/\/+$/, '');
};

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
});

// Storage helper for browser
export const TokenStorage = {
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  },
  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refresh_token');
  },
  getUser: () => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  setSession: (accessToken: string, refreshToken: string, user?: any) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  },
  clear: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
};

// 1. Request interceptor: Attach Bearer token & dynamic baseURL
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.baseURL = getApiBaseUrl();
  const token = TokenStorage.getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Response interceptor: Catch TOKEN_EXPIRED and auto refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (
      error.response?.status === 401 &&
      error.response.data?.error === 'TOKEN_EXPIRED' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const refreshToken = TokenStorage.getRefreshToken();

      if (refreshToken) {
        try {
          const { data } = await axios.post(`${getApiBaseUrl()}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          TokenStorage.setSession(data.access_token, data.refresh_token, data.user);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          }
          return apiClient(originalRequest);
        } catch (refreshErr) {
          TokenStorage.clear();
          if (typeof window !== 'undefined') {
            const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
            window.location.href = `${basePath}/login`;
          }
        }
      }
    }

    return Promise.reject(error);
  },
);

// --- Auth API ---
export const authApi = {
  login: async (email: string, password: string) => {
    const res = await apiClient.post('/auth/login', { email, password });
    TokenStorage.setSession(res.data.access_token, res.data.refresh_token, res.data.user);
    return res.data;
  },
  register: async (email: string, password: string, display_name: string) => {
    const res = await apiClient.post('/auth/register', { email, password, display_name });
    if (res.data.access_token) {
      TokenStorage.setSession(res.data.access_token, res.data.refresh_token, res.data.user);
    }
    return res.data;
  },
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      TokenStorage.clear();
    }
  },
  getMe: async () => {
    const res = await apiClient.get('/me');
    return res.data;
  },
};

// --- Slips API ---
export const slipsApi = {
  uploadSlips: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    const res = await apiClient.post('/slips', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 180000,
    });
    return res.data;
  },
  getImageUrl: async (id: string) => {
    const res = await apiClient.get(`/slips/${id}/image`);
    return res.data;
  },
};

// --- Transactions API ---
export const transactionsApi = {
  getAll: async (params?: Record<string, any>) => {
    const res = await apiClient.get('/transactions', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get(`/transactions/${id}`);
    return res.data;
  },
  create: async (data: Record<string, any>) => {
    const res = await apiClient.post('/transactions', data);
    return res.data;
  },
  update: async (id: string, data: Record<string, any>) => {
    const res = await apiClient.patch(`/transactions/${id}`, data);
    return res.data;
  },
  confirmBulk: async (ids: string[]) => {
    const res = await apiClient.post('/transactions/confirm-bulk', { ids });
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete(`/transactions/${id}`);
    return res.data;
  },
};

// --- Summary API ---
export const summaryApi = {
  getSummary: async (month?: string) => {
    const res = await apiClient.get('/summary', { params: { month } });
    return res.data;
  },
};

// --- Categories API ---
export const categoriesApi = {
  getAll: async () => {
    const res = await apiClient.get('/categories');
    return res.data;
  },
  create: async (data: { name: string; type: 'income' | 'expense'; icon?: string; color?: string }) => {
    const res = await apiClient.post('/categories', data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete(`/categories/${id}`);
    return res.data;
  },
};

// --- Own Accounts API ---
export const ownAccountsApi = {
  getAll: async () => {
    const res = await apiClient.get('/own-accounts');
    return res.data;
  },
  create: async (data: { bank_name: string; account_name: string; account_number_last4: string }) => {
    const res = await apiClient.post('/own-accounts', data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete(`/own-accounts/${id}`);
    return res.data;
  },
};

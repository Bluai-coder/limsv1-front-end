// ============================================================
// lib/api.ts — Axios API client with auth interceptors
// ============================================================

import axios from 'axios';
import { useAuthStore } from './auth-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach token and tenant
api.interceptors.request.use((config) => {
  const { accessToken, tenant } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  if (tenant?.subdomain) {
    config.headers['x-tenant'] = tenant.subdomain;
  }
  if (tenant?.id) {
    config.headers['X-Tenant-ID'] = tenant.id;
  }
  return config;
});

// Response interceptor — handle 401, refresh tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 429, handle rate limiting
    if (error.response?.status === 429) {
      // Rate limited — don't spam toasts for background pollers
      const retryAfter = error.response?.headers?.['retry-after'];
      if (retryAfter) error.config._retryAfterMs = parseInt(retryAfter, 10) * 1000;
      return Promise.reject(error);
    }

    // If 401 and not already retrying, attempt refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const { refreshToken } = useAuthStore.getState();

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          const { accessToken: newToken, refreshToken: newRefresh } = res.data;

          useAuthStore.getState().setTokens(newToken, newRefresh);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch {
          useAuthStore.getState().logout();
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }
      } else {
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// ─── API helper functions ───

export const authApi = {
  login: (data) =>
    api.post('/auth/login', data, {
      headers: data.tenantSubdomain
        ? { "x-tenant": data.tenantSubdomain.toLowerCase() }
        : {},
    }),
  refresh: (refreshToken) =>
    api.post('/auth/refresh', { refreshToken }),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  selectRole: (data) => api.post('/auth/select-role', data),
};


// lib/api.js (add tenantApi to your existing api)

export const tenantApi = {
  list: (params) => api.get('/tenants', { params }),
  getById: (id) => api.get(`/tenants/getbyId/${id}`),
  create: (data) => api.post('/tenants/add', data),
  edit: (id, data) => api.put(`/tenants/edit/${id}`, data),
  delete: (id) => api.delete(`/tenants/delete/${id}`),
};

export const adminApi = {
  // Auth
  login: (data) => api.post('/admin/login', data),

  // Profile
  getProfile: () => api.get('/admin/profile'),
  updateProfile: (data) => api.put('/admin/profile', data),

  // Admin Management
  getAdmins: () => api.get('/admin/admins'),
  getAdminById: (id) => api.get(`/admin/admins/${id}`),
  createAdmin: (data) => api.post('/admin/admins', data),
  updateAdmin: (id, data) => api.put(`/admin/admins/${id}`, data),
  deleteAdmin: (id) => api.delete(`/admin/admins/${id}`),
};


export const patientApi = {
  search: (params) => api.get(`/patients`, { params }),
  getById: (id) => api.get(`/patients/getAll/${id}`),
  create: (data) => api.post('/patients/add', data),
  update: (id, data) => api.put(`/patients/edit/${id}`, data),
  delete: (id) => api.delete(`/patients/delete/${id}`),

  getOrders: (id) => api.get(`/patients/${id}/orders`),
};

export const orderApi = {
  search: (params) => api.get('/orders', { params }),
  getOrdersByPatientId: (params) => api.get('/orders/getByPatientID', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  getByTestId: (id) => api.get(`/orders/getByTestId/${id}`),
  create: (data) => api.post('/orders/add', data),
  createForBluHealth: (data) => api.post('/orders/add/bluhealth/patient', data),
  updateStatus: (id, data) =>
    api.patch(`/orders/${id}/status`, data),
  getStats: () => api.get('/orders/stats/summary'),
  delete: (id) => api.delete(`/orders/delete/${id}`),
};

export const specimenApi = {
  search: (params) => api.get('/specimens', { params }),
  // getByBarcode: (barcode) => api.get(`/specimens/barcode/${barcode}`),
  scan: (barcode) =>
    api.post("/specimens/scan", { barcode }),
  create: (data) => api.post('/specimens', data),
  // receive: (id, data) => api.patch(`/specimens/${id}/receive`, data),
  receive: (id, data) => api.patch(`/specimens/${id}/status`, data),

};

export const userApi = {
  create: (data) => api.post('/users/add', data),
  edit: (id, tenantId, data) => api.put(`/users/edit/${id}?tenantId=${tenantId}`, data),
  list: (params) => api.get(`/users?tenantId=${params.tenantId}&page=${params.page || 1}&limit=${params.limit || 10}&search=${params.q || ""}`),
  getById: (id, tenantId) => api.get(`/users/getById/${id}?tenantId=${tenantId}`),
  delete: (id, tenantId) => api.delete(`/users/delete/${id}?tenantId=${tenantId}`),
};


export const userRoleApi = {
  create: (data) => api.post('/roles/add', data),
  edit: (id, tenantId, data) => api.put(`/roles/edit/${id}?tenantId=${tenantId}`, data),
  list: (params) => api.get(`/roles?tenantId=${params.tenantId}&page=${params.page || 1}&limit=${params.limit || 10}`),
  getById: (id, tenantId) => api.get(`/roles/getById/${id}?tenantId=${tenantId}`),
  delete: (id, tenantId) => api.delete(`/roles/delete/${id}?tenantId=${tenantId}`),

};


export const physicianApi = {
  // Create physician
  create: (data) => api.post('/referring-physicians/add', data),

  // Edit physician
  edit: (id, data) => api.put(`/referring-physicians/${id}`, data),

  // List physicians with pagination and filters
  list: (params) => {
    const queryParams = new URLSearchParams();
    if (params.tenantId) queryParams.append('tenantId', params.tenantId);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.q) queryParams.append('q', params.q);
    if (params.is_active !== undefined && params.is_active !== '') queryParams.append('is_active', params.is_active);
    if (params.specialty) queryParams.append('specialty', params.specialty);

    const queryString = queryParams.toString();
    return api.get(`/referring-physicians${queryString ? `?${queryString}` : ''}`);
  },

  // Get physician by ID
  getById: (id) => api.get(`/referring-physicians/${id}`),

  // Delete physician
  delete: (id) => api.delete(`/referring-physicians/${id}`),

  // Search physicians
  search: (query) => api.get(`/referring-physicians/search/${query}`),

  // Toggle physician status
  toggleStatus: (id) => api.patch(`/referring-physicians/${id}/toggle-status`),
};


export const useRoleModulepermission = {
  create: (data) => api.post("/useRoleModulepermission/save", data), // ✅ FIXED URL
  getById: (id, tenantId) => api.get(`/useRoleModulepermission/single?role_id=${id}`),

};



export const testCatalogApi = {
  create: (data) => api.post('/test-catalog/add', data),
  edit: (id, tenantId, data) => api.put(`/test-catalog/edit/${id}?tenantId=${tenantId}`, data),
  list: (params) => api.get(`/test-catalog?tenantId=${params.tenantId}&page=${params.page || 1}&limit=${params.limit || 10}&q=${params.q || ""}`),
  listPackages: (params) => api.get(`/test-packages`),
  getById: (id, tenantId) => api.get(`/test-catalog/getById/${id}?tenantId=${tenantId}`),
  delete: (id, tenantId) => api.delete(`/test-catalog/delete/${id}?tenantId=${tenantId}`),

};

export const testPackageCatalogApi = {
  // =============================
  // CREATE
  // =============================
  create: (data) =>
    api.post('/test-packages/add', data),

  // =============================
  // UPDATE
  // =============================
  edit: (id, tenantId, data) =>
    api.put(`/test-packages/edit/${id}`, data, {
      params: { tenantId },
    }),

  // =============================
  // LIST (PAGINATED)
  // =============================
  list: (params) =>
    api.get('/test-packages', {
      params: {
        tenantId: params.tenantId,
        page: params.page || 1,
        limit: params.limit || 10,
        q: params.q || "",
      },
    }),

  // =============================
  // GET BY ID
  // =============================
  getById: (id, tenantId) =>
    api.get(`/test-packages/${id}`, {
      params: { tenantId },
    }),

  // =============================
  // DELETE
  // =============================
  delete: (id, tenantId) =>
    api.delete(`/test-packages/delete/${id}`, {
      params: { tenantId },
    }),
};


// ============================================================
// lib/api/instrument.api.ts
// ============================================================

export const instrumentApi = {
  // =============================
  // CREATE
  // =============================
  create: (data) =>
    api.post("/instruments/add", data),

  // =============================
  // UPDATE
  // =============================
  update: (id, data) =>
    api.put(`/instruments/edit/${id}`, data),

  // =============================
  // LIST (PAGINATED)
  // =============================
  list: (params) =>
    api.get("/instruments", {
      params: {
        tenantId: params.tenantId,
        page: params.page || 1,
        limit: params.limit || 10,
        q: params.q || "",
      },
    }),

  // =============================
  // GET BY ID
  // =============================
  getById: (id, tenantId) =>
    api.get(`/instruments/${id}`, {
      params: { tenantId },
    }),

  // =============================
  // DELETE
  // =============================
  delete: (id, tenantId) =>
    api.delete(`/instruments/delete/${id}`, {
      params: { tenantId },
    }),

  // =============================
  // OPTIONAL: STATS (future)
  // =============================
  getStats: () =>
    api.get("/instruments/stats"),
};
export const rolePermissionApi = {
  create: (data) => api.post('/role-permissions/assign', data),
  list: (params) => api.get(`/all-roles-permissions?tenantId=${params.tenantId}&page=${params.page || 1}&limit=${params.limit || 10}`),
  getById: (id, tenantId) => api.get(`/roles/getById/${id}?tenantId=${tenantId}`),
  delete: (id, tenantId) => api.delete(`/roles/delete/${id}?tenantId=${tenantId}`),
  edit: (id, tenantId, data) => api.put(`/roles/edit/${id}?tenantId=${tenantId}`, data),
}

export const permissionApi = {
  list: (params) => api.get(`/permissions?tenantId=${params.tenantId}&page=${params.page || 1}&limit=${params.limit || 10}`),
}

export const roleUserApi = {
  create: (data) => api.post('/roles/assign', data),
}

export const inventoryApi = {
  list: (params) => api.get('/inventory', { params }),
  getStats: () => api.get('/inventory/stats'),
  create: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  delete: (id) => api.delete(`/inventory/${id}`),
  
  // Stock Movement
  receiveStock: (id, data) => api.post(`/inventory/${id}/receive`, data),
  consumeStock: (id, data) => api.post(`/inventory/${id}/consume`, data),
  adjustQuantity: (id, data) => api.post(`/inventory/${id}/adjust`, data),
  
  // Audit Ledger
  getTransactions: (id, params) => api.get(`/inventory/${id}/transactions`, { params }),
};

export const supplierApi = {
  list: (params) => api.get('/inventory-suppliers', { params }),
  getById: (id) => api.get(`/inventory-suppliers/${id}`),
  create: (data) => api.post('/inventory-suppliers', data),
  update: (id, data) => api.put(`/inventory-suppliers/${id}`, data),
  delete: (id) => api.delete(`/inventory-suppliers/${id}`),
};
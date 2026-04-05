import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('medsync_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('medsync_token');
      localStorage.removeItem('medsync_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

// Hospital
export const hospitalAPI = {
  getInventory: () => api.get('/hospital/inventory'),
  addBatch: (data) => api.post('/hospital/inventory/batch', data),
  updateBatch: (id, data) => api.put(`/hospital/inventory/batch/${id}`, data),
  getNearExpiry: () => api.get('/hospital/expiry/near'),
  getSharedAlerts: () => api.get('/hospital/expiry/shared-alerts'),
  toggleExpirySharing: (share) => api.patch(`/hospital/settings/share-expiry?share=${share}`),
  searchMedicines: (query) => api.get(`/hospital/medicines/search?query=${query}`),
  getMedicineByBarcode: (barcode) => api.get(`/hospital/medicines/barcode/${barcode}`),
  getAllMedicines: () => api.get('/hospital/medicines/all'),
  getMedicineAvailability: (id) => api.get(`/hospital/medicines/${id}/availability`),
  addMedicine: (data) => api.post('/hospital/medicines', data),
  createRequest: (data) => api.post('/hospital/requests', data),
  getMyRequests: () => api.get('/hospital/requests'),
  getIncomingRequests: () => api.get('/hospital/requests/incoming'),
  respondToRequest: (id, data) => api.post(`/hospital/requests/${id}/respond`, data),
  completeRequest: (id) => api.post(`/hospital/requests/${id}/complete`),
};

// Admin
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getPendingRegistrations: () => api.get('/admin/registrations/pending'),
  approveHospital: (id, approve) => api.post(`/admin/registrations/${id}/approve?approve=${approve}`),
  getPendingMedicines: () => api.get('/admin/medicines/pending'),
  approveMedicine: (id, approve) => api.post(`/admin/medicines/${id}/approve?approve=${approve}`),
  getAllInstitutions: () => api.get('/admin/institutions'),
  getAuditLogs: () => api.get('/admin/audit-logs'),
  getAllRequests: () => api.get('/admin/requests'),
};

export default api;

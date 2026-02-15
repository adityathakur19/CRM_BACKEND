import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-storage');
    if (token) {
      const parsed = JSON.parse(token);
      if (parsed.state?.tokens?.accessToken) {
        config.headers.Authorization = `Bearer ${parsed.state.tokens.accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  
  register: (data: any) =>
    apiClient.post('/auth/register', data),
  
  logout: () =>
    apiClient.post('/auth/logout'),
  
  getMe: () =>
    apiClient.get('/auth/me'),
  
  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),
  
  verifyOtp: (email: string, otp: string) =>
    apiClient.post('/auth/verify-otp', { email, otp }),
  
  resetPassword: (token: string, password: string) =>
    apiClient.post('/auth/reset-password', { token, password }),
};

// Leads API
export const leadsApi = {
  getLeads: (params?: any) =>
    apiClient.get('/leads', { params }),
  
  getLead: (id: string) =>
    apiClient.get(`/leads/${id}`),
  
  createLead: (data: any) =>
    apiClient.post('/leads', data),
  
  updateLead: (id: string, data: any) =>
    apiClient.patch(`/leads/${id}`, data),
  
  deleteLead: (id: string) =>
    apiClient.delete(`/leads/${id}`),
  
  getActivities: (leadId: string) =>
    apiClient.get(`/leads/${leadId}/activities`),
  
  addActivity: (leadId: string, data: any) =>
    apiClient.post(`/leads/${leadId}/activities`, data),
  
  assignLead: (leadId: string, userId: string) =>
    apiClient.post(`/leads/${leadId}/assign`, { userId }),
  
  getLeadsByStatus: (status: string) =>
    apiClient.get('/leads', { params: { status } }),
  
  getLeadStats: () =>
    apiClient.get('/leads/stats'),
  
  bulkUpdateStatus: (leadIds: string[], status: string) =>
    apiClient.post('/leads/bulk/update-status', { leadIds, status }),
  
  bulkAssign: (leadIds: string[], userId: string) =>
    apiClient.post('/leads/bulk/assign', { leadIds, userId }),
};

// Communications API
export const communicationsApi = {
  getConversations: () =>
    apiClient.get('/communications/conversations'),
  
  getMessages: (leadId: string) =>
    apiClient.get(`/communications/messages/${leadId}`),
  
  getMessagesByConversation: (conversationId: string) =>
    apiClient.get(`/communications/conversations/${conversationId}/messages`),
  
  sendMessage: (data: any) =>
    apiClient.post('/communications/messages', data),
  
  createConversation: (data: any) =>
    apiClient.post('/communications/conversations', data),
  
  getBroadcasts: () =>
    apiClient.get('/communications/broadcasts'),
  
  createBroadcast: (data: any) =>
    apiClient.post('/communications/broadcasts', data),
};

// Templates API
export const templatesApi = {
  getTemplates: (params?: any) =>
    apiClient.get('/templates', { params }),
  
  getTemplate: (id: string) =>
    apiClient.get(`/templates/${id}`),
  
  createTemplate: (data: any) =>
    apiClient.post('/templates', data),
  
  updateTemplate: (id: string, data: any) =>
    apiClient.patch(`/templates/${id}`, data),
  
  deleteTemplate: (id: string) =>
    apiClient.delete(`/templates/${id}`),
};

// Invoices API
export const invoicesApi = {
  getInvoices: (params?: any) =>
    apiClient.get('/invoices', { params }),
  
  getInvoice: (id: string) =>
    apiClient.get(`/invoices/${id}`),
  
  createInvoice: (data: any) =>
    apiClient.post('/invoices', data),
  
  updateInvoice: (id: string, data: any) =>
    apiClient.patch(`/invoices/${id}`, data),
  
  deleteInvoice: (id: string) =>
    apiClient.delete(`/invoices/${id}`),
  
  downloadInvoice: (id: string) =>
    apiClient.get(`/invoices/${id}/download`, { responseType: 'blob' }),
};

// Payments API
export const paymentsApi = {
  getPayments: (params?: any) =>
    apiClient.get('/payments', { params }),
  
  getPayment: (id: string) =>
    apiClient.get(`/payments/${id}`),
  
  createPayment: (data: any) =>
    apiClient.post('/payments', data),
  
  processRefund: (id: string) =>
    apiClient.post(`/payments/${id}/refund`),
};

// Tasks API
export const tasksApi = {
  getTasks: (params?: any) =>
    apiClient.get('/tasks', { params }),
  
  getMyTasks: () =>
    apiClient.get('/tasks/my-tasks'),
  
  getTask: (id: string) =>
    apiClient.get(`/tasks/${id}`),
  
  createTask: (data: any) =>
    apiClient.post('/tasks', data),
  
  updateTask: (id: string, data: any) =>
    apiClient.patch(`/tasks/${id}`, data),
  
  deleteTask: (id: string) =>
    apiClient.delete(`/tasks/${id}`),
};

// Team API
export const teamApi = {
  getMembers: () =>
    apiClient.get('/team'),
  
  getMember: (id: string) =>
    apiClient.get(`/team/${id}`),
  
  addMember: (data: any) =>
    apiClient.post('/team', data),
  
  updateMember: (id: string, data: any) =>
    apiClient.patch(`/team/${id}`, data),
  
  deleteMember: (id: string) =>
    apiClient.delete(`/team/${id}`),
};

// Roles API
export const rolesApi = {
  getRoles: () =>
    apiClient.get('/roles'),
  
  getRole: (id: string) =>
    apiClient.get(`/roles/${id}`),
  
  createRole: (data: any) =>
    apiClient.post('/roles', data),
  
  updateRole: (id: string, data: any) =>
    apiClient.patch(`/roles/${id}`, data),
  
  deleteRole: (id: string) =>
    apiClient.delete(`/roles/${id}`),
};

// Dashboard API
export const dashboardApi = {
  getStats: () =>
    apiClient.get('/dashboard/stats'),
  
  getLeadStats: (params?: any) =>
    apiClient.get('/dashboard/leads', { params }),
  
  getRevenueStats: (params?: any) =>
    apiClient.get('/dashboard/revenue', { params }),
  
  getPerformanceStats: (params?: any) =>
    apiClient.get('/dashboard/performance', { params }),
};

// Reports API
export const reportsApi = {
  getLeadReport: (params?: any) =>
    apiClient.get('/reports/leads', { params }),
  
  getRevenueReport: (params?: any) =>
    apiClient.get('/reports/revenue', { params }),
  
  getPerformanceReport: (params?: any) =>
    apiClient.get('/reports/performance', { params }),
  
  exportReport: (type: string, params?: any) =>
    apiClient.get(`/reports/export/${type}`, { params, responseType: 'blob' }),
};

// Commissions API
export const commissionsApi = {
  getCommissions: (params?: any) =>
    apiClient.get('/commissions', { params }),
  
  getMyCommissions: () =>
    apiClient.get('/commissions/my-commissions'),
  
  approveCommission: (id: string) =>
    apiClient.post(`/commissions/${id}/approve`),
  
  payCommission: (id: string) =>
    apiClient.post(`/commissions/${id}/pay`),
};

// Webhooks API
export const webhooksApi = {
  getLogs: (params?: any) =>
    apiClient.get('/webhooks/logs', { params }),
  
  simulateWebhook: (source: string, data: any) =>
    apiClient.post(`/webhooks/simulate/${source}`, data),
  
  retryWebhook: (logId: string) =>
    apiClient.post(`/webhooks/retry/${logId}`),
};

// Business API
export const businessApi = {
  getBusiness: () =>
    apiClient.get('/business'),
  
  updateSettings: (data: any) =>
    apiClient.patch('/business/settings', data),
  
  updateNotifications: (data: any) =>
    apiClient.patch('/business/notifications', data),
};

// Integrations API
export const integrationsApi = {
  getStatus: () =>
    apiClient.get('/integrations/status'),
  
  connect: (integration: string) =>
    apiClient.post(`/integrations/connect/${integration}`),
  
  disconnect: (integration: string) =>
    apiClient.post(`/integrations/disconnect/${integration}`),
  
  handleCallback: (integration: string, code: string, state: string) =>
    apiClient.get(`/integrations/callback/${integration}?code=${code}&state=${state}`),
};

// User API
export const userApi = {
  updateProfile: (data: any) =>
    apiClient.patch('/users/profile', data),
  
  changePassword: (data: any) =>
    apiClient.post('/users/change-password', data),
  
  uploadAvatar: (formData: FormData) =>
    apiClient.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default apiClient;
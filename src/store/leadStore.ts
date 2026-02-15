import { create } from 'zustand';
import type { Lead, LeadFilters } from '@/types';
import { leadsApi } from '@/services/api';

interface LeadStore {
  // State
  leads: Lead[];
  currentLead: Lead | null;
  kanbanLeads: Record<string, Lead[]>;
  stats: any;
  isLoading: boolean;
  error: string | null;
  filters: LeadFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };

  // Actions
  setLeads: (leads: Lead[]) => void;
  setCurrentLead: (lead: Lead | null) => void;
  setFilters: (filters: LeadFilters) => void;
  setPagination: (pagination: any) => void;
  
  // API Actions
  fetchLeads: (params?: any) => Promise<void>;
  fetchLead: (id: string) => Promise<void>;
  fetchLeadsByStatus: (status?: string) => Promise<void>;
  fetchLeadStats: () => Promise<void>;
  createLead: (data: any) => Promise<Lead>;
  updateLead: (id: string, data: any) => Promise<Lead>;
  deleteLead: (id: string) => Promise<void>;
  addActivity: (id: string, data: any) => Promise<void>;
  assignLead: (id: string, assignedTo: string) => Promise<void>;
  
  // Bulk actions
  bulkUpdateStatus: (leadIds: string[], status: string) => Promise<void>;
  bulkAssign: (leadIds: string[], assignedTo: string) => Promise<void>;
  
  // Utils
  clearError: () => void;
}

export const useLeadStore = create<LeadStore>((set, get) => ({
  leads: [],
  currentLead: null,
  kanbanLeads: {},
  stats: null,
  isLoading: false,
  error: null,
  filters: {
    status: 'all',
    source: 'all',
    priority: 'all',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },

  setLeads: (leads) => set({ leads }),
  setCurrentLead: (lead) => set({ currentLead: lead }),
  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
  setPagination: (pagination) => set({ pagination: { ...get().pagination, ...pagination } }),

  fetchLeads: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await leadsApi.getLeads({
        ...get().filters,
        ...params,
        page: get().pagination.page,
        limit: get().pagination.limit,
      });
      
      set({
        leads: response.data.data,
        pagination: response.data.pagination,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch leads',
        isLoading: false,
      });
    }
  },

  fetchLead: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await leadsApi.getLead(id);
      set({
        currentLead: response.data.data,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch lead',
        isLoading: false,
      });
    }
  },

  fetchLeadsByStatus: async (status?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = status 
        ? await leadsApi.getLeadsByStatus(status)
        : await leadsApi.getLeads();
      set({
        kanbanLeads: response.data.data,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch leads by status',
        isLoading: false,
      });
    }
  },

  fetchLeadStats: async () => {
    try {
      const response = await leadsApi.getLeadStats();
      set({ stats: response.data.data });
    } catch (error: any) {
      console.error('Failed to fetch lead stats:', error);
    }
  },

  createLead: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await leadsApi.createLead(data);
      const newLead = response.data.data;
      set({
        leads: [newLead, ...get().leads],
        isLoading: false,
      });
      return newLead;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create lead',
        isLoading: false,
      });
      throw error;
    }
  },

  updateLead: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await leadsApi.updateLead(id, data);
      const updatedLead = response.data.data;
      set({
        leads: get().leads.map((lead) =>
          lead._id === id ? updatedLead : lead
        ),
        currentLead: get().currentLead?._id === id ? updatedLead : get().currentLead,
        isLoading: false,
      });
      return updatedLead;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update lead',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteLead: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await leadsApi.deleteLead(id);
      set({
        leads: get().leads.filter((lead) => lead._id !== id),
        currentLead: get().currentLead?._id === id ? null : get().currentLead,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete lead',
        isLoading: false,
      });
      throw error;
    }
  },

  addActivity: async (id, data) => {
    try {
      const response = await leadsApi.addActivity(id, data);
      const updatedLead = response.data.data;
      set({
        leads: get().leads.map((lead) =>
          lead._id === id ? updatedLead : lead
        ),
        currentLead: get().currentLead?._id === id ? updatedLead : get().currentLead,
      });
    } catch (error: any) {
      console.error('Failed to add activity:', error);
      throw error;
    }
  },

  assignLead: async (id, assignedTo) => {
    try {
      const response = await leadsApi.assignLead(id, assignedTo);
      const updatedLead = response.data.data;
      set({
        leads: get().leads.map((lead) =>
          lead._id === id ? updatedLead : lead
        ),
        currentLead: get().currentLead?._id === id ? updatedLead : get().currentLead,
      });
    } catch (error: any) {
      console.error('Failed to assign lead:', error);
      throw error;
    }
  },

  bulkUpdateStatus: async (leadIds, status) => {
    try {
      await leadsApi.bulkUpdateStatus(leadIds, status);
      // Refresh leads
      await get().fetchLeads();
      await get().fetchLeadsByStatus();
    } catch (error: any) {
      console.error('Failed to bulk update status:', error);
      throw error;
    }
  },

  bulkAssign: async (leadIds, assignedTo) => {
    try {
      await leadsApi.bulkAssign(leadIds, assignedTo);
      await get().fetchLeads();
    } catch (error: any) {
      console.error('Failed to bulk assign:', error);
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
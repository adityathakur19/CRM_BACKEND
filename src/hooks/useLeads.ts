import { useEffect, useCallback } from 'react';
import { useLeadStore } from '@/store/leadStore';
import type { LeadFilters } from '@/types';

export const useLeads = (initialFilters?: LeadFilters) => {
  const {
    leads,
    currentLead,
    kanbanLeads,
    stats,
    isLoading,
    error,
    filters,
    pagination,
    fetchLeads,
    fetchLead,
    fetchLeadsByStatus,
    fetchLeadStats,
    createLead,
    updateLead,
    deleteLead,
    addActivity,
    assignLead,
    setFilters,
    setCurrentLead,
    clearError,
  } = useLeadStore();

  // Fetch leads on mount or when filters change
  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters);
    }
    fetchLeads();
  }, []);

  // Refresh leads
  const refresh = useCallback(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Load more leads (pagination)
  const loadMore = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      fetchLeads({ page: pagination.page + 1 });
    }
  }, [pagination, fetchLeads]);

  // Search leads
  const search = useCallback((searchTerm: string) => {
    setFilters({ search: searchTerm });
    fetchLeads({ page: 1, search: searchTerm });
  }, [setFilters, fetchLeads]);

  // Filter by status
  const filterByStatus = useCallback((status: string | null) => {
    const statusValue = (status === 'all' || !status) ? undefined : status;
    setFilters({ status: statusValue });
    fetchLeads({ page: 1, status: statusValue });
  }, [setFilters, fetchLeads]);

  // Filter by source
  const filterBySource = useCallback((source: string | null) => {
    const sourceValue = (source === 'all' || !source) ? undefined : source;
    setFilters({ source: sourceValue });
    fetchLeads({ page: 1, source: sourceValue });
  }, [setFilters, fetchLeads]);

  // Filter by priority
  const filterByPriority = useCallback((priority: string | null) => {
    const priorityValue = (priority === 'all' || !priority) ? undefined : priority;
    setFilters({ priority: priorityValue });
    fetchLeads({ page: 1, priority: priorityValue });
  }, [setFilters, fetchLeads]);

  // Filter by assigned user
  const filterByAssignedTo = useCallback((assignedTo: string | null) => {
    setFilters({ assignedTo: assignedTo || undefined });
    fetchLeads({ page: 1, assignedTo: assignedTo || undefined });
  }, [setFilters, fetchLeads]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({});
    fetchLeads({ page: 1 });
  }, [setFilters, fetchLeads]);

  return {
    // State
    leads,
    currentLead,
    kanbanLeads,
    stats,
    isLoading,
    error,
    filters,
    pagination,

    // Actions
    fetchLeads,
    fetchLead,
    fetchLeadsByStatus,
    fetchLeadStats,
    createLead,
    updateLead,
    deleteLead,
    addActivity,
    assignLead,
    setFilters,
    setCurrentLead,
    clearError,

    // Helpers
    refresh,
    loadMore,
    search,
    filterByStatus,
    filterBySource,
    filterByPriority,
    filterByAssignedTo,
    clearFilters,
  };
};

export const useLead = (leadId: string) => {
  const {
    currentLead,
    isLoading,
    error,
    fetchLead,
    updateLead,
    addActivity,
    assignLead,
    setCurrentLead,
  } = useLeadStore();

  useEffect(() => {
    if (leadId) {
      fetchLead(leadId);
    }
    return () => {
      setCurrentLead(null);
    };
  }, [leadId, fetchLead, setCurrentLead]);

  return {
    lead: currentLead,
    isLoading,
    error,
    updateLead,
    addActivity,
    assignLead,
    refresh: () => fetchLead(leadId),
  };
};

export const useKanbanLeads = () => {
  const {
    kanbanLeads,
    isLoading,
    error,
    fetchLeadsByStatus,
    updateLead,
  } = useLeadStore();

  useEffect(() => {
    fetchLeadsByStatus();
  }, [fetchLeadsByStatus]);

  // Move lead to different status
  const moveLead = async (leadId: string, newStatus: string) => {
    await updateLead(leadId, { status: newStatus });
    await fetchLeadsByStatus();
  };

  return {
    kanbanLeads,
    isLoading,
    error,
    moveLead,
    refresh: fetchLeadsByStatus,
  };
};
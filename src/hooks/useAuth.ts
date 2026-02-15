import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const navigate = useNavigate();
  const {
    user,
    business,
    role,
    isAuthenticated,
    isLoading,
    tokens,
    login,
    register,
    logout,
    fetchCurrentUser,
  } = useAuthStore();

  // Check if token is expired
  const isTokenExpired = () => {
    if (!tokens.expiresAt) return true;
    return new Date() >= new Date(tokens.expiresAt);
  };

  // Redirect to login if not authenticated
  const requireAuth = () => {
    useEffect(() => {
      if (!isAuthenticated && !isLoading) {
        navigate('/login');
      }
    }, [isAuthenticated, isLoading]);
  };

  // Redirect to dashboard if already authenticated
  const requireGuest = () => {
    useEffect(() => {
      if (isAuthenticated) {
        navigate('/dashboard');
      }
    }, [isAuthenticated]);
  };

  // Check permissions
  const hasPermission = (resource: string, action: string): boolean => {
    if (!role) return false;
    if (role.name === 'Owner') return true;
    
    return role.permissions.some(
      (p) =>
        p.resource === resource ||
        p.resource === 'all' ||
        p.actions.includes(action as any) ||
        p.actions.includes('manage')
    );
  };

  const hasRole = (roles: string[]): boolean => {
    if (!role) return false;
    return roles.includes(role.name);
  };

  return {
    user,
    business,
    role,
    isAuthenticated,
    isLoading,
    isTokenExpired,
    login,
    register,
    logout,
    fetchCurrentUser,
    requireAuth,
    requireGuest,
    hasPermission,
    hasRole,
  };
};

export const usePermissions = () => {
  const { role } = useAuthStore();

  const canCreateLeads = () =>
    role?.name === 'Owner' ||
    role?.permissions.some((p) => p.resource === 'leads' && (p.actions.includes('create') || p.actions.includes('manage')));

  const canUpdateLeads = () =>
    role?.name === 'Owner' ||
    role?.permissions.some((p) => p.resource === 'leads' && (p.actions.includes('update') || p.actions.includes('manage')));

  const canDeleteLeads = () =>
    role?.name === 'Owner' ||
    role?.permissions.some((p) => p.resource === 'leads' && (p.actions.includes('delete') || p.actions.includes('manage')));

  const canManageUsers = () =>
    role?.name === 'Owner' ||
    role?.permissions.some((p) => p.resource === 'users' && (p.actions.includes('create') || p.actions.includes('manage')));

  const canViewReports = () =>
    role?.name === 'Owner' ||
    role?.name === 'Manager' ||
    role?.permissions.some((p) => p.resource === 'reports' && p.actions.includes('read'));

  const canManageSettings = () =>
    role?.name === 'Owner' ||
    role?.permissions.some((p) => p.resource === 'settings' && (p.actions.includes('update') || p.actions.includes('manage')));

  return {
    canCreateLeads,
    canUpdateLeads,
    canDeleteLeads,
    canManageUsers,
    canViewReports,
    canManageSettings,
  };
};

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { ForgotPassword } from '@/pages/ForgotPassword';
import { OtpVerification } from '@/pages/OtpVerification';
import { IntegrationCallback } from '@/pages/IntegrationCallback';
import { Dashboard } from '@/pages/Dashboard';
import { Leads } from '@/pages/Leads';
import { CommunicationPage } from '@/pages/communications/CommunicationPage';
import { BroadcastPage } from '@/pages/communications/BroadcastPage';
import { InvoiceList } from '@/pages/invoices/InvoiceList';
import { CreateInvoice } from '@/pages/invoices/CreateInvoice';
import { PaymentTracking } from '@/pages/PaymentTracking';
import { Settings } from '@/pages/Settings';
import { Profile } from '@/pages/Profile';
import { TeamManagement } from '@/pages/TeamManagement';
import { TeamMemberDetail } from '@/pages/TeamMemberDetail';
import { Reports } from '@/pages/Reports';
import { CommissionTracking } from '@/pages/CommissionTracking';
import { WebhookLogs } from '@/pages/WebhookLogs';
import { TemplateManager } from '@/pages/TemplateManager';
import { UserPermissions } from '@/pages/UserPermissions';
import { UpgradePlan } from '@/pages/Upgradeplan';
import { OwnerDashboard } from '@/pages/dashboard/OwnerDashboard';
import { ManagerDashboard } from '@/pages/dashboard/ManagerDashboard';
import { AgentDashboard } from '@/pages/dashboard/AgentDashboard';
import { MockLeads } from '@/pages/mockdata/MockLeads';
import { MockFacebookLeads } from '@/pages/mockdata/MockFacebookLeads';
import { MockInstagramLeads } from '@/pages/mockdata/MockInstagramLeads';
import { MockGoogleAdsLeads } from '@/pages/mockdata/MockGoogleAdsLeads';
import { MockWhatsAppLeads } from '@/pages/mockdata/MockWhatsAppLeads';
import { MockLinkedInLeads } from '@/pages/mockdata/MockLinkedInLeads';
import { MockEmailLeads } from '@/pages/mockdata/MockEmailLeads';
import { MockCommunications } from '@/pages/mockdata/MockCommunications';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Public Route Component (redirects to dashboard if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Role-based Dashboard Route
function DashboardRoute() {
  const { user, role } = useAuthStore();

  if (!user || !role) {
    return <Dashboard />;
  }

  switch (role.name) {
    case 'Owner':
      return <OwnerDashboard />;
    case 'Manager':
      return <ManagerDashboard />;
    case 'Agent':
      return <AgentDashboard />;
    default:
      return <Dashboard />;
  }
}

function App() {
  const { fetchCurrentUser } = useAuthStore();

  useEffect(() => {
    // Only fetch current user if we have a valid token in storage
    // This prevents infinite 401 loops when not authenticated
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        if (parsed.state?.tokens?.accessToken) {
          fetchCurrentUser();
        }
      } catch (error) {
        console.error('Failed to parse auth storage:', error);
        localStorage.removeItem('auth-storage');
      }
    }
  }, []);

  return (
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/verify-otp"
            element={
              <PublicRoute>
                <OtpVerification />
              </PublicRoute>
            }
          />
          
          {/* OAuth Callback Route - No authentication required */}
          <Route
            path="/integrations/callback/:integration"
            element={<IntegrationCallback />}
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardRoute />} />
            <Route path="leads" element={<Leads />} />
            
            {/* Communications */}
            <Route path="communications" element={<CommunicationPage />} />
            <Route path="communications/broadcast" element={<BroadcastPage />} />
            
            {/* Invoices */}
            <Route path="invoices" element={<InvoiceList />} />
            <Route path="invoices/new" element={<CreateInvoice />} />
            
            {/* Payments */}
            <Route path="payments" element={<PaymentTracking />} />
            
            {/* Reports */}
            <Route path="reports" element={<Reports />} />
            <Route path="commissions" element={<CommissionTracking />} />
            
            {/* Management */}
            <Route path="team" element={<TeamManagement />} />
            <Route path="team/:id" element={<TeamMemberDetail />} />
            <Route path="permissions" element={<UserPermissions />} />
            <Route path="templates" element={<TemplateManager />} />
            <Route path="webhooks" element={<WebhookLogs />} />
            
            {/* Settings & Billing */}
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
            <Route path="billing/upgrade" element={<UpgradePlan />} />
          </Route>

          {/* Mock Data Routes (for testing) */}
          <Route
            path="/mockdata"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="leads" element={<MockLeads />} />
            <Route path="communications" element={<MockCommunications />} />
            <Route path="facebookleads" element={<MockFacebookLeads />} />
            <Route path="instaleads" element={<MockInstagramLeads />} />
            <Route path="googleadsleads" element={<MockGoogleAdsLeads />} />
            <Route path="whatsappleads" element={<MockWhatsAppLeads />} />
            <Route path="linkedinleads" element={<MockLinkedInLeads />} />
            <Route path="emailsleads" element={<MockEmailLeads />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </TooltipProvider>
  );
}

export default App;
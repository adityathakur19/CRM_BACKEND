// User types
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  roleId: string | Role;
  businessId: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  twoFactorEnabled: boolean;
  loginAttempts: number;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  _id: string;
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'manage')[];
}

// Business types
export interface Business {
  _id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  industry: 'shop' | 'restaurant' | 'education' | 'travel' | 'other';
  subscription: {
    plan: 'free' | 'starter' | 'professional' | 'enterprise';
    status: 'active' | 'inactive' | 'cancelled' | 'suspended';
    maxUsers: number;
    maxLeads: number;
  };
  settings: {
    timezone: string;
    currency: string;
    language: string;
  };
}

// Lead types
export interface Lead {
  _id: string;
  businessId: string;
  name: string;
  email?: string;
  phone: string;
  source: LeadSource;
  sourceDetails?: {
    campaignId?: string;
    campaignName?: string;
    adId?: string;
    formId?: string;
    referrer?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  };
  status: LeadStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: User;
  tags: string[];
  score: number;
  company?: string;
  jobTitle?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  notes?: string;
  activities: Activity[];
  lastContactedAt?: string;
  nextFollowUpAt?: string;
  contactCount: number;
  isDuplicate: boolean;
  duplicateOf?: Lead;
  createdAt: string;
  updatedAt: string;
}

export type LeadSource = 
  | 'facebook_ad' 
  | 'instagram_ad' 
  | 'linkedin_ad'
  | 'google_ad' 
  | 'whatsapp' 
  | 'website' 
  | 'email'
  | 'referral' 
  | 'manual' 
  | 'import' 
  | 'other';

export type LeadStatus = 
  | 'new' 
  | 'contacted' 
  | 'qualified' 
  | 'proposal' 
  | 'negotiation' 
  | 'won' 
  | 'lost' 
  | 'archived';

export interface Activity {
  _id: string;
  type: 'note' | 'call' | 'email' | 'sms' | 'whatsapp' | 'meeting' | 'status_change' | 'assignment' | 'created';
  description: string;
  performedBy: User;
  performedAt: string;
  metadata?: any;
}

// Message types
export interface Message {
  _id: string;
  conversationId: string;
  leadId: string;
  sender: {
    type: 'user' | 'lead' | 'system';
    userId?: string;
    name?: string;
  };
  channel: 'whatsapp' | 'email' | 'sms' | 'in_app';
  content: {
    text?: string;
    html?: string;
    attachments?: Attachment[];
  };
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed' | 'cancelled';
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  createdAt: string;
}

export interface Attachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

// Conversation types
export interface Conversation {
  _id: string;
  businessId: string;
  leadId: Lead;
  channel: 'whatsapp' | 'email' | 'sms' | 'in_app';
  lastMessage?: {
    content: string;
    sender: string;
    timestamp: string;
  };
  unreadCount: {
    user: number;
    lead: number;
  };
  status: 'active' | 'archived' | 'closed';
  assignedTo?: User;
  lastActivityAt: string;
  createdAt: string;
}

// Template types
export interface Template {
  _id: string;
  businessId: string;
  name: string;
  description?: string;
  category: 'whatsapp' | 'email' | 'sms' | 'all';
  type: 'text' | 'media' | 'interactive' | 'document';
  content: {
    subject?: string;
    body: string;
    htmlBody?: string;
    variables?: string[];
  };
  language: string;
  isActive: boolean;
  usageCount: number;
  createdBy: User;
  createdAt: string;
}

// Invoice types
export interface Invoice {
  _id: string;
  invoiceNumber: string;
  customer: {
    name: string;
    email?: string;
    phone?: string;
    address?: any;
  };
  leadId?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
  issueDate: string;
  dueDate: string;
  notes?: string;
  createdAt: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  tax?: number;
  total: number;
}

// Payment types
export interface Payment {
  _id: string;
  businessId: string;
  invoiceId?: string;
  leadId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  method: 'card' | 'bank_transfer' | 'cash' | 'upi' | 'wallet' | 'other';
  gateway: 'stripe' | 'razorpay' | 'manual' | 'other';
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  commissions: Commission[];
  paidAt?: string;
  createdAt: string;
}

export interface Commission {
  userId: string;
  amount: number;
  percentage: number;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  paidAt?: string;
}

// Task types
export interface Task {
  _id: string;
  businessId: string;
  title: string;
  description?: string;
  assignedTo: User;
  assignedBy: User;
  leadId?: Lead;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  completedAt?: string;
  tags: string[];
  createdAt: string;
}

// Notification types
export interface Notification {
  _id: string;
  businessId: string;
  userId: string;
  type: 'task_assigned' | 'lead_assigned' | 'message_received' | 'payment_received' | 'reminder' | 'system';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  readAt?: string;
  actionUrl?: string;
  createdAt: string;
}

// Dashboard types
export interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  convertedLeads: number;
  conversionRate: number;
  revenue: number;
  pendingFollowUps: number;
  leadsByStatus: Record<string, number>;
  leadsBySource: Record<string, number>;
  recentLeads: Lead[];
  topPerformers: {
    userId: string;
    name: string;
    leadsConverted: number;
    revenue: number;
  }[];
}

// Auth types
export interface AuthState {
  user: User | null;
  business: Business | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tokens: {
    accessToken: string | null;
    expiresAt: Date | null;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  businessName: string;
  industry: 'shop' | 'restaurant' | 'education' | 'travel' | 'other';
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  errors?: any[];
  code?: string;
}

// Filter types
export interface LeadFilters {
  status?: string;
  source?: string;
  priority?: string;
  assignedTo?: string;
  tags?: string[];
  search?: string;
  startDate?: Date;
  endDate?: Date;
}

// Webhook log types
export interface WebhookLog {
  _id: string;
  businessId: string;
  source: string;
  event: string;
  payload: any;
  status: 'success' | 'failed' | 'pending';
  leadId?: string;
  error?: string;
  createdAt: string;
}

// Report types
export interface Report {
  _id: string;
  businessId: string;
  name: string;
  type: 'leads' | 'revenue' | 'performance' | 'conversion';
  dateRange: {
    start: string;
    end: string;
  };
  data: any;
  createdBy: string;
  createdAt: string;
}
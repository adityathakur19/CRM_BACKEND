import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, DollarSign, Target, 
  UserPlus, CreditCard, BarChart3, Settings,
  ArrowUpRight, ArrowDownRight, 
  Briefcase, Phone, Mail
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { useAuthStore } from '@/store/authStore';
import { dashboardApi, teamApi } from '@/services/api';
import { toast } from 'sonner';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  convertedLeads: number;
  conversionRate: number;
  revenue: number;
  pendingFollowUps: number;
  leadsByStatus: Record<string, number>;
  leadsBySource: Record<string, number>;
  recentLeads: any[];
  topPerformers: any[];
}

export function OwnerDashboard() {
  const navigate = useNavigate();
  const { business, user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, teamRes] = await Promise.all([
        dashboardApi.getStats(),
        teamApi.getMembers(),
      ]);

      setStats(statsRes.data.data);
      setTeamMembers(teamRes.data.data || []);

      // Generate mock revenue data for the chart
      const mockRevenueData = [
        { month: 'Jan', revenue: 45000, leads: 120 },
        { month: 'Feb', revenue: 52000, leads: 145 },
        { month: 'Mar', revenue: 48000, leads: 132 },
        { month: 'Apr', revenue: 61000, leads: 168 },
        { month: 'May', revenue: 55000, leads: 155 },
        { month: 'Jun', revenue: 67000, leads: 189 },
      ];
      setRevenueData(mockRevenueData);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const sourceData = stats?.leadsBySource 
    ? Object.entries(stats.leadsBySource).map(([name, value]) => ({ name, value }))
    : [];

  const quickActions = [
    { label: 'Add Team Member', icon: UserPlus, onClick: () => navigate('/team'), color: 'bg-blue-500' },
    { label: 'Create Invoice', icon: CreditCard, onClick: () => navigate('/invoices/new'), color: 'bg-green-500' },
    { label: 'View Reports', icon: BarChart3, onClick: () => navigate('/reports'), color: 'bg-purple-500' },
    { label: 'Settings', icon: Settings, onClick: () => navigate('/settings'), color: 'bg-orange-500' },
  ];

  const statCards = [
    { 
      title: 'Total Revenue', 
      value: `$${stats?.revenue?.toLocaleString() || '0'}`, 
      change: '+12.5%', 
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      title: 'Total Leads', 
      value: stats?.totalLeads?.toString() || '0', 
      change: '+8.2%', 
      trend: 'up',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      title: 'Conversion Rate', 
      value: `${stats?.conversionRate?.toFixed(1) || '0'}%`, 
      change: '+2.4%', 
      trend: 'up',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    { 
      title: 'Team Members', 
      value: teamMembers.length.toString(), 
      change: '+1', 
      trend: 'up',
      icon: Briefcase,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
  ];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-500 mt-1">
            Here's what's happening with {business?.name} today
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/leads')}>
            View All Leads
          </Button>
          <Button onClick={() => navigate('/team/new')}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Card 
            key={action.label} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={action.onClick}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`${action.color} p-3 rounded-lg`}>
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <span className="font-medium text-sm">{action.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Leads Trend</CardTitle>
            <CardDescription>Monthly revenue and lead generation overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenue ($)" />
                <Line yAxisId="right" type="monotone" dataKey="leads" stroke="#10b981" name="Leads" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Leads by Source</CardTitle>
            <CardDescription>Distribution of leads across different channels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sourceData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance & Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Team Performance</CardTitle>
              <CardDescription>Top performers this month</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/team')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamMembers.slice(0, 5).map((member) => (
                <div key={member._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {member.firstName[0]}{member.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.firstName} {member.lastName}</p>
                      <p className="text-sm text-gray-500">{member.role?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{member.leadsConverted || 0} leads</p>
                    <p className="text-sm text-green-600">${member.revenue || 0}</p>
                  </div>
                </div>
              ))}
              {teamMembers.length === 0 && (
                <p className="text-center text-gray-500 py-4">No team members yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Leads</CardTitle>
              <CardDescription>Latest leads across all sources</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/leads')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentLeads?.slice(0, 5).map((lead) => (
                <div key={lead._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-sm text-gray-500">{lead.source}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={lead.status === 'new' ? 'default' : 'secondary'}>
                      {lead.status}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {!stats?.recentLeads?.length && (
                <p className="text-center text-gray-500 py-4">No recent leads</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500">Current Plan</p>
              <p className="text-lg font-semibold capitalize">{business?.subscription?.plan || 'Free'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Team Members</p>
              <p className="text-lg font-semibold">{teamMembers.length} / {business?.subscription?.maxUsers || 5}</p>
              <Progress value={(teamMembers.length / (business?.subscription?.maxUsers || 5)) * 100} className="mt-2" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Leads Used</p>
              <p className="text-lg font-semibold">{stats?.totalLeads || 0} / {business?.subscription?.maxLeads || 100}</p>
              <Progress value={((stats?.totalLeads || 0) / (business?.subscription?.maxLeads || 100)) * 100} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, CheckCircle, Clock, Phone, Mail, 
  MessageSquare, ArrowUpRight,
  ArrowDownRight, Target, Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { useAuthStore } from '@/store/authStore';
import { dashboardApi, leadsApi, tasksApi } from '@/services/api';
import { toast } from 'sonner';

interface AgentStats {
  totalLeads: number;
  newLeads: number;
  convertedLeads: number;
  conversionRate: number;
  pendingFollowUps: number;
  leadsByStatus: Record<string, number>;
  recentLeads: any[];
}

export function AgentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [todayFollowUps, setTodayFollowUps] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, tasksRes, leadsRes] = await Promise.all([
        dashboardApi.getStats(),
        tasksApi.getMyTasks(),
        leadsApi.getLeads({ assignedTo: user?._id }),
      ]);

      setStats(statsRes.data.data);
      setTasks(tasksRes.data.data?.slice(0, 5) || []);
      
      // Get leads needing follow-up today
      const allLeads = leadsRes.data.data?.leads || [];
      const today = new Date().toISOString().split('T')[0];
      setTodayFollowUps(allLeads.filter((l: any) => 
        l.nextFollowUpAt?.split('T')[0] === today
      ));

      // Mock performance data
      setPerformanceData([
        { day: 'Mon', leads: 3, conversions: 1 },
        { day: 'Tue', leads: 5, conversions: 2 },
        { day: 'Wed', leads: 4, conversions: 1 },
        { day: 'Thu', leads: 6, conversions: 2 },
        { day: 'Fri', leads: 5, conversions: 2 },
        { day: 'Sat', leads: 2, conversions: 0 },
        { day: 'Sun', leads: 1, conversions: 0 },
      ]);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      title: 'My Leads', 
      value: stats?.totalLeads?.toString() || '0', 
      change: '+2', 
      trend: 'up',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      title: 'Converted', 
      value: stats?.convertedLeads?.toString() || '0', 
      change: '+1', 
      trend: 'up',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      title: 'Today\'s Follow-ups', 
      value: todayFollowUps.length.toString(), 
      change: todayFollowUps.length > 0 ? 'Pending' : 'Done', 
      trend: todayFollowUps.length > 0 ? 'up' : 'down',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    { 
      title: 'My Conversion Rate', 
      value: `${stats?.conversionRate?.toFixed(1) || '0'}%`, 
      change: '+0.5%', 
      trend: 'up',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getLeadStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      new: 'bg-blue-100 text-blue-700',
      contacted: 'bg-yellow-100 text-yellow-700',
      qualified: 'bg-purple-100 text-purple-700',
      proposal: 'bg-orange-100 text-orange-700',
      negotiation: 'bg-pink-100 text-pink-700',
      won: 'bg-green-100 text-green-700',
      lost: 'bg-red-100 text-red-700',
    };
    return variants[status] || 'bg-gray-100 text-gray-700';
  };

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
            Agent Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {user?.firstName}! Here's your daily overview
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/communications')}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Messages
          </Button>
          <Button onClick={() => navigate('/leads')}>
            <Users className="mr-2 h-4 w-4" />
            My Leads
          </Button>
        </div>
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
                <div className={`flex items-center gap-1 text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-gray-600'}`}>
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

      {/* Main Content Tabs */}
      <Tabs defaultValue="today" className="space-y-6">
        <TabsList>
          <TabsTrigger value="today">Today's Tasks</TabsTrigger>
          <TabsTrigger value="leads">My Leads</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Follow-ups */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Today's Follow-ups</CardTitle>
                  <CardDescription>Leads scheduled for follow-up today</CardDescription>
                </div>
                <Badge variant="secondary">{todayFollowUps.length} Pending</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todayFollowUps.map((lead) => (
                    <div key={lead._id} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-100 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-orange-100 text-orange-600">
                            {lead.name?.[0] || 'L'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{lead.name}</p>
                          <p className="text-sm text-gray-500">{lead.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Phone className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Mail className="h-4 w-4 text-blue-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {todayFollowUps.length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                      <p className="text-gray-500">All caught up! No follow-ups for today.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* My Tasks */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>My Tasks</CardTitle>
                  <CardDescription>Tasks assigned to you</CardDescription>
                </div>
                <Button size="sm" onClick={() => navigate('/tasks/new')}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getStatusColor(task.status)}`}>
                          <CheckCircle className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-gray-500">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize">{task.status}</Badge>
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No pending tasks</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leads" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Active Leads</CardTitle>
                <CardDescription>Leads assigned to you</CardDescription>
              </div>
              <Button onClick={() => navigate('/leads')}>
                View All Leads
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.recentLeads?.slice(0, 8).map((lead) => (
                  <div key={lead._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {lead.name?.[0] || 'L'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        <p className="text-sm text-gray-500">{lead.email || lead.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={getLeadStatusBadge(lead.status)}>
                        {lead.status}
                      </Badge>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {!stats?.recentLeads?.length && (
                  <p className="text-center text-gray-500 py-8">No leads assigned yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Performance</CardTitle>
                <CardDescription>Your leads and conversions this week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="leads" stroke="#3b82f6" name="Leads" />
                    <Line type="monotone" dataKey="conversions" stroke="#10b981" name="Conversions" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Targets */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Targets</CardTitle>
                <CardDescription>Progress towards your monthly goals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Lead Conversion</span>
                    <span className="text-sm text-gray-500">18 / 25 leads</span>
                  </div>
                  <Progress value={72} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Revenue Target</span>
                    <span className="text-sm text-gray-500">$12,500 / $20,000</span>
                  </div>
                  <Progress value={62.5} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Follow-up Rate</span>
                    <span className="text-sm text-gray-500">85 / 100</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Customer Satisfaction</span>
                    <span className="text-sm text-gray-500">4.5 / 5.0</span>
                  </div>
                  <Progress value={90} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Calls Made', value: '47', change: '+12%' },
              { label: 'Emails Sent', value: '128', change: '+8%' },
              { label: 'Meetings', value: '15', change: '+3%' },
              { label: 'Avg Response', value: '2.3h', change: '-15%' },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

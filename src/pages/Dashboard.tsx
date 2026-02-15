import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useLeadStore } from '@/store/leadStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowRight,
  Calendar,
  Target,
  BarChart3,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

// Mock data for charts
const leadTrendData = [
  { name: 'Mon', leads: 12 },
  { name: 'Tue', leads: 19 },
  { name: 'Wed', leads: 15 },
  { name: 'Thu', leads: 25 },
  { name: 'Fri', leads: 22 },
  { name: 'Sat', leads: 18 },
  { name: 'Sun', leads: 14 },
];

const sourceData = [
  { name: 'Website', value: 35, color: '#3b82f6' },
  { name: 'Facebook', value: 25, color: '#8b5cf6' },
  { name: 'Google Ads', value: 20, color: '#10b981' },
  { name: 'Referral', value: 15, color: '#f59e0b' },
  { name: 'Other', value: 5, color: '#6b7280' },
];

const statusData = [
  { name: 'New', count: 45 },
  { name: 'Contacted', count: 32 },
  { name: 'Qualified', count: 28 },
  { name: 'Proposal', count: 15 },
  { name: 'Won', count: 12 },
];

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { stats, fetchLeadStats } = useLeadStore();

  useEffect(() => {
    fetchLeadStats();
  }, [fetchLeadStats]);

  const statCards = [
    {
      title: 'Total Leads',
      value: stats?.total || 245,
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'New Leads',
      value: stats?.byStatus?.new || 45,
      change: '+8%',
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      title: 'Conversion Rate',
      value: '24.5%',
      change: '-2%',
      trend: 'down',
      icon: Target,
      color: 'bg-purple-500',
    },
    {
      title: 'Revenue',
      value: '$12,450',
      change: '+18%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-amber-500',
    },
  ];

  const recentActivities = [
    { id: 1, type: 'lead', message: 'New lead from Facebook: John Doe', time: '5 min ago', icon: Users },
    { id: 2, type: 'call', message: 'Call completed with Sarah Smith', time: '15 min ago', icon: Calendar },
    { id: 3, type: 'email', message: 'Email sent to Mike Johnson', time: '30 min ago', icon: Calendar },
    { id: 4, type: 'whatsapp', message: 'WhatsApp message from Emma Wilson', time: '1 hour ago', icon: Calendar },
    { id: 5, type: 'meeting', message: 'Meeting scheduled with David Brown', time: '2 hours ago', icon: Calendar },
  ];

  const getRoleBasedGreeting = () => {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    
    if (user?.firstName) {
      return `Good ${timeOfDay}, ${user.firstName}!`;
    }
    return `Good ${timeOfDay}!`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{getRoleBasedGreeting()}</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your business today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/leads')}>
            View Leads
          </Button>
          <Button onClick={() => navigate('/leads/new')}>
            Add Lead
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="mt-2 text-3xl font-bold">{stat.value}</p>
                  <div className="mt-2 flex items-center gap-1 text-sm">
                    {stat.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                      {stat.change}
                    </span>
                    <span className="text-muted-foreground">vs last week</span>
                  </div>
                </div>
                <div className={`${stat.color} rounded-lg p-3`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Lead Trend Chart */}
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Lead Trend</CardTitle>
                <CardDescription>Daily lead generation over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={leadTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="leads"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Source Distribution */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Lead Sources</CardTitle>
                <CardDescription>Distribution by source</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sourceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {sourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {sourceData.map((source) => (
                    <div key={source.name} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: source.color }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {source.name} ({source.value}%)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Status Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Lead Status</CardTitle>
                <CardDescription>Current pipeline status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates from your team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <activity.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="mt-4 w-full" onClick={() => navigate('/activities')}>
                  View all activity
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analytics</CardTitle>
              <CardDescription>Coming soon...</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">Advanced analytics coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Generate and download reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Lead Report</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      Download CSV
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Revenue Report</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      Download CSV
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Performance Report</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      Download CSV
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

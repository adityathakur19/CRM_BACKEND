import { useEffect, useState } from 'react';
import { 
  TrendingUp, DollarSign, Download,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';
import { reportsApi } from '@/services/api';
import { toast } from 'sonner';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function Reports() {
  const [dateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  });
  
  const [leadStats, setLeadStats] = useState({
    total: 245,
    new: 45,
    converted: 38,
    conversionRate: 15.5,
    bySource: [
      { name: 'Facebook', value: 85 },
      { name: 'Google Ads', value: 62 },
      { name: 'Website', value: 48 },
      { name: 'Referral', value: 32 },
      { name: 'Other', value: 18 },
    ],
    byStatus: [
      { name: 'New', value: 45 },
      { name: 'Contacted', value: 78 },
      { name: 'Qualified', value: 52 },
      { name: 'Proposal', value: 32 },
      { name: 'Won', value: 38 },
    ],
    trend: [
      { date: 'Week 1', leads: 45, conversions: 8 },
      { date: 'Week 2', leads: 52, conversions: 10 },
      { date: 'Week 3', leads: 48, conversions: 9 },
      { date: 'Week 4', leads: 58, conversions: 11 },
    ],
  });

  const [revenueStats, setRevenueStats] = useState({
    total: 125000,
    thisMonth: 45000,
    lastMonth: 38000,
    growth: 18.4,
    byMonth: [
      { month: 'Jan', revenue: 32000 },
      { month: 'Feb', revenue: 35000 },
      { month: 'Mar', revenue: 38000 },
      { month: 'Apr', revenue: 42000 },
      { month: 'May', revenue: 45000 },
      { month: 'Jun', revenue: 48000 },
    ],
  });

  const [performanceStats, setPerformanceStats] = useState({
    topAgents: [
      { name: 'John Smith', leads: 45, conversions: 12, revenue: 25000 },
      { name: 'Sarah Johnson', leads: 38, conversions: 10, revenue: 22000 },
      { name: 'Mike Davis', leads: 42, conversions: 9, revenue: 18000 },
      { name: 'Emily Brown', leads: 35, conversions: 8, revenue: 15000 },
    ],
    avgResponseTime: 2.5,
    avgConversionTime: 5.2,
  });

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      const [leadsRes, revenueRes, performanceRes] = await Promise.all([
        reportsApi.getLeadReport({ start: dateRange.start, end: dateRange.end }),
        reportsApi.getRevenueReport({ start: dateRange.start, end: dateRange.end }),
        reportsApi.getPerformanceReport({ start: dateRange.start, end: dateRange.end }),
      ]);

      if (leadsRes.data.data) setLeadStats(leadsRes.data.data);
      if (revenueRes.data.data) setRevenueStats(revenueRes.data.data);
      if (performanceRes.data.data) setPerformanceStats(performanceRes.data.data);
    } catch (error) {
      toast.error('Failed to load reports');
    }
  };

  const handleExport = async (type: string) => {
    try {
      const response = await reportsApi.exportReport(type, { start: dateRange.start, end: dateRange.end });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${type}-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report exported');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-gray-500 mt-1">Comprehensive insights into your business</p>
        </div>
        <div className="flex gap-3">
          <Select defaultValue="30">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
              <SelectItem value="365">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchReports}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="leads" className="space-y-6">
        <TabsList>
          <TabsTrigger value="leads">
            <TrendingUp className="mr-2 h-4 w-4" />
            Leads
          </TabsTrigger>
          <TabsTrigger value="revenue">
            <DollarSign className="mr-2 h-4 w-4" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="performance">
            <TrendingUp className="mr-2 h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">Total Leads</p>
                <p className="text-2xl font-bold">{leadStats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">New Leads</p>
                <p className="text-2xl font-bold">{leadStats.new}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">Converted</p>
                <p className="text-2xl font-bold text-green-600">{leadStats.converted}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">Conversion Rate</p>
                <p className="text-2xl font-bold text-blue-600">{leadStats.conversionRate}%</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Lead Trend</CardTitle>
                  <CardDescription>Leads and conversions over time</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleExport('leads')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <ReLineChart data={leadStats.trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="leads" stroke="#3b82f6" name="Leads" />
                    <Line type="monotone" dataKey="conversions" stroke="#10b981" name="Conversions" />
                  </ReLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Leads by Source</CardTitle>
                <CardDescription>Distribution across channels</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={leadStats.bySource}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {leadStats.bySource.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold">${revenueStats.total.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">This Month</p>
                <p className="text-2xl font-bold text-blue-600">${revenueStats.thisMonth.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">Last Month</p>
                <p className="text-2xl font-bold">${revenueStats.lastMonth.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">Growth</p>
                <p className="text-2xl font-bold text-green-600">+{revenueStats.growth}%</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue overview</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleExport('revenue')}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueStats.byMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">Avg Response Time</p>
                <p className="text-2xl font-bold">{performanceStats.avgResponseTime}h</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">Avg Conversion Time</p>
                <p className="text-2xl font-bold">{performanceStats.avgConversionTime}d</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">Team Efficiency</p>
                <p className="text-2xl font-bold text-green-600">92%</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Best performing team members</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleExport('performance')}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceStats.topAgents.map((agent, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-sm text-gray-500">{agent.leads} leads • {agent.conversions} conversions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">${agent.revenue.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { 
  DollarSign, CreditCard, Clock,
  Download, TrendingUp, Calendar,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { paymentsApi } from '@/services/api';
import { toast } from 'sonner';
import type { Payment } from '@/types';

export function PaymentTracking() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const fetchPayments = async () => {
    try {
      const response = await paymentsApi.getPayments({ 
        status: statusFilter === 'all' ? undefined : statusFilter 
      });
      setPayments(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load payments');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
      refunded: 'bg-orange-100 text-orange-700',
      cancelled: 'bg-gray-100 text-gray-700',
    };
    return <Badge className={variants[status] || ''}>{status}</Badge>;
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'card': return '💳';
      case 'bank_transfer': return '🏦';
      case 'cash': return '💵';
      case 'upi': return '📱';
      case 'wallet': return '👛';
      default: return '💳';
    }
  };

  const filteredPayments = payments.filter(payment => 
    payment.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment._id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: payments.reduce((acc, p) => acc + (p.status === 'completed' ? p.amount : 0), 0),
    pending: payments.filter(p => p.status === 'pending').reduce((acc, p) => acc + p.amount, 0),
    refunded: payments.filter(p => p.status === 'refunded').reduce((acc, p) => acc + p.amount, 0),
    thisMonth: payments
      .filter(p => p.status === 'completed' && new Date(p.createdAt).getMonth() === new Date().getMonth())
      .reduce((acc, p) => acc + p.amount, 0),
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Tracking</h1>
          <p className="text-gray-500 mt-1">Monitor and manage all payments</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold">${stats.total.toLocaleString()}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
              <ArrowUpRight className="h-4 w-4" />
              <span>+12.5% from last month</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">This Month</p>
                <p className="text-2xl font-bold text-blue-600">${stats.thisMonth.toLocaleString()}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-blue-600">
              <TrendingUp className="h-4 w-4" />
              <span>On track</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">${stats.pending.toLocaleString()}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-yellow-600">
              <span>{payments.filter(p => p.status === 'pending').length} payments</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Refunded</p>
                <p className="text-2xl font-bold text-red-600">${stats.refunded.toLocaleString()}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <ArrowDownRight className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-red-600">
              <span>{payments.filter(p => p.status === 'refunded').length} refunds</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Input 
                placeholder="Search by customer or payment ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>View all payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment._id}>
                  <TableCell className="font-medium">#{payment._id.slice(-8)}</TableCell>
                  <TableCell>{payment.customer?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{getMethodIcon(payment.method)}</span>
                      <span className="capitalize">{payment.method.replace('_', ' ')}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    ${payment.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {filteredPayments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No payments found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
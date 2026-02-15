import { useEffect, useState } from 'react';
import { 
  DollarSign, Download, Wallet
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { commissionsApi } from '@/services/api';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

interface Commission {
  _id: string;
  userId: string;
  userName: string;
  paymentId: string;
  amount: number;
  percentage: number;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  createdAt: string;
  paidAt?: string;
}

export function CommissionTracking() {
  const { role } = useAuthStore();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchCommissions();
  }, [statusFilter]);

  const fetchCommissions = async () => {
    try {
      const response = await commissionsApi.getCommissions({ status: statusFilter });
      setCommissions(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load commissions');
    }
  };

  const handleApprove = async (commissionId: string) => {
    try {
      await commissionsApi.approveCommission(commissionId);
      fetchCommissions();
      toast.success('Commission approved');
    } catch (error) {
      toast.error('Failed to approve commission');
    }
  };

  const handlePay = async (commissionId: string) => {
    try {
      await commissionsApi.payCommission(commissionId);
      fetchCommissions();
      toast.success('Commission marked as paid');
    } catch (error) {
      toast.error('Failed to process payment');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-blue-100 text-blue-700',
      paid: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return <Badge className={variants[status] || ''}>{status}</Badge>;
  };

  const filteredCommissions = commissions.filter(commission => 
    commission.userName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: commissions.reduce((acc, c) => acc + c.amount, 0),
    pending: commissions.filter(c => c.status === 'pending').reduce((acc, c) => acc + c.amount, 0),
    approved: commissions.filter(c => c.status === 'approved').reduce((acc, c) => acc + c.amount, 0),
    paid: commissions.filter(c => c.status === 'paid').reduce((acc, c) => acc + c.amount, 0),
  };

  const isAdmin = role?.name === 'Owner' || role?.name === 'Manager';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Commission Tracking</h1>
          <p className="text-gray-500 mt-1">Track and manage sales commissions</p>
        </div>
        <Button variant="outline" onClick={() => {}}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Commissions</p>
                <p className="text-2xl font-bold">${stats.total.toLocaleString()}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
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
                <DollarSign className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-blue-600">${stats.approved.toLocaleString()}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Paid</p>
                <p className="text-2xl font-bold text-green-600">${stats.paid.toLocaleString()}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Wallet className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Input 
                placeholder="Search by team member..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Commission History</CardTitle>
          <CardDescription>View all commission transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team Member</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                {isAdmin && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCommissions.map((commission) => (
                <TableRow key={commission._id}>
                  <TableCell className="font-medium">{commission.userName}</TableCell>
                  <TableCell className="font-medium">${commission.amount.toLocaleString()}</TableCell>
                  <TableCell>{commission.percentage}%</TableCell>
                  <TableCell>{getStatusBadge(commission.status)}</TableCell>
                  <TableCell>{new Date(commission.createdAt).toLocaleDateString()}</TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {commission.status === 'pending' && (
                          <Button size="sm" onClick={() => handleApprove(commission._id)}>
                            Approve
                          </Button>
                        )}
                        {commission.status === 'approved' && (
                          <Button size="sm" variant="outline" onClick={() => handlePay(commission._id)}>
                            Mark Paid
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {filteredCommissions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-8">
                    <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No commissions found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {!isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>My Commission Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">${stats.total.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Total Earned</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">${stats.pending.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Pending</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">${stats.approved.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Approved</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">${stats.paid.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Paid</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { 
  Webhook, CheckCircle, XCircle, Clock, RefreshCw,
  Copy, ChevronDown, ChevronUp, Code
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { webhooksApi } from '@/services/api';
import { toast } from 'sonner';
import type { WebhookLog } from '@/types';

export function WebhookLogs() {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  useEffect(() => {
    fetchLogs();
  }, [sourceFilter, statusFilter]);

  const fetchLogs = async () => {
    try {
      const response = await webhooksApi.getLogs({ 
        source: sourceFilter, 
        status: statusFilter 
      });
      setLogs(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load webhook logs');
    }
  };

  const toggleRow = (logId: string) => {
    setExpandedRows(prev => 
      prev.includes(logId) 
        ? prev.filter(id => id !== logId)
        : [...prev, logId]
    );
  };

  const handleRetry = async (logId: string) => {
    try {
      await webhooksApi.retryWebhook(logId);
      fetchLogs();
      toast.success('Webhook retry initiated');
    } catch (error) {
      toast.error('Failed to retry webhook');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      success: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
      pending: 'bg-yellow-100 text-yellow-700',
    };
    return <Badge className={variants[status] || ''}>{status}</Badge>;
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'facebook': return '🔵';
      case 'instagram': return '📸';
      case 'google': return '🔴';
      case 'whatsapp': return '💬';
      case 'linkedin': return '💼';
      case 'email': return '📧';
      default: return '🌐';
    }
  };

  const filteredLogs = logs.filter(log => 
    log.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.source.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: logs.length,
    success: logs.filter(l => l.status === 'success').length,
    failed: logs.filter(l => l.status === 'failed').length,
    pending: logs.filter(l => l.status === 'pending').length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Webhook Logs</h1>
          <p className="text-gray-500 mt-1">Monitor incoming webhooks from lead sources</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchLogs}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Webhooks</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Webhook className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Successful</p>
                <p className="text-2xl font-bold text-green-600">{stats.success}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Failed</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Input 
              placeholder="Search webhooks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Sources</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="google">Google Ads</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Webhook History</CardTitle>
          <CardDescription>View all incoming webhook events</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Lead ID</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <Collapsible key={log._id} asChild>
                  <>
                    <TableRow 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleRow(log._id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{getSourceIcon(log.source)}</span>
                          <span className="capitalize">{log.source}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{log.event}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell>{log.leadId ? `#${log.leadId.slice(-8)}` : 'N/A'}</TableCell>
                      <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {log.status === 'failed' && (
                            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleRetry(log._id); }}>
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )}
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm">
                              {expandedRows.includes(log._id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                      </TableCell>
                    </TableRow>
                    <CollapsibleContent asChild>
                      <TableRow>
                        <TableCell colSpan={6} className="bg-gray-50">
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium">Payload</p>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => copyToClipboard(JSON.stringify(log.payload, null, 2))}
                              >
                                <Copy className="h-4 w-4 mr-1" />
                                Copy
                              </Button>
                            </div>
                            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                              {JSON.stringify(log.payload, null, 2)}
                            </pre>
                            {log.error && (
                              <div className="mt-4">
                                <p className="font-medium text-red-600 mb-2">Error</p>
                                <pre className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
                                  {log.error}
                                </pre>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    </CollapsibleContent>
                  </>
                </Collapsible>
              ))}
              {filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Webhook className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No webhook logs found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Webhook Endpoints</CardTitle>
          <CardDescription>Configure these URLs in your lead source platforms</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { source: 'Facebook', url: `${window.location.origin}/api/webhooks/facebook` },
            { source: 'Instagram', url: `${window.location.origin}/api/webhooks/instagram` },
            { source: 'Google Ads', url: `${window.location.origin}/api/webhooks/google` },
            { source: 'WhatsApp', url: `${window.location.origin}/api/webhooks/whatsapp` },
            { source: 'LinkedIn', url: `${window.location.origin}/api/webhooks/linkedin` },
          ].map((endpoint) => (
            <div key={endpoint.source} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Code className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">{endpoint.source}</p>
                  <code className="text-sm text-gray-500">{endpoint.url}</code>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(endpoint.url)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { 
  Send, MessageSquare, Mail, Smartphone, 
  Plus, Eye, Edit,
  CheckCircle, BarChart3, ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { communicationsApi, leadsApi, templatesApi } from '@/services/api';
import { toast } from 'sonner';
import type { Lead, Template } from '@/types';

interface Broadcast {
  _id: string;
  name: string;
  channel: 'whatsapp' | 'email' | 'sms';
  content: string;
  recipients: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
  scheduledAt?: string;
  createdAt: string;
}

export function BroadcastPage() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [_loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  const [newBroadcast, setNewBroadcast] = useState({
    name: '',
    channel: 'whatsapp' as const,
    content: '',
    templateId: '',
    scheduledAt: '',
  });

  const [filters, setFilters] = useState({
    status: '',
    source: '',
    tags: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [broadcastsRes, templatesRes, leadsRes] = await Promise.all([
        communicationsApi.getBroadcasts(),
        templatesApi.getTemplates(),
        leadsApi.getLeads(),
      ]);
      setBroadcasts(broadcastsRes.data.data || []);
      setTemplates(templatesRes.data.data || []);
      setLeads(leadsRes.data.data?.leads || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBroadcast = async () => {
    if (!newBroadcast.name || !newBroadcast.content || selectedLeads.length === 0) {
      toast.error('Please fill all required fields and select recipients');
      return;
    }

    try {
      await communicationsApi.createBroadcast({
        ...newBroadcast,
        recipientIds: selectedLeads,
      });
      setShowCreateDialog(false);
      setNewBroadcast({
        name: '',
        channel: 'whatsapp',
        content: '',
        templateId: '',
        scheduledAt: '',
      });
      setSelectedLeads([]);
      fetchData();
      toast.success('Broadcast created successfully');
    } catch (error) {
      toast.error('Failed to create broadcast');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedLeads(leads.map(l => l._id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    if (checked) {
      setSelectedLeads([...selectedLeads, leadId]);
    } else {
      setSelectedLeads(selectedLeads.filter(id => id !== leadId));
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      scheduled: 'bg-blue-100 text-blue-700',
      sending: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
    };
    return <Badge className={variants[status] || ''}>{status}</Badge>;
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <Smartphone className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (filters.status && lead.status !== filters.status) return false;
    if (filters.source && lead.source !== filters.source) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Broadcast Messaging</h1>
          <p className="text-gray-500 mt-1">Send bulk messages to your leads</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Broadcast
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Broadcast</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Broadcast Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Broadcast Name</Label>
                    <Input 
                      value={newBroadcast.name}
                      onChange={(e) => setNewBroadcast({ ...newBroadcast, name: e.target.value })}
                      placeholder="e.g., Summer Sale Announcement"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Channel</Label>
                    <Select 
                      value={newBroadcast.channel} 
                      onValueChange={(value: any) => setNewBroadcast({ ...newBroadcast, channel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Template (Optional)</Label>
                  <Select 
                    value={newBroadcast.templateId} 
                    onValueChange={(value) => {
                      const template = templates.find(t => t._id === value);
                      setNewBroadcast({ 
                        ...newBroadcast, 
                        templateId: value,
                        content: template?.content.body || newBroadcast.content
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template._id} value={template._id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Message Content</Label>
                  <Textarea 
                    value={newBroadcast.content}
                    onChange={(e) => setNewBroadcast({ ...newBroadcast, content: e.target.value })}
                    placeholder="Enter your message..."
                    rows={4}
                  />
                  <p className="text-sm text-gray-500">
                    {newBroadcast.content.length} characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Schedule (Optional)</Label>
                  <Input 
                    type="datetime-local"
                    value={newBroadcast.scheduledAt}
                    onChange={(e) => setNewBroadcast({ ...newBroadcast, scheduledAt: e.target.value })}
                  />
                </div>
              </div>

              {/* Recipients Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">Select Recipients</Label>
                  <Badge>{selectedLeads.length} selected</Badge>
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                  <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="proposal">Proposal</SelectItem>
                      <SelectItem value="won">Won</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filters.source} onValueChange={(value) => setFilters({ ...filters, source: value })}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Sources</SelectItem>
                      <SelectItem value="facebook_ad">Facebook</SelectItem>
                      <SelectItem value="instagram_ad">Instagram</SelectItem>
                      <SelectItem value="google_ad">Google Ads</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="website">Website</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Leads List */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                      <Checkbox 
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                      />
                      <Label className="font-medium">Select All</Label>
                    </div>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-2">
                        {filteredLeads.map((lead) => (
                          <div key={lead._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                            <Checkbox 
                              checked={selectedLeads.includes(lead._id)}
                              onCheckedChange={(checked) => handleSelectLead(lead._id, checked as boolean)}
                            />
                            <div className="flex-1">
                              <p className="font-medium">{lead.name}</p>
                              <p className="text-sm text-gray-500">{lead.phone}</p>
                            </div>
                            <Badge variant="outline">{lead.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              <Button onClick={handleCreateBroadcast} className="w-full" disabled={selectedLeads.length === 0}>
                <Send className="mr-2 h-4 w-4" />
                {newBroadcast.scheduledAt ? 'Schedule Broadcast' : 'Send Broadcast'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Send className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{broadcasts.length}</p>
                <p className="text-sm text-gray-500">Total Broadcasts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {broadcasts.reduce((acc, b) => acc + b.delivered, 0)}
                </p>
                <p className="text-sm text-gray-500">Delivered</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Eye className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {broadcasts.reduce((acc, b) => acc + b.read, 0)}
                </p>
                <p className="text-sm text-gray-500">Read</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-3 rounded-lg">
                <BarChart3 className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {broadcasts.length > 0 
                    ? Math.round((broadcasts.reduce((acc, b) => acc + b.read, 0) / broadcasts.reduce((acc, b) => acc + b.sent, 0)) * 100) 
                    : 0}%
                </p>
                <p className="text-sm text-gray-500">Avg. Open Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Broadcasts List */}
      <Card>
        <CardHeader>
          <CardTitle>Broadcast History</CardTitle>
          <CardDescription>View and manage your broadcast campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {broadcasts.map((broadcast) => (
              <Collapsible key={broadcast._id}>
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      {getChannelIcon(broadcast.channel)}
                    </div>
                    <div>
                      <p className="font-medium">{broadcast.name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{new Date(broadcast.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{broadcast.recipients} recipients</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(broadcast.status)}
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
                <CollapsibleContent>
                  <div className="p-4 bg-gray-50 border-x border-b rounded-b-lg">
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{broadcast.sent}</p>
                        <p className="text-sm text-gray-500">Sent</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{broadcast.delivered}</p>
                        <p className="text-sm text-gray-500">Delivered</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{broadcast.read}</p>
                        <p className="text-sm text-gray-500">Read</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{broadcast.failed}</p>
                        <p className="text-sm text-gray-500">Failed</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        View Report
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Duplicate
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
            {broadcasts.length === 0 && (
              <div className="text-center py-12">
                <Send className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No broadcasts yet</p>
                <p className="text-sm text-gray-400">Create your first broadcast to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

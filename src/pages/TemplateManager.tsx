import { useEffect, useState } from 'react';
import { 
  FileText, Plus, Trash2, Copy, Eye,
  MessageSquare, Mail, Smartphone, Send
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { templatesApi } from '@/services/api';
import { toast } from 'sonner';
import type { Template } from '@/types';

export function TemplateManager() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewData, setPreviewData] = useState({
    customerName: 'John Doe',
    businessName: 'Your Business',
    date: new Date().toLocaleDateString(),
  });

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: 'whatsapp' as 'whatsapp' | 'email' | 'sms',
    type: 'text' as const,
    content: {
      subject: '',
      body: '',
      htmlBody: '',
      variables: [] as string[],
    },
    language: 'en',
  });

  useEffect(() => {
    fetchTemplates();
  }, [categoryFilter]);

  const fetchTemplates = async () => {
    try {
      const response = await templatesApi.getTemplates({ category: categoryFilter });
      setTemplates(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load templates');
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name || !newTemplate.content.body) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await templatesApi.createTemplate(newTemplate);
      setShowCreateDialog(false);
      setNewTemplate({
        name: '',
        description: '',
        category: 'whatsapp' as 'whatsapp' | 'email' | 'sms',
        type: 'text',
        content: {
          subject: '',
          body: '',
          htmlBody: '',
          variables: [],
        },
        language: 'en',
      });
      fetchTemplates();
      toast.success('Template created successfully');
    } catch (error) {
      toast.error('Failed to create template');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await templatesApi.deleteTemplate(templateId);
      fetchTemplates();
      toast.success('Template deleted');
    } catch (error) {
      toast.error('Failed to delete template');
    }
  };

  const handleDuplicateTemplate = async (template: Template) => {
    try {
      await templatesApi.createTemplate({
        ...template,
        name: `${template.name} (Copy)`,
      });
      fetchTemplates();
      toast.success('Template duplicated');
    } catch (error) {
      toast.error('Failed to duplicate template');
    }
  };

  const extractVariables = (text: string) => {
    const matches = text.match(/\{\{(\w+)\}\}/g);
    return matches ? matches.map(m => m.replace(/\{\{|\}\}/g, '')) : [];
  };

  const renderPreview = (template: Template) => {
    let content = template.content.body;
    Object.entries(previewData).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return content;
  };

  const getCategoryBadge = (category: string) => {
    const variants: Record<string, string> = {
      whatsapp: 'bg-green-100 text-green-700',
      email: 'bg-blue-100 text-blue-700',
      sms: 'bg-purple-100 text-purple-700',
      all: 'bg-gray-100 text-gray-700',
    };
    return <Badge className={variants[category] || ''}>{category}</Badge>;
  };

  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: templates.length,
    whatsapp: templates.filter(t => t.category === 'whatsapp').length,
    email: templates.filter(t => t.category === 'email').length,
    sms: templates.filter(t => t.category === 'sms').length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Template Manager</h1>
          <p className="text-gray-500 mt-1">Create and manage message templates</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input 
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    placeholder="e.g., Welcome Message"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select 
                    value={newTemplate.category} 
                    onValueChange={(value: any) => setNewTemplate({ ...newTemplate, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="all">All Channels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input 
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  placeholder="Brief description of this template"
                />
              </div>

              {newTemplate.category === 'email' && (
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input 
                    value={newTemplate.content.subject}
                    onChange={(e) => setNewTemplate({ 
                      ...newTemplate, 
                      content: { ...newTemplate.content, subject: e.target.value }
                    })}
                    placeholder="Email subject line"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Message Body</Label>
                <Textarea 
                  value={newTemplate.content.body}
                  onChange={(e) => {
                    const body = e.target.value;
                    const variables = extractVariables(body);
                    setNewTemplate({ 
                      ...newTemplate, 
                      content: { ...newTemplate.content, body, variables }
                    });
                  }}
                  placeholder="Enter your message template. Use {{variableName}} for dynamic content."
                  rows={6}
                />
                <p className="text-sm text-gray-500">
                  Use {'{{variableName}}'} for dynamic content
                </p>
              </div>

              {newTemplate.content.variables.length > 0 && (
                <div className="space-y-2">
                  <Label>Detected Variables</Label>
                  <div className="flex flex-wrap gap-2">
                    {newTemplate.content.variables.map((variable, index) => (
                      <Badge key={index} variant="secondary">{variable}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={handleCreateTemplate} className="w-full">
                Create Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Templates</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">WhatsApp</p>
                <p className="text-2xl font-bold text-green-600">{stats.whatsapp}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-2xl font-bold text-blue-600">{stats.email}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">SMS</p>
                <p className="text-2xl font-bold text-purple-600">{stats.sms}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Smartphone className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Input 
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Templates</CardTitle>
          <CardDescription>Manage your message templates</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Variables</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.map((template) => (
                <TableRow key={template._id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>{getCategoryBadge(template.category)}</TableCell>
                  <TableCell className="max-w-xs truncate">{template.description}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {template.content.variables?.slice(0, 3).map((variable, index) => (
                        <Badge key={index} variant="outline" className="text-xs">{variable}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedTemplate(template); setShowPreviewDialog(true); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDuplicateTemplate(template)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteTemplate(template._id)} className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredTemplates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No templates found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Template Preview - {selectedTemplate?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Preview Data</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input 
                  value={previewData.customerName}
                  onChange={(e) => setPreviewData({ ...previewData, customerName: e.target.value })}
                  placeholder="Customer Name"
                />
                <Input 
                  value={previewData.businessName}
                  onChange={(e) => setPreviewData({ ...previewData, businessName: e.target.value })}
                  placeholder="Business Name"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                {selectedTemplate && renderPreview(selectedTemplate)}
              </div>
            </div>

            <Button className="w-full" onClick={() => {}}>
              <Send className="mr-2 h-4 w-4" />
              Use Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

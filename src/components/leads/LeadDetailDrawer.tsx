import { useState, useEffect } from 'react';
import { 
  Phone, Mail, MessageSquare, Calendar, 
  User, Briefcase, Tag, 
  Trash2, CheckCircle, MoreHorizontal,
  Send, Paperclip, History
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { leadsApi, tasksApi, communicationsApi } from '@/services/api';
import { toast } from 'sonner';
import type { Lead, Activity, Task } from '@/types';

interface LeadDetailDrawerProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
  teamMembers: any[];
}

const statusOptions = [
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-700' },
  { value: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'qualified', label: 'Qualified', color: 'bg-purple-100 text-purple-700' },
  { value: 'proposal', label: 'Proposal', color: 'bg-orange-100 text-orange-700' },
  { value: 'negotiation', label: 'Negotiation', color: 'bg-pink-100 text-pink-700' },
  { value: 'won', label: 'Won', color: 'bg-green-100 text-green-700' },
  { value: 'lost', label: 'Lost', color: 'bg-red-100 text-red-700' },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export function LeadDetailDrawer({ lead, open, onClose, onUpdate, teamMembers }: LeadDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [editedLead, setEditedLead] = useState<Partial<Lead>>({});
  const [activities, setActivities] = useState<Activity[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    priority: 'medium' as const,
  });

  useEffect(() => {
    if (lead) {
      setEditedLead(lead);
      fetchLeadData();
    }
  }, [lead]);

  const fetchLeadData = async () => {
    if (!lead?._id) return;
    try {
      const [activitiesRes, tasksRes, messagesRes] = await Promise.all([
        leadsApi.getActivities(lead._id),
        tasksApi.getTasks({ leadId: lead._id }),
        communicationsApi.getMessages(lead._id),
      ]);
      setActivities(activitiesRes.data.data || []);
      setTasks(tasksRes.data.data || []);
      setMessages(messagesRes.data.data || []);
    } catch (error) {
      console.error('Error fetching lead data:', error);
    }
  };

  const handleUpdateLead = async (updates: Partial<Lead>) => {
    if (!lead?._id) return;
    try {
      await leadsApi.updateLead(lead._id, updates);
      setEditedLead({ ...editedLead, ...updates });
      toast.success('Lead updated successfully');
      onUpdate();
    } catch (error) {
      toast.error('Failed to update lead');
    }
  };

  const handleAddNote = async () => {
    if (!lead?._id || !newNote.trim()) return;
    try {
      await leadsApi.addActivity(lead._id, {
        type: 'note',
        description: newNote,
      });
      setNewNote('');
      fetchLeadData();
      toast.success('Note added');
    } catch (error) {
      toast.error('Failed to add note');
    }
  };

  const handleSendMessage = async () => {
    if (!lead?._id || !newMessage.trim()) return;
    try {
      await communicationsApi.sendMessage({
        leadId: lead._id,
        channel: 'whatsapp',
        content: { text: newMessage },
      });
      setNewMessage('');
      fetchLeadData();
      toast.success('Message sent');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleCreateTask = async () => {
    if (!lead?._id) return;
    try {
      await tasksApi.createTask({
        ...newTask,
        leadId: lead._id,
      });
      setShowTaskDialog(false);
      setNewTask({
        title: '',
        description: '',
        assignedTo: '',
        dueDate: '',
        priority: 'medium',
      });
      fetchLeadData();
      toast.success('Task created');
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find(s => s.value === status);
    return option ? <Badge className={option.color}>{option.label}</Badge> : <Badge>{status}</Badge>;
  };

  if (!lead) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                  {lead.name?.[0] || 'L'}
                </AvatarFallback>
              </Avatar>
              <div>
                <SheetTitle className="text-2xl">{lead.name}</SheetTitle>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(lead.status)}
                  <Badge variant="outline">{lead.source}</Badge>
                  <Badge variant="outline" className="capitalize">{lead.priority}</Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Mail className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowTaskDialog(true)}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Create Task
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Lead
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Phone className="mr-2 h-4 w-4" />
              Call
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Mail className="mr-2 h-4 w-4" />
              Email
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <MessageSquare className="mr-2 h-4 w-4" />
              WhatsApp
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule
            </Button>
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-500">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <Input 
                      value={editedLead.email || ''} 
                      onChange={(e) => setEditedLead({ ...editedLead, email: e.target.value })}
                      onBlur={() => handleUpdateLead({ email: editedLead.email })}
                      placeholder="No email"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-500">Phone</label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <Input 
                      value={editedLead.phone || ''} 
                      onChange={(e) => setEditedLead({ ...editedLead, phone: e.target.value })}
                      onBlur={() => handleUpdateLead({ phone: editedLead.phone })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-500">Company</label>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <Input 
                      value={editedLead.company || ''} 
                      onChange={(e) => setEditedLead({ ...editedLead, company: e.target.value })}
                      onBlur={() => handleUpdateLead({ company: editedLead.company })}
                      placeholder="No company"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-500">Job Title</label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <Input 
                      value={editedLead.jobTitle || ''} 
                      onChange={(e) => setEditedLead({ ...editedLead, jobTitle: e.target.value })}
                      onBlur={() => handleUpdateLead({ jobTitle: editedLead.jobTitle })}
                      placeholder="No job title"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold">Status & Assignment</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-500">Status</label>
                  <Select 
                    value={editedLead.status} 
                    onValueChange={(value) => handleUpdateLead({ status: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-500">Priority</label>
                  <Select 
                    value={editedLead.priority} 
                    onValueChange={(value) => handleUpdateLead({ priority: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-500">Assigned To</label>
                  <Select 
                    value={typeof editedLead.assignedTo === 'object' ? editedLead.assignedTo?._id : editedLead.assignedTo || ''} 
                    onValueChange={(value) => handleUpdateLead({ assignedTo: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {teamMembers.map((member) => (
                        <SelectItem key={member._id} value={member._id}>
                          {member.firstName} {member.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-500">Next Follow-up</label>
                  <Input 
                    type="datetime-local"
                    value={editedLead.nextFollowUpAt ? new Date(editedLead.nextFollowUpAt).toISOString().slice(0, 16) : ''}
                    onChange={(e) => handleUpdateLead({ nextFollowUpAt: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {lead.tags?.map((tag, index) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))}
                <Button variant="outline" size="sm">
                  <Tag className="mr-1 h-3 w-3" />
                  Add Tag
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold">Notes</h3>
              <Textarea 
                value={editedLead.notes || ''}
                onChange={(e) => setEditedLead({ ...editedLead, notes: e.target.value })}
                onBlur={() => handleUpdateLead({ notes: editedLead.notes })}
                placeholder="Add notes about this lead..."
                rows={4}
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Lead Score</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Progress value={lead.score} className="h-3" />
                </div>
                <span className="text-2xl font-bold">{lead.score}/100</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <div className="flex gap-2">
              <Textarea 
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                rows={2}
              />
              <Button onClick={handleAddNote} className="self-end">
                <Send className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="bg-blue-100 p-2 rounded-lg h-fit">
                      <History className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium capitalize">{activity.type}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(activity.performedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                {activities.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No activity yet</p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`flex gap-4 ${message.sender.type === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {message.sender.type === 'user' ? 'ME' : lead.name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div 
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.sender.type === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100'
                      }`}
                    >
                      <p className="text-sm">{message.content.text}</p>
                      <p className={`text-xs mt-1 ${message.sender.type === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {messages.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No messages yet</p>
                )}
              </div>
            </ScrollArea>

            <div className="flex gap-2">
              <Input 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button variant="outline" size="icon">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <Button onClick={() => setShowTaskDialog(true)} className="w-full">
              <Calendar className="mr-2 h-4 w-4" />
              Create New Task
            </Button>

            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className={`h-5 w-5 ${task.status === 'completed' ? 'text-green-500' : 'text-gray-300'}`} />
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-gray-500">
                        Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                      </p>
                    </div>
                  </div>
                  <Badge className="capitalize">{task.status}</Badge>
                </div>
              ))}
              {tasks.length === 0 && (
                <p className="text-center text-gray-500 py-8">No tasks assigned</p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input 
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Task title"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Task description"
                />
              </div>
              <div className="space-y-2">
                <Label>Assign To</Label>
                <Select 
                  value={newTask.assignedTo} 
                  onValueChange={(value) => setNewTask({ ...newTask, assignedTo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((member) => (
                      <SelectItem key={member._id} value={member._id}>
                        {member.firstName} {member.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input 
                  type="datetime-local"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select 
                  value={newTask.priority} 
                  onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateTask} className="w-full">
                Create Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  );
}

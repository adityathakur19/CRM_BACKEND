import { useEffect, useState, useRef } from 'react';
import { 
  Search, Send, Paperclip, Phone, Video, 
  CheckCheck
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/store/authStore';
import { communicationsApi, leadsApi } from '@/services/api';
import { toast } from 'sonner';
import type { Conversation, Message, Lead } from '@/types';


export function CommunicationPage() {
  useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [selectedLead, setSelectedLead] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
    fetchLeads();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await communicationsApi.getConversations();
      setConversations(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load conversations');
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await communicationsApi.getMessagesByConversation(conversationId);
      setMessages(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const fetchLeads = async () => {
    try {
      const response = await leadsApi.getLeads();
      setLeads(response.data.data?.leads || []);
    } catch (error) {
      console.error('Failed to load leads');
    }
  };

  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;

    try {
      await communicationsApi.sendMessage({
        conversationId: selectedConversation._id,
        leadId: selectedConversation.leadId._id,
        channel: selectedConversation.channel,
        content: { text: newMessage },
      });
      setNewMessage('');
      fetchMessages(selectedConversation._id);
      toast.success('Message sent');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleStartNewChat = async () => {
    if (!selectedLead) return;

    try {
      const lead = leads.find(l => l._id === selectedLead);
      if (!lead) return;

      const response = await communicationsApi.createConversation({
        leadId: lead._id,
        channel: 'whatsapp',
      });

      setShowNewChatDialog(false);
      setSelectedLead('');
      fetchConversations();
      setSelectedConversation(response.data.data);
      toast.success('Conversation started');
    } catch (error) {
      toast.error('Failed to start conversation');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return '💬';
      case 'email': return '📧';
      case 'sms': return '💬';
      default: return '💬';
    }
  };

  const filteredConversations = conversations.filter(conv => 
    conv.leadId.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      <Card className="w-80 flex flex-col rounded-none border-r">
        <CardContent className="p-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Messages</h2>
            <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
              <DialogTrigger asChild>
                <Button size="icon" variant="outline">
                  <span className="text-lg">+</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start New Conversation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Select value={selectedLead} onValueChange={setSelectedLead}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a lead" />
                    </SelectTrigger>
                    <SelectContent>
                      {leads.map((lead) => (
                        <SelectItem key={lead._id} value={lead._id}>
                          {lead.name} - {lead.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleStartNewChat} className="w-full">
                    Start Chat
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs defaultValue="all" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="flex-1 m-0">
              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="space-y-2">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation._id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedConversation?._id === conversation._id 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {conversation.leadId.name?.[0] || 'L'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="absolute -bottom-1 -right-1 text-sm">
                            {getChannelIcon(conversation.channel)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{conversation.leadId.name}</p>
                            {conversation.unreadCount.user > 0 && (
                              <Badge className="bg-blue-500">{conversation.unreadCount.user}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.lastMessage?.content || 'No messages yet'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {conversation.lastActivityAt && 
                              new Date(conversation.lastActivityAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredConversations.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No conversations found</p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {selectedConversation.leadId.name?.[0] || 'L'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedConversation.leadId.name}</p>
                  <p className="text-sm text-gray-500">
                    {selectedConversation.leadId.phone}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4 bg-gray-50">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div 
                    key={index}
                    className={`flex ${message.sender.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[70%] ${
                        message.sender.type === 'user' ? 'flex-row-reverse' : ''
                      } flex gap-3`}
                    >
                      {message.sender.type !== 'user' && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {selectedConversation.leadId.name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <div 
                          className={`p-3 rounded-lg ${
                            message.sender.type === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-white border'
                          }`}
                        >
                          <p className="text-sm">{message.content.text}</p>
                        </div>
                        <div 
                          className={`flex items-center gap-1 mt-1 text-xs ${
                            message.sender.type === 'user' ? 'justify-end' : ''
                          }`}
                        >
                          <span className="text-gray-400">
                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {message.sender.type === 'user' && (
                            <CheckCheck className={`h-3 w-3 ${message.status === 'read' ? 'text-blue-500' : 'text-gray-400'}`} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t bg-white">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="bg-blue-100 p-6 rounded-full inline-block mb-4">
                <span className="text-4xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

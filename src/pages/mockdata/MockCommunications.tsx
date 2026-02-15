import { useState } from 'react';
import { 
  Send, RefreshCw, Code, Copy, Database,
  MessageSquare, CheckCircle, Phone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { communicationsApi } from '@/services/api';

const SAMPLE_WHATSAPP_MESSAGE = {
  leadId: "lead_123456",
  channel: "whatsapp",
  content: {
    text: "Hello! Thank you for your interest in our services. How can I help you today?"
  }
};

const SAMPLE_EMAIL_MESSAGE = {
  leadId: "lead_123456",
  channel: "email",
  content: {
    subject: "Follow-up on your inquiry",
    body: "Dear Customer,\n\nThank you for reaching out to us. We wanted to follow up on your recent inquiry...",
    html: "<p>Dear Customer,</p><p>Thank you for reaching out...</p>"
  }
};

const SAMPLE_SMS_MESSAGE = {
  leadId: "lead_123456",
  channel: "sms",
  content: {
    text: "Your appointment is confirmed for tomorrow at 2 PM. Reply YES to confirm or call to reschedule."
  }
};

export function MockCommunications() {
  const [activeTab, setActiveTab] = useState('whatsapp');
  const [whatsappPayload, setWhatsappPayload] = useState(JSON.stringify(SAMPLE_WHATSAPP_MESSAGE, null, 2));
  const [emailPayload, setEmailPayload] = useState(JSON.stringify(SAMPLE_EMAIL_MESSAGE, null, 2));
  const [smsPayload, setSmsPayload] = useState(JSON.stringify(SAMPLE_SMS_MESSAGE, null, 2));
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const getCurrentPayload = () => {
    switch (activeTab) {
      case 'whatsapp': return whatsappPayload;
      case 'email': return emailPayload;
      case 'sms': return smsPayload;
      default: return whatsappPayload;
    }
  };

  const setCurrentPayload = (value: string) => {
    switch (activeTab) {
      case 'whatsapp': setWhatsappPayload(value); break;
      case 'email': setEmailPayload(value); break;
      case 'sms': setSmsPayload(value); break;
    }
  };

  const handleSend = async () => {
    try {
      setLoading(true);
      const data = JSON.parse(getCurrentPayload());
      const res = await communicationsApi.sendMessage(data);
      setResponse(JSON.stringify(res.data, null, 2));
      toast.success('Message sent successfully');
    } catch (error: any) {
      setResponse(JSON.stringify(error.response?.data || { error: error.message }, null, 2));
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const resetPayload = () => {
    switch (activeTab) {
      case 'whatsapp': setWhatsappPayload(JSON.stringify(SAMPLE_WHATSAPP_MESSAGE, null, 2)); break;
      case 'email': setEmailPayload(JSON.stringify(SAMPLE_EMAIL_MESSAGE, null, 2)); break;
      case 'sms': setSmsPayload(JSON.stringify(SAMPLE_SMS_MESSAGE, null, 2)); break;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-purple-500 p-3 rounded-lg">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Mock Communications</h1>
            <p className="text-gray-500 mt-1">Test messaging across different channels</p>
          </div>
        </div>
        <Badge variant="outline" className="text-purple-600 bg-purple-50">Communication Test</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="whatsapp">
            <MessageSquare className="mr-2 h-4 w-4" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="email">
            <MessageSquare className="mr-2 h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="sms">
            <Phone className="mr-2 h-4 w-4" />
            SMS
          </TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Panel */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Message Payload
                  </CardTitle>
                  <CardDescription>
                    {activeTab === 'whatsapp' && 'WhatsApp message payload'}
                    {activeTab === 'email' && 'Email message payload'}
                    {activeTab === 'sms' && 'SMS message payload'}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={resetPayload}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(getCurrentPayload())}>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea 
                value={getCurrentPayload()}
                onChange={(e) => setCurrentPayload(e.target.value)}
                className="font-mono text-sm min-h-[400px]"
              />
              <Button 
                onClick={handleSend} 
                disabled={loading}
                className="w-full mt-4"
              >
                {loading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Send Message
              </Button>
            </CardContent>
          </Card>

          {/* Response Panel */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Response
                  </CardTitle>
                  <CardDescription>Message sending result</CardDescription>
                </div>
                {response && (
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(response)}>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 rounded-lg p-4 min-h-[400px] overflow-auto">
                {response ? (
                  <pre className="text-green-400 font-mono text-sm">{response}</pre>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p>Send a message to see the response</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </Tabs>

      {/* Quick Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Templates</CardTitle>
          <CardDescription>Common message templates for testing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline"
              onClick={() => {
                setActiveTab('whatsapp');
                setWhatsappPayload(JSON.stringify({
                  leadId: "lead_123456",
                  channel: "whatsapp",
                  content: {
                    text: "Hello {{customerName}}! 👋\n\nThank you for your interest in our {{productName}}. I'd love to schedule a quick call to discuss how we can help {{companyName}} achieve its goals.\n\nAre you available this week for a 15-minute chat?"
                  }
                }, null, 2));
              }}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Follow-up Message
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setActiveTab('email');
                setEmailPayload(JSON.stringify({
                  leadId: "lead_123456",
                  channel: "email",
                  content: {
                    subject: "Your {{productName}} Demo is Scheduled",
                    body: "Hi {{customerName}},\n\nYour demo for {{productName}} is confirmed for {{date}} at {{time}}.\n\nOur team will walk you through the key features and answer any questions you may have.\n\nLooking forward to speaking with you!\n\nBest regards,\nThe Sales Team",
                    html: "<p>Hi {{customerName}},</p><p>Your demo is confirmed...</p>"
                  }
                }, null, 2));
              }}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Demo Confirmation
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setActiveTab('sms');
                setSmsPayload(JSON.stringify({
                  leadId: "lead_123456",
                  channel: "sms",
                  content: {
                    text: "Hi {{customerName}}, this is {{agentName}} from {{companyName}}. Your appointment is scheduled for {{date}} at {{time}}. Reply CONFIRM to verify or CALL to reschedule."
                  }
                }, null, 2));
              }}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Appointment Reminder
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

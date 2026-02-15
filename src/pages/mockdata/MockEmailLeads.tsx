import { useState } from 'react';
import { 
  RefreshCw, Code, Copy, Database, Play,
  Mail, CheckCircle, XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { webhooksApi } from '@/services/api';

const SAMPLE_EMAIL_PAYLOAD = {
  "messageId": "msg_123456789",
  "threadId": "thread_987654321",
  "from": {
    "name": "Jessica Williams",
    "email": "jessica.williams@prospect.com"
  },
  "to": [{
    "name": "Sales Team",
    "email": "sales@yourcompany.com"
  }],
  "subject": "Interested in your enterprise solution",
  "body": {
    "text": "Hi there,\n\nI came across your website and I'm very interested in learning more about your enterprise solution. We are a growing company of about 150 employees looking to streamline our operations.\n\nCould we schedule a demo sometime this week? I'm available Tuesday or Thursday afternoon.\n\nBest regards,\nJessica Williams\nOperations Director\nGrowthTech Solutions",
    "html": "<p>Hi there,</p><p>I came across your website and I'm very interested in learning more about your enterprise solution...</p>"
  },
  "receivedAt": new Date().toISOString(),
  "attachments": [],
  "headers": {
    "x-priority": "1",
    "x-mailer": "Outlook"
  },
  "source": "email_forwarding"
};

export function MockEmailLeads() {
  const [payload, setPayload] = useState(JSON.stringify(SAMPLE_EMAIL_PAYLOAD, null, 2));
  const [webhookUrl, setWebhookUrl] = useState(`${window.location.origin}/api/webhooks/email`);
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    try {
      setLoading(true);
      const data = JSON.parse(payload);
      const res = await webhooksApi.simulateWebhook('email', data);
      setResponse(JSON.stringify(res.data, null, 2));
      toast.success('Email webhook simulated');
    } catch (error: any) {
      setResponse(JSON.stringify(error.response?.data || { error: error.message }, null, 2));
      toast.error('Failed to simulate webhook');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const resetPayload = () => {
    setPayload(JSON.stringify(SAMPLE_EMAIL_PAYLOAD, null, 2));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-gray-600 p-3 rounded-lg">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Mock Email Leads</h1>
            <p className="text-gray-500 mt-1">Test email forwarding and parsing webhooks</p>
          </div>
        </div>
        <Badge variant="outline" className="text-gray-600 bg-gray-50">Email Test</Badge>
      </div>

      {/* Webhook URL */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Configuration</CardTitle>
          <CardDescription>Configure your email webhook URL</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Webhook URL</Label>
            <div className="flex gap-2">
              <Input 
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="Enter webhook URL"
              />
              <Button variant="outline" onClick={() => copyToClipboard(webhookUrl)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Configure this webhook in your email forwarding service (e.g., Zapier, Mailgun)
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Email Payload
                </CardTitle>
                <CardDescription>Parsed email webhook payload</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={resetPayload}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(payload)}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea 
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
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
                <Play className="mr-2 h-4 w-4" />
              )}
              Simulate Webhook
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
                <CardDescription>Webhook processing result</CardDescription>
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
                  <p>Send a webhook to see the response</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle>Test Scenarios</CardTitle>
          <CardDescription>Common email lead scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline"
              onClick={() => setPayload(JSON.stringify({
                ...SAMPLE_EMAIL_PAYLOAD,
                from: {
                  name: "Robert Taylor",
                  email: "robert.taylor@enterprise.com"
                },
                subject: "Urgent: Enterprise License Quote Needed",
                body: {
                  text: "Hi Sales Team,\n\nWe need an urgent quote for 500 enterprise licenses. Please contact me ASAP.\n\nRobert Taylor\nVP Procurement\nEnterprise Solutions Inc",
                  html: "<p>Hi Sales Team,</p><p>We need an urgent quote for 500 enterprise licenses...</p>"
                },
                headers: {
                  "x-priority": "1",
                  "importance": "high"
                }
              }, null, 2))}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Urgent Enterprise Inquiry
            </Button>
            <Button 
              variant="outline"
              onClick={() => setPayload(JSON.stringify({
                ...SAMPLE_EMAIL_PAYLOAD,
                from: {
                  name: "Maria Garcia",
                  email: "maria.garcia@consulting.com"
                },
                subject: "Partnership Opportunity",
                body: {
                  text: "Hello,\n\nI'm reaching out regarding a potential partnership between our companies. I'd love to discuss how we can collaborate.\n\nMaria Garcia\nBusiness Development\nConsulting Partners LLC",
                  html: "<p>Hello,</p><p>I'm reaching out regarding a potential partnership...</p>"
                }
              }, null, 2))}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Partnership Inquiry
            </Button>
            <Button 
              variant="outline"
              onClick={() => setPayload(JSON.stringify({
                ...SAMPLE_EMAIL_PAYLOAD,
                from: {
                  name: "Spam Bot",
                  email: "noreply@spam.com"
                },
                subject: "GET RICH QUICK!!!",
                body: {
                  text: "Congratulations! You've won $1,000,000! Click here to claim...",
                  html: "<p>Congratulations! You've won...</p>"
                }
              }, null, 2))}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Spam Email
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

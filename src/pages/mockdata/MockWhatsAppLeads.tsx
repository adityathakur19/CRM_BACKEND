import { useState } from 'react';
import { 
  RefreshCw, Code, Copy, Database, Play,
  MessageCircle, CheckCircle, XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { webhooksApi } from '@/services/api';

const SAMPLE_WHATSAPP_PAYLOAD = {
  object: "whatsapp_business_account",
  entry: [{
    id: "whatsapp_business_account_id",
    changes: [{
      value: {
        messaging_product: "whatsapp",
        metadata: {
          display_phone_number: "1234567890",
          phone_number_id: "phone_number_id"
        },
        contacts: [{
          profile: {
            name: "John Doe"
          },
          wa_id: "9876543210"
        }],
        messages: [{
          from: "9876543210",
          id: "message_id",
          timestamp: Math.floor(Date.now() / 1000).toString(),
          text: {
            body: "Hello, I'm interested in your services. Can you provide more information?"
          },
          type: "text"
        }]
      },
      field: "messages"
    }]
  }]
};

export function MockWhatsAppLeads() {
  const [payload, setPayload] = useState(JSON.stringify(SAMPLE_WHATSAPP_PAYLOAD, null, 2));
  const [webhookUrl, setWebhookUrl] = useState(`${window.location.origin}/api/webhooks/whatsapp`);
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    try {
      setLoading(true);
      const data = JSON.parse(payload);
      const res = await webhooksApi.simulateWebhook('whatsapp', data);
      setResponse(JSON.stringify(res.data, null, 2));
      toast.success('WhatsApp webhook simulated');
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
    setPayload(JSON.stringify(SAMPLE_WHATSAPP_PAYLOAD, null, 2));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-green-500 p-3 rounded-lg">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Mock WhatsApp Leads</h1>
            <p className="text-gray-500 mt-1">Test WhatsApp Business webhooks</p>
          </div>
        </div>
        <Badge variant="outline" className="text-green-600 bg-green-50">WhatsApp Test</Badge>
      </div>

      {/* Webhook URL */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Configuration</CardTitle>
          <CardDescription>Configure your WhatsApp webhook URL</CardDescription>
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
              Configure this URL in your WhatsApp Business API settings
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
                  WhatsApp Payload
                </CardTitle>
                <CardDescription>WhatsApp Business webhook payload</CardDescription>
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
              placeholder="Enter WhatsApp webhook payload..."
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
          <CardDescription>Common WhatsApp message scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline"
              onClick={() => setPayload(JSON.stringify({
                ...SAMPLE_WHATSAPP_PAYLOAD,
                entry: [{
                  ...SAMPLE_WHATSAPP_PAYLOAD.entry[0],
                  changes: [{
                    value: {
                      ...SAMPLE_WHATSAPP_PAYLOAD.entry[0].changes[0].value,
                      contacts: [{
                        profile: { name: "Sarah Johnson" },
                        wa_id: "15551234567"
                      }],
                      messages: [{
                        from: "15551234567",
                        id: "msg_inquiry",
                        timestamp: Math.floor(Date.now() / 1000).toString(),
                        text: {
                          body: "Hi, I saw your ad on Facebook. I'm interested in learning more about your premium plan. Can someone call me?"
                        },
                        type: "text"
                      }]
                    },
                    field: "messages"
                  }]
                }]
              }, null, 2))}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Product Inquiry
            </Button>
            <Button 
              variant="outline"
              onClick={() => setPayload(JSON.stringify({
                ...SAMPLE_WHATSAPP_PAYLOAD,
                entry: [{
                  ...SAMPLE_WHATSAPP_PAYLOAD.entry[0],
                  changes: [{
                    value: {
                      ...SAMPLE_WHATSAPP_PAYLOAD.entry[0].changes[0].value,
                      contacts: [{
                        profile: { name: "Mike Brown" },
                        wa_id: "15559876543"
                      }],
                      messages: [{
                        from: "15559876543",
                        id: "msg_support",
                        timestamp: Math.floor(Date.now() / 1000).toString(),
                        text: {
                          body: "I have a problem with my order #12345. It hasn't arrived yet."
                        },
                        type: "text"
                      }]
                    },
                    field: "messages"
                  }]
                }]
              }, null, 2))}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Support Request
            </Button>
            <Button 
              variant="outline"
              onClick={() => setPayload(JSON.stringify({
                ...SAMPLE_WHATSAPP_PAYLOAD,
                entry: [{
                  ...SAMPLE_WHATSAPP_PAYLOAD.entry[0],
                  changes: [{
                    value: {
                      ...SAMPLE_WHATSAPP_PAYLOAD.entry[0].changes[0].value,
                      contacts: [{
                        profile: { name: "Unknown User" },
                        wa_id: "15551112233"
                      }],
                      messages: [{
                        from: "15551112233",
                        id: "msg_short",
                        timestamp: Math.floor(Date.now() / 1000).toString(),
                        text: {
                          body: "Hi"
                        },
                        type: "text"
                      }]
                    },
                    field: "messages"
                  }]
                }]
              }, null, 2))}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Short Message
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

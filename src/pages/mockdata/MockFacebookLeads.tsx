import { useState } from 'react';
import { 
  RefreshCw, Code, Copy, Database, Play,
  Facebook, CheckCircle, XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { webhooksApi } from '@/services/api';

const SAMPLE_FACEBOOK_PAYLOAD = {
  object: "page",
  entry: [{
    id: "123456789",
    time: Date.now(),
    changes: [{
      value: {
        form_id: "form_123456",
        leadgen_id: "lead_789012",
        created_time: Math.floor(Date.now() / 1000),
        field_data: [
          { name: "full_name", values: ["John Doe"] },
          { name: "email", values: ["john.doe@example.com"] },
          { name: "phone_number", values: ["+1234567890"] },
          { name: "city", values: ["New York"] },
          { name: "custom_question_1", values: ["Interested in Premium Plan"] }
        ],
        ad_id: "ad_456789",
        ad_name: "Summer Sale Campaign",
        adset_id: "adset_789",
        adset_name: "US Audience",
        campaign_id: "campaign_123",
        campaign_name: "Q3 Marketing",
      },
      field: "leadgen"
    }]
  }]
};

export function MockFacebookLeads() {
  const [payload, setPayload] = useState(JSON.stringify(SAMPLE_FACEBOOK_PAYLOAD, null, 2));
  const [webhookUrl, setWebhookUrl] = useState(`${window.location.origin}/api/webhooks/facebook`);
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    try {
      setLoading(true);
      const data = JSON.parse(payload);
      const res = await webhooksApi.simulateWebhook('facebook', data);
      setResponse(JSON.stringify(res.data, null, 2));
      toast.success('Facebook webhook simulated');
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
    setPayload(JSON.stringify(SAMPLE_FACEBOOK_PAYLOAD, null, 2));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-lg">
            <Facebook className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Mock Facebook Leads</h1>
            <p className="text-gray-500 mt-1">Test Facebook Lead Ads webhooks</p>
          </div>
        </div>
        <Badge variant="outline" className="text-blue-600 bg-blue-50">Facebook Test</Badge>
      </div>

      {/* Webhook URL */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Configuration</CardTitle>
          <CardDescription>Configure your Facebook webhook URL</CardDescription>
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
              Use this URL in your Facebook App's webhook settings
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
                  Facebook Payload
                </CardTitle>
                <CardDescription>Lead Ads webhook payload</CardDescription>
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
              placeholder="Enter Facebook webhook payload..."
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
          <CardDescription>Common Facebook Lead Ads scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline"
              onClick={() => setPayload(JSON.stringify({
                ...SAMPLE_FACEBOOK_PAYLOAD,
                entry: [{
                  ...SAMPLE_FACEBOOK_PAYLOAD.entry[0],
                  changes: [{
                    value: {
                      ...SAMPLE_FACEBOOK_PAYLOAD.entry[0].changes[0].value,
                      ad_name: "Premium Plan Campaign",
                      campaign_name: "High Intent Leads",
                      field_data: [
                        { name: "full_name", values: ["Jane Smith"] },
                        { name: "email", values: ["jane.smith@enterprise.com"] },
                        { name: "phone_number", values: ["+1987654321"] },
                        { name: "company_name", values: ["Enterprise Corp"] },
                        { name: "job_title", values: ["CTO"] }
                      ]
                    },
                    field: "leadgen"
                  }]
                }]
              }, null, 2))}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Enterprise Lead
            </Button>
            <Button 
              variant="outline"
              onClick={() => setPayload(JSON.stringify({
                ...SAMPLE_FACEBOOK_PAYLOAD,
                entry: [{
                  ...SAMPLE_FACEBOOK_PAYLOAD.entry[0],
                  changes: [{
                    value: {
                      ...SAMPLE_FACEBOOK_PAYLOAD.entry[0].changes[0].value,
                      ad_name: "Free Trial Campaign",
                      campaign_name: "Startup Leads",
                      field_data: [
                        { name: "full_name", values: ["Mike Johnson"] },
                        { name: "email", values: ["mike@startup.io"] },
                        { name: "phone_number", values: ["+1555123456"] }
                      ]
                    },
                    field: "leadgen"
                  }]
                }]
              }, null, 2))}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Startup Lead
            </Button>
            <Button 
              variant="outline"
              onClick={() => setPayload(JSON.stringify({
                object: "page",
                entry: [{
                  id: "123456789",
                  time: Date.now(),
                  changes: [{
                    value: {
                      form_id: "form_123456",
                      leadgen_id: "lead_789012",
                      created_time: Math.floor(Date.now() / 1000),
                      field_data: [
                        { name: "full_name", values: ["Incomplete Lead"] }
                      ],
                      ad_id: "ad_456789",
                      ad_name: "Test Campaign"
                    },
                    field: "leadgen"
                  }]
                }]
              }, null, 2))}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Incomplete Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from 'react';
import { 
  RefreshCw, Code, Copy, Database, Play,
  Instagram, CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { webhooksApi } from '@/services/api';

const SAMPLE_INSTAGRAM_PAYLOAD = {
  object: "instagram",
  entry: [{
    id: "instagram_account_id",
    time: Date.now(),
    messaging: [{
      sender: {
        id: "user_123456"
      },
      recipient: {
        id: "instagram_account_id"
      },
      timestamp: Date.now(),
      message: {
        mid: "message_id",
        text: "Hi! I saw your post about the new collection. Do you ship internationally?"
      }
    }]
  }]
};

const INSTAGRAM_LEAD_PAYLOAD = {
  object: "page",
  entry: [{
    id: "page_id",
    time: Date.now(),
    changes: [{
      value: {
        form_id: "instagram_form_123",
        leadgen_id: "lead_instagram_456",
        created_time: Math.floor(Date.now() / 1000),
        field_data: [
          { name: "full_name", values: ["Emma Wilson"] },
          { name: "email", values: ["emma.wilson@fashion.com"] },
          { name: "phone_number", values: ["+14445556677"] },
          { name: "city", values: ["Los Angeles"] },
          { name: "custom_question", values: ["Interested in wholesale"] }
        ],
        ad_id: "ig_ad_789",
        ad_name: "New Collection Launch",
        adset_id: "ig_adset_012",
        campaign_id: "ig_campaign_345",
        campaign_name: "Instagram Summer Campaign"
      },
      field: "leadgen"
    }]
  }]
};

export function MockInstagramLeads() {
  const [activeTab, setActiveTab] = useState<'message' | 'lead'>('message');
  const [messagePayload, setMessagePayload] = useState(JSON.stringify(SAMPLE_INSTAGRAM_PAYLOAD, null, 2));
  const [leadPayload, setLeadPayload] = useState(JSON.stringify(INSTAGRAM_LEAD_PAYLOAD, null, 2));
  const [webhookUrl, setWebhookUrl] = useState(`${window.location.origin}/api/webhooks/instagram`);
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    try {
      setLoading(true);
      const payload = activeTab === 'message' ? messagePayload : leadPayload;
      const data = JSON.parse(payload);
      const res = await webhooksApi.simulateWebhook('instagram', data);
      setResponse(JSON.stringify(res.data, null, 2));
      toast.success('Instagram webhook simulated');
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
    if (activeTab === 'message') {
      setMessagePayload(JSON.stringify(SAMPLE_INSTAGRAM_PAYLOAD, null, 2));
    } else {
      setLeadPayload(JSON.stringify(INSTAGRAM_LEAD_PAYLOAD, null, 2));
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-3 rounded-lg">
            <Instagram className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Mock Instagram Leads</h1>
            <p className="text-gray-500 mt-1">Test Instagram messaging and lead ads webhooks</p>
          </div>
        </div>
        <Badge variant="outline" className="text-pink-600 bg-pink-50">Instagram Test</Badge>
      </div>

      {/* Webhook URL */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Configuration</CardTitle>
          <CardDescription>Configure your Instagram webhook URL</CardDescription>
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
          </div>
        </CardContent>
      </Card>

      {/* Tab Selection */}
      <div className="flex gap-4">
        <Button 
          variant={activeTab === 'message' ? 'default' : 'outline'}
          onClick={() => setActiveTab('message')}
        >
          Direct Message
        </Button>
        <Button 
          variant={activeTab === 'lead' ? 'default' : 'outline'}
          onClick={() => setActiveTab('lead')}
        >
          Lead Ad Form
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Instagram Payload
                </CardTitle>
                <CardDescription>
                  {activeTab === 'message' ? 'Direct message webhook' : 'Lead ad form submission'}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={resetPayload}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(activeTab === 'message' ? messagePayload : leadPayload)}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea 
              value={activeTab === 'message' ? messagePayload : leadPayload}
              onChange={(e) => activeTab === 'message' ? setMessagePayload(e.target.value) : setLeadPayload(e.target.value)}
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
          <CardDescription>Common Instagram interaction scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeTab === 'message' ? (
              <>
                <Button 
                  variant="outline"
                  onClick={() => setMessagePayload(JSON.stringify({
                    ...SAMPLE_INSTAGRAM_PAYLOAD,
                    entry: [{
                      ...SAMPLE_INSTAGRAM_PAYLOAD.entry[0],
                      messaging: [{
                        ...SAMPLE_INSTAGRAM_PAYLOAD.entry[0].messaging[0],
                        message: {
                          mid: "msg_product_inquiry",
                          text: "Love your products! What's the price range for your premium items?"
                        }
                      }]
                    }]
                  }, null, 2))}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Product Inquiry
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setMessagePayload(JSON.stringify({
                    ...SAMPLE_INSTAGRAM_PAYLOAD,
                    entry: [{
                      ...SAMPLE_INSTAGRAM_PAYLOAD.entry[0],
                      messaging: [{
                        ...SAMPLE_INSTAGRAM_PAYLOAD.entry[0].messaging[0],
                        message: {
                          mid: "msg_collab",
                          text: "Hi! I'm a content creator with 50k followers. Would love to collaborate!"
                        }
                      }]
                    }]
                  }, null, 2))}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Collaboration Request
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline"
                  onClick={() => setLeadPayload(JSON.stringify({
                    ...INSTAGRAM_LEAD_PAYLOAD,
                    entry: [{
                      ...INSTAGRAM_LEAD_PAYLOAD.entry[0],
                      changes: [{
                        value: {
                          ...INSTAGRAM_LEAD_PAYLOAD.entry[0].changes[0].value,
                          ad_name: "Influencer Partnership",
                          field_data: [
                            { name: "full_name", values: ["Alex Rivera"] },
                            { name: "email", values: ["alex@creator.com"] },
                            { name: "phone_number", values: ["+16667778899"] },
                            { name: "followers_count", values: ["50000"] }
                          ]
                        },
                        field: "leadgen"
                      }]
                    }]
                  }, null, 2))}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Influencer Lead
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setLeadPayload(JSON.stringify({
                    ...INSTAGRAM_LEAD_PAYLOAD,
                    entry: [{
                      ...INSTAGRAM_LEAD_PAYLOAD.entry[0],
                      changes: [{
                        value: {
                          ...INSTAGRAM_LEAD_PAYLOAD.entry[0].changes[0].value,
                          ad_name: "Flash Sale",
                          field_data: [
                            { name: "full_name", values: ["Lisa Chen"] },
                            { name: "email", values: ["lisa@email.com"] },
                            { name: "phone_number", values: ["+19998887766"] }
                          ]
                        },
                        field: "leadgen"
                      }]
                    }]
                  }, null, 2))}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Sale Lead
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

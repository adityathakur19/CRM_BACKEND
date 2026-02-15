import { useState } from 'react';
import { 
  RefreshCw, Code, Copy, Database, Play,
  CheckCircle, XCircle, Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { webhooksApi } from '@/services/api';

const SAMPLE_GOOGLE_ADS_PAYLOAD = {
  "lead_id": "LEAD-1234567890",
  "campaign_id": "123456789",
  "adgroup_id": "987654321",
  "creative_id": "456789123",
  "gcl_id": "gclid_abc123xyz",
  "user_column_data": [
    {
      "column_name": "Full Name",
      "string_value": "Robert Johnson",
      "column_id": "FULL_NAME"
    },
    {
      "column_name": "Email",
      "string_value": "robert.johnson@company.com",
      "column_id": "EMAIL"
    },
    {
      "column_name": "Phone Number",
      "string_value": "+1-555-123-4567",
      "column_id": "PHONE_NUMBER"
    },
    {
      "column_name": "Company Name",
      "string_value": "Tech Solutions Inc",
      "column_id": "COMPANY_NAME"
    },
    {
      "column_name": "Job Title",
      "string_value": "IT Director",
      "column_id": "JOB_TITLE"
    },
    {
      "column_name": "City",
      "string_value": "San Francisco",
      "column_id": "CITY"
    },
    {
      "column_name": "Zip Code",
      "string_value": "94102",
      "column_id": "ZIP_CODE"
    }
  ],
  "api_version": "1.0",
  "form_id": "FORM-789456123",
  "campaign_name": "B2B Software Solutions",
  "adgroup_name": "Enterprise IT",
  "is_test": false,
  "google_key": "google_key_placeholder",
  "submission_date": new Date().toISOString()
};

export function MockGoogleAdsLeads() {
  const [payload, setPayload] = useState(JSON.stringify(SAMPLE_GOOGLE_ADS_PAYLOAD, null, 2));
  const [webhookUrl, setWebhookUrl] = useState(`${window.location.origin}/api/webhooks/google`);
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    try {
      setLoading(true);
      const data = JSON.parse(payload);
      const res = await webhooksApi.simulateWebhook('google', data);
      setResponse(JSON.stringify(res.data, null, 2));
      toast.success('Google Ads webhook simulated');
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
    setPayload(JSON.stringify(SAMPLE_GOOGLE_ADS_PAYLOAD, null, 2));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-red-500 p-3 rounded-lg">
            <Search className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Mock Google Ads Leads</h1>
            <p className="text-gray-500 mt-1">Test Google Ads lead form extensions</p>
          </div>
        </div>
        <Badge variant="outline" className="text-red-600 bg-red-50">Google Ads Test</Badge>
      </div>

      {/* Webhook URL */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Configuration</CardTitle>
          <CardDescription>Configure your Google Ads webhook URL</CardDescription>
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
              Configure this webhook in your Google Ads lead form extension settings
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
                  Google Ads Payload
                </CardTitle>
                <CardDescription>Lead form extension payload</CardDescription>
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
          <CardDescription>Common Google Ads lead form scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline"
              onClick={() => setPayload(JSON.stringify({
                ...SAMPLE_GOOGLE_ADS_PAYLOAD,
                campaign_name: "Enterprise Software Demo",
                adgroup_name: "C-Level Executives",
                user_column_data: [
                  { column_name: "Full Name", string_value: "Jennifer Martinez", column_id: "FULL_NAME" },
                  { column_name: "Email", string_value: "j.martinez@enterprise.com", column_id: "EMAIL" },
                  { column_name: "Phone Number", string_value: "+1-555-987-6543", column_id: "PHONE_NUMBER" },
                  { column_name: "Company Name", string_value: "Fortune 500 Corp", column_id: "COMPANY_NAME" },
                  { column_name: "Job Title", string_value: "Chief Technology Officer", column_id: "JOB_TITLE" },
                  { column_name: "Company Size", string_value: "1000+", column_id: "COMPANY_SIZE" }
                ]
              }, null, 2))}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Enterprise Lead
            </Button>
            <Button 
              variant="outline"
              onClick={() => setPayload(JSON.stringify({
                ...SAMPLE_GOOGLE_ADS_PAYLOAD,
                campaign_name: "SMB Solutions",
                adgroup_name: "Small Business Owners",
                user_column_data: [
                  { column_name: "Full Name", string_value: "David Kim", column_id: "FULL_NAME" },
                  { column_name: "Email", string_value: "david@smallbiz.com", column_id: "EMAIL" },
                  { column_name: "Phone Number", string_value: "+1-555-456-7890", column_id: "PHONE_NUMBER" },
                  { column_name: "Company Name", string_value: "Kim's Bakery", column_id: "COMPANY_NAME" },
                  { column_name: "Job Title", string_value: "Owner", column_id: "JOB_TITLE" }
                ]
              }, null, 2))}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Small Business Lead
            </Button>
            <Button 
              variant="outline"
              onClick={() => setPayload(JSON.stringify({
                ...SAMPLE_GOOGLE_ADS_PAYLOAD,
                is_test: true,
                user_column_data: [
                  { column_name: "Full Name", string_value: "Test User", column_id: "FULL_NAME" },
                  { column_name: "Email", string_value: "test@example.com", column_id: "EMAIL" }
                ]
              }, null, 2))}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Test Lead
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

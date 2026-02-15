import { useState } from 'react';
import { 
  RefreshCw, Code, Copy, Database, Play,
  Linkedin, CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { webhooksApi } from '@/services/api';

const SAMPLE_LINKEDIN_PAYLOAD = {
  "submissionId": "linkedin_submission_123456",
  "submittedAt": Date.now(),
  "formName": "B2B Lead Generation Form",
  "formId": "urn:li:adForm:123456",
  "accountId": "urn:li:sponsoredAccount:789012",
  "campaignId": "urn:li:sponsoredCampaign:345678",
  "adId": "urn:li:sponsoredCreative:901234",
  "user": {
    "firstName": "Michael",
    "lastName": "Anderson",
    "email": "michael.anderson@techcorp.com",
    "phone": "+1-555-789-0123"
  },
  "questions": [
    {
      "key": "firstName",
      "value": "Michael"
    },
    {
      "key": "lastName",
      "value": "Anderson"
    },
    {
      "key": "email",
      "value": "michael.anderson@techcorp.com"
    },
    {
      "key": "phone",
      "value": "+1-555-789-0123"
    },
    {
      "key": "company",
      "value": "TechCorp Industries"
    },
    {
      "key": "jobTitle",
      "value": "VP of Engineering"
    },
    {
      "key": "companySize",
      "value": "500-1000 employees"
    },
    {
      "key": "industry",
      "value": "Information Technology"
    }
  ],
  "consent": {
    "consentText": "I agree to be contacted about products and services",
    "obtainedAt": Date.now()
  }
};

export function MockLinkedInLeads() {
  const [payload, setPayload] = useState(JSON.stringify(SAMPLE_LINKEDIN_PAYLOAD, null, 2));
  const [webhookUrl, setWebhookUrl] = useState(`${window.location.origin}/api/webhooks/linkedin`);
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    try {
      setLoading(true);
      const data = JSON.parse(payload);
      const res = await webhooksApi.simulateWebhook('linkedin', data);
      setResponse(JSON.stringify(res.data, null, 2));
      toast.success('LinkedIn webhook simulated');
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
    setPayload(JSON.stringify(SAMPLE_LINKEDIN_PAYLOAD, null, 2));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-blue-700 p-3 rounded-lg">
            <Linkedin className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Mock LinkedIn Leads</h1>
            <p className="text-gray-500 mt-1">Test LinkedIn Lead Gen Forms webhooks</p>
          </div>
        </div>
        <Badge variant="outline" className="text-blue-700 bg-blue-50">LinkedIn Test</Badge>
      </div>

      {/* Webhook URL */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Configuration</CardTitle>
          <CardDescription>Configure your LinkedIn webhook URL</CardDescription>
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
              Configure this webhook in your LinkedIn Campaign Manager lead gen form settings
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
                  LinkedIn Payload
                </CardTitle>
                <CardDescription>Lead Gen Form webhook payload</CardDescription>
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
          <CardDescription>Common LinkedIn lead gen scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline"
              onClick={() => setPayload(JSON.stringify({
                ...SAMPLE_LINKEDIN_PAYLOAD,
                formName: "C-Level Executive Survey",
                user: {
                  firstName: "Sarah",
                  lastName: "Thompson",
                  email: "s.thompson@globalcorp.com",
                  phone: "+1-555-234-5678"
                },
                questions: [
                  { key: "firstName", value: "Sarah" },
                  { key: "lastName", value: "Thompson" },
                  { key: "email", value: "s.thompson@globalcorp.com" },
                  { key: "phone", value: "+1-555-234-5678" },
                  { key: "company", value: "Global Corporation" },
                  { key: "jobTitle", value: "Chief Executive Officer" },
                  { key: "companySize", value: "10000+ employees" },
                  { key: "industry", value: "Financial Services" },
                  { key: "budget", value: "$500K+" }
                ]
              }, null, 2))}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              C-Level Executive
            </Button>
            <Button 
              variant="outline"
              onClick={() => setPayload(JSON.stringify({
                ...SAMPLE_LINKEDIN_PAYLOAD,
                formName: "HR Decision Maker Form",
                user: {
                  firstName: "Lisa",
                  lastName: "Wong",
                  email: "lisa.wong@hrtech.com",
                  phone: "+1-555-876-5432"
                },
                questions: [
                  { key: "firstName", value: "Lisa" },
                  { key: "lastName", value: "Wong" },
                  { key: "email", value: "lisa.wong@hrtech.com" },
                  { key: "phone", value: "+1-555-876-5432" },
                  { key: "company", value: "HRTech Solutions" },
                  { key: "jobTitle", value: "Head of People Operations" },
                  { key: "companySize", value: "200-500 employees" },
                  { key: "industry", value: "Human Resources" }
                ]
              }, null, 2))}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              HR Decision Maker
            </Button>
            <Button 
              variant="outline"
              onClick={() => setPayload(JSON.stringify({
                ...SAMPLE_LINKEDIN_PAYLOAD,
                formName: "Startup Founder Form",
                user: {
                  firstName: "Alex",
                  lastName: "Chen",
                  email: "alex@startup.io",
                  phone: "+1-555-111-2222"
                },
                questions: [
                  { key: "firstName", value: "Alex" },
                  { key: "lastName", value: "Chen" },
                  { key: "email", value: "alex@startup.io" },
                  { key: "phone", value: "+1-555-111-2222" },
                  { key: "company", value: "TechStartup Inc" },
                  { key: "jobTitle", value: "Founder & CEO" },
                  { key: "companySize", value: "1-10 employees" },
                  { key: "industry", value: "Technology" },
                  { key: "fundingStage", value: "Seed" }
                ]
              }, null, 2))}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Startup Founder
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

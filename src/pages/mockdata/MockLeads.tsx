import { useState } from 'react';
import { 
  RefreshCw, Code, Copy, Database, Play,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { leadsApi } from '@/services/api';

const SAMPLE_LEAD_PAYLOAD = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1234567890",
  source: "manual",
  status: "new",
  priority: "medium",
  company: "Acme Inc",
  jobTitle: "Manager",
  notes: "Interested in our premium plan",
  tags: ["hot", "enterprise"]
};

export function MockLeads() {
  const [payload, setPayload] = useState(JSON.stringify(SAMPLE_LEAD_PAYLOAD, null, 2));
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    try {
      setLoading(true);
      const data = JSON.parse(payload);
      const res = await leadsApi.createLead(data);
      setResponse(JSON.stringify(res.data, null, 2));
      toast.success('Lead created successfully');
    } catch (error: any) {
      setResponse(JSON.stringify(error.response?.data || { error: error.message }, null, 2));
      toast.error('Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const resetPayload = () => {
    setPayload(JSON.stringify(SAMPLE_LEAD_PAYLOAD, null, 2));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mock Lead Data</h1>
          <p className="text-gray-500 mt-1">Test lead creation with custom payloads</p>
        </div>
        <Badge variant="outline" className="text-yellow-600 bg-yellow-50">Test Environment</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Request Payload
                </CardTitle>
                <CardDescription>JSON payload for lead creation</CardDescription>
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
              placeholder="Enter JSON payload..."
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
              Send Request
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
                <CardDescription>API response will appear here</CardDescription>
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
                  <p>Send a request to see the response</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Test Scenarios</CardTitle>
          <CardDescription>Common lead creation scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              onClick={() => setPayload(JSON.stringify({
                ...SAMPLE_LEAD_PAYLOAD,
                name: "Hot Lead - Enterprise",
                priority: "urgent",
                tags: ["hot", "enterprise", "callback"]
              }, null, 2))}
            >
              <Users className="mr-2 h-4 w-4" />
              Hot Enterprise Lead
            </Button>
            <Button 
              variant="outline"
              onClick={() => setPayload(JSON.stringify({
                ...SAMPLE_LEAD_PAYLOAD,
                name: "Cold Lead - Small Business",
                priority: "low",
                company: "Small Biz LLC",
                tags: ["cold", "small-business"]
              }, null, 2))}
            >
              <Users className="mr-2 h-4 w-4" />
              Cold Small Business Lead
            </Button>
            <Button 
              variant="outline"
              onClick={() => setPayload(JSON.stringify({
                ...SAMPLE_LEAD_PAYLOAD,
                name: "Incomplete Lead",
                email: undefined,
                company: undefined,
                notes: "Missing some information"
              }, null, 2))}
            >
              <Users className="mr-2 h-4 w-4" />
              Incomplete Lead
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

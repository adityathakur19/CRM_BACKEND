import { useState, useEffect } from 'react';
import { 
  Building2, Bell, CreditCard, 
  Webhook, Smartphone, Globe, Save
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { businessApi, integrationsApi } from '@/services/api';
import { toast } from 'sonner';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function Settings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { business, setBusiness } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'business');
  
  const [businessSettings, setBusinessSettings] = useState({
    name: business?.name || '',
    email: business?.email || '',
    phone: business?.phone || '',
    industry: business?.industry || 'other',
    timezone: business?.settings?.timezone || 'UTC',
    currency: business?.settings?.currency || 'USD',
    language: business?.settings?.language || 'en',
  });

  const [notifications, setNotifications] = useState({
    emailNewLead: business?.settings?.notifications?.emailNewLead ?? true,
    emailTaskAssigned: business?.settings?.notifications?.emailTaskAssigned ?? true,
    emailPaymentReceived: business?.settings?.notifications?.emailPaymentReceived ?? true,
    smsNewLead: business?.settings?.notifications?.smsNewLead ?? false,
    smsTaskAssigned: business?.settings?.notifications?.smsTaskAssigned ?? false,
    inAppAll: business?.settings?.notifications?.inAppAll ?? true,
  });

  const [integrations, setIntegrations] = useState({
    whatsapp: { connected: false, phone: '' },
    stripe: { connected: false, testMode: true },
    razorpay: { connected: false, testMode: true },
    facebook: { connected: false, pageId: '' },
    instagram: { connected: false, accountId: '' },
    linkedin: { connected: false, adAccountId: '' },
    gmail: { connected: false },
    google: { connected: false, adAccountId: '' },
  });

  // Update local state when business changes in store
  useEffect(() => {
    if (business) {
      setBusinessSettings({
        name: business.name || '',
        email: business.email || '',
        phone: business.phone || '',
        industry: business.industry || 'other',
        timezone: business.settings?.timezone || 'UTC',
        currency: business.settings?.currency || 'USD',
        language: business.settings?.language || 'en',
      });

      setNotifications({
        emailNewLead: business.settings?.notifications?.emailNewLead ?? true,
        emailTaskAssigned: business.settings?.notifications?.emailTaskAssigned ?? true,
        emailPaymentReceived: business.settings?.notifications?.emailPaymentReceived ?? true,
        smsNewLead: business.settings?.notifications?.smsNewLead ?? false,
        smsTaskAssigned: business.settings?.notifications?.smsTaskAssigned ?? false,
        inAppAll: business.settings?.notifications?.inAppAll ?? true,
      });
    }
  }, [business]);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await integrationsApi.getStatus();
      if (response.data.data) {
        setIntegrations(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch integrations');
    }
  };

  const handleSaveBusiness = async () => {
    try {
      setLoading(true);
      const response = await businessApi.updateSettings(businessSettings);
      
      // Update the business in the store with the response data
      if (response.data.data) {
        setBusiness(response.data.data);
      }
      
      toast.success('Business settings saved successfully');
    } catch (error) {
      console.error('Failed to save business settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setLoading(true);
      await businessApi.updateNotifications(notifications);
      
      // Update the business in the store with new notifications
      if (business) {
        setBusiness({
          ...business,
          settings: {
            ...business.settings,
            notifications
          }
        });
      }
      
      toast.success('Notification preferences saved successfully');
    } catch (error) {
      console.error('Failed to save notifications:', error);
      toast.error('Failed to save notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectIntegration = async (integration: string) => {
    try {
      const response = await integrationsApi.connect(integration);
      if (response.data.data?.authUrl) {
        window.open(response.data.data.authUrl, '_blank');
      }
    } catch (error) {
      toast.error(`Failed to connect ${integration}`);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your business and application settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="business">
            <Building2 className="mr-2 h-4 w-4" />
            Business
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Webhook className="mr-2 h-4 w-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="mr-2 h-4 w-4" />
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Update your business details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input 
                    value={businessSettings.name}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={businessSettings.industry}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, industry: e.target.value as any })}
                  >
                    <option value="shop">Retail Shop</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="education">Education</option>
                    <option value="travel">Travel Agency</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    value={businessSettings.email}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input 
                    value={businessSettings.phone}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, phone: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Regional Settings</CardTitle>
              <CardDescription>Configure timezone, currency and language</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={businessSettings.timezone}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, timezone: e.target.value })}
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Dubai">Dubai</option>
                    <option value="Asia/Kolkata">India</option>
                    <option value="Asia/Singapore">Singapore</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={businessSettings.currency}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, currency: e.target.value })}
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="AED">AED - UAE Dirham</option>
                    <option value="SGD">SGD - Singapore Dollar</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={businessSettings.language}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, language: e.target.value })}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="hi">Hindi</option>
                    <option value="ar">Arabic</option>
                    <option value="ja">Japanese</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSaveBusiness} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Manage your email notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New Lead</p>
                  <p className="text-sm text-gray-500">Receive an email when a new lead is created</p>
                </div>
                <Switch 
                  checked={notifications.emailNewLead}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, emailNewLead: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Task Assigned</p>
                  <p className="text-sm text-gray-500">Receive an email when a task is assigned to you</p>
                </div>
                <Switch 
                  checked={notifications.emailTaskAssigned}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, emailTaskAssigned: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Payment Received</p>
                  <p className="text-sm text-gray-500">Receive an email when a payment is received</p>
                </div>
                <Switch 
                  checked={notifications.emailPaymentReceived}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, emailPaymentReceived: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSaveNotifications} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Saving...' : 'Save Preferences'}
          </Button>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Communication</CardTitle>
              <CardDescription>Connect your communication channels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Smartphone className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">WhatsApp Business</p>
                    <p className="text-sm text-gray-500">
                      {integrations.whatsapp.connected 
                        ? `Connected: ${integrations.whatsapp.phone}` 
                        : 'Not connected'}
                    </p>
                  </div>
                </div>
                <Button 
                  variant={integrations.whatsapp.connected ? 'outline' : 'default'}
                  onClick={() => handleConnectIntegration('whatsapp')}
                >
                  {integrations.whatsapp.connected ? 'Reconnect' : 'Connect'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Gateways</CardTitle>
              <CardDescription>Connect payment processors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <CreditCard className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Stripe</p>
                    <p className="text-sm text-gray-500">
                      {integrations.stripe.connected 
                        ? `Connected (${integrations.stripe.testMode ? 'Test Mode' : 'Live'})` 
                        : 'Not connected'}
                    </p>
                  </div>
                </div>
                <Button 
                  variant={integrations.stripe.connected ? 'outline' : 'default'}
                  onClick={() => handleConnectIntegration('stripe')}
                >
                  {integrations.stripe.connected ? 'Manage' : 'Connect'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Razorpay</p>
                    <p className="text-sm text-gray-500">
                      {integrations.razorpay.connected 
                        ? `Connected (${integrations.razorpay.testMode ? 'Test Mode' : 'Live'})` 
                        : 'Not connected'}
                    </p>
                  </div>
                </div>
                <Button 
                  variant={integrations.razorpay.connected ? 'outline' : 'default'}
                  onClick={() => handleConnectIntegration('razorpay')}
                >
                  {integrations.razorpay.connected ? 'Manage' : 'Connect'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lead Sources</CardTitle>
              <CardDescription>Connect lead generation platforms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Globe className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Facebook Lead Ads</p>
                    <p className="text-sm text-gray-500">
                      {integrations.facebook.connected 
                        ? `Connected: ${integrations.facebook.pageId}` 
                        : 'Not connected'}
                    </p>
                  </div>
                </div>
                <Button 
                  variant={integrations.facebook.connected ? 'outline' : 'default'}
                  onClick={() => handleConnectIntegration('facebook')}
                >
                  {integrations.facebook.connected ? 'Manage' : 'Connect'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-purple-600 to-pink-500 p-3 rounded-lg">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Instagram Lead Ads</p>
                    <p className="text-sm text-gray-500">
                      {integrations.instagram?.connected 
                        ? `Connected: ${integrations.instagram.accountId}` 
                        : 'Capture leads from Instagram'}
                    </p>
                  </div>
                </div>
                <Button 
                  variant={integrations.instagram?.connected ? 'outline' : 'default'}
                  onClick={() => handleConnectIntegration('instagram')}
                >
                  {integrations.instagram?.connected ? 'Manage' : 'Connect'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-700 p-3 rounded-lg">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">LinkedIn Lead Gen Forms</p>
                    <p className="text-sm text-gray-500">
                      {integrations.linkedin?.connected 
                        ? `Connected: ${integrations.linkedin.adAccountId}` 
                        : 'Collect professional leads'}
                    </p>
                  </div>
                </div>
                <Button 
                  variant={integrations.linkedin?.connected ? 'outline' : 'default'}
                  onClick={() => handleConnectIntegration('linkedin')}
                >
                  {integrations.linkedin?.connected ? 'Manage' : 'Connect'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="bg-red-500 p-3 rounded-lg">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Gmail</p>
                    <p className="text-sm text-gray-500">
                      {integrations.gmail?.connected 
                        ? 'Connected - Creating leads from emails' 
                        : 'Auto-create leads from emails'}
                    </p>
                  </div>
                </div>
                <Button 
                  variant={integrations.gmail?.connected ? 'outline' : 'default'}
                  onClick={() => handleConnectIntegration('gmail')}
                >
                  {integrations.gmail?.connected ? 'Manage' : 'Connect'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="bg-red-100 p-3 rounded-lg">
                    <Globe className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium">Google Ads</p>
                    <p className="text-sm text-gray-500">
                      {integrations.google.connected 
                        ? `Connected: ${integrations.google.adAccountId}` 
                        : 'Not connected'}
                    </p>
                  </div>
                </div>
                <Button 
                  variant={integrations.google.connected ? 'outline' : 'default'}
                  onClick={() => handleConnectIntegration('google')}
                >
                  {integrations.google.connected ? 'Manage' : 'Connect'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Manage your subscription</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-2xl font-bold capitalize">{business?.subscription?.plan || 'Free'} Plan</p>
                  <p className="text-gray-500">{business?.subscription?.status === 'active' ? 'Active' : 'Inactive'}</p>
                </div>
                <Badge className="bg-blue-500">Current</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold">{business?.subscription?.maxUsers || 5}</p>
                  <p className="text-sm text-gray-500">Team Members</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold">{business?.subscription?.maxLeads || 100}</p>
                  <p className="text-sm text-gray-500">Max Leads</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold">Unlimited</p>
                  <p className="text-sm text-gray-500">Invoices</p>
                </div>
              </div>
              <Button onClick={() => navigate('/billing/upgrade')}>
                Upgrade Plan
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
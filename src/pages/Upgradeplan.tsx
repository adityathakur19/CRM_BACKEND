import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'Forever',
    description: 'Perfect for getting started',
    features: [
      '5 Team Members',
      '100 Leads/month',
      'Unlimited Invoices',
      'Basic Reports',
      'Email Support',
      'Mobile App Access'
    ],
    limitations: [
      'No Advanced Analytics',
      'No Custom Integrations',
      'No Priority Support'
    ],
    badge: 'Current',
    badgeVariant: 'secondary' as const
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    period: 'per month',
    description: 'For growing teams',
    features: [
      '15 Team Members',
      '1,000 Leads/month',
      'Unlimited Invoices',
      'Advanced Reports',
      'Priority Email Support',
      'Mobile App Access',
      'Custom Templates',
      'Workflow Automation'
    ],
    limitations: [
      'Limited Integrations'
    ],
    badge: 'Popular',
    badgeVariant: 'default' as const,
    highlighted: true
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 79,
    period: 'per month',
    description: 'For established businesses',
    features: [
      'Unlimited Team Members',
      'Unlimited Leads',
      'Unlimited Invoices',
      'Advanced Reports & Analytics',
      'Priority Support (24/7)',
      'Mobile App Access',
      'Custom Templates',
      'Advanced Workflow Automation',
      'All Integrations',
      'API Access',
      'White-label Options',
      'Custom Domain'
    ],
    limitations: [],
    badge: 'Best Value',
    badgeVariant: 'default' as const
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    period: 'Custom',
    description: 'For large organizations',
    features: [
      'Everything in Professional',
      'Dedicated Account Manager',
      'Custom Development',
      'SLA Guarantee',
      'On-premise Deployment',
      'Advanced Security',
      'Custom Training',
      'Bulk Discounts'
    ],
    limitations: [],
    badge: 'Contact Sales',
    badgeVariant: 'outline' as const
  }
];

export function UpgradePlan() {
  const navigate = useNavigate();
  const { business } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const currentPlan = business?.subscription?.plan || 'free';

  const handleUpgrade = async (planId: string) => {
    if (planId === 'enterprise') {
      window.location.href = 'mailto:sales@yourcrm.com?subject=Enterprise Plan Inquiry';
      return;
    }

    try {
      setLoading(true);
      setSelectedPlan(planId);
      
      // TODO: Implement actual payment flow
      // This should integrate with your payment gateway (Stripe, Razorpay, etc.)
      
      toast.info('Payment flow not yet implemented', {
        description: 'This will redirect to payment gateway in production'
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // After successful payment, redirect to settings
      // navigate('/settings?tab=billing');
      
    } catch (error) {
      toast.error('Failed to process upgrade');
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Button
            variant="ghost"
            onClick={() => navigate('/settings?tab=billing')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Settings
          </Button>
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600">
            Select the perfect plan for your business needs
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${
                plan.highlighted
                  ? 'border-2 border-primary shadow-lg scale-105'
                  : ''
              } ${
                currentPlan === plan.id
                  ? 'border-2 border-green-500'
                  : ''
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary">{plan.badge}</Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                {currentPlan === plan.id && (
                  <Badge variant="secondary" className="mb-2">Current Plan</Badge>
                )}
                <div className="mb-4">
                  {plan.price !== null ? (
                    <>
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-gray-500 ml-2">{plan.period}</span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold">Custom Pricing</span>
                  )}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features */}
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <Button
                  className="w-full mt-6"
                  variant={currentPlan === plan.id ? 'outline' : 'default'}
                  disabled={currentPlan === plan.id || loading}
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {loading && selectedPlan === plan.id ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Processing...
                    </>
                  ) : currentPlan === plan.id ? (
                    'Current Plan'
                  ) : plan.id === 'enterprise' ? (
                    'Contact Sales'
                  ) : (
                    'Upgrade Now'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Can I change my plan later?</h3>
              <p className="text-sm text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-sm text-gray-600">
                We accept all major credit cards, debit cards, and support various payment gateways including Stripe and Razorpay.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-sm text-gray-600">
                Our Free plan is available forever with no credit card required. You can upgrade to a paid plan anytime.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What happens if I exceed my plan limits?</h3>
              <p className="text-sm text-gray-600">
                You'll receive notifications when approaching limits. You can either upgrade your plan or some features may be temporarily restricted.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
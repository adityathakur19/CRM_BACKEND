import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { integrationsApi } from '@/services/api';
import { toast } from 'sonner';

export function IntegrationCallback() {
  const navigate = useNavigate();
  const { integration } = useParams();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        toast.error(`Authentication failed: ${error}`);
        setTimeout(() => navigate('/settings?tab=integrations'), 3000);
        return;
      }

      if (!code || !state) {
        setStatus('error');
        toast.error('Missing authentication parameters');
        setTimeout(() => navigate('/settings?tab=integrations'), 3000);
        return;
      }

      try {
        // Send code and state to backend
        const response = await integrationsApi.handleCallback(
          integration!,
          code,
          state
        );

        if (response.data.success) {
          setStatus('success');
          toast.success(`${integration} connected successfully!`);
          setTimeout(() => navigate('/settings?tab=integrations'), 2000);
        } else {
          setStatus('error');
          toast.error('Failed to complete connection');
          setTimeout(() => navigate('/settings?tab=integrations'), 3000);
        }
      } catch (error: any) {
        console.error('Callback error:', error);
        setStatus('error');
        toast.error(error.response?.data?.message || 'Failed to complete connection');
        setTimeout(() => navigate('/settings?tab=integrations'), 3000);
      }
    };

    handleCallback();
  }, [integration, searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
        {status === 'processing' && (
          <>
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Connecting {integration}...</h2>
            <p className="text-gray-600">
              Please wait while we complete the connection
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-green-600">Connected!</h2>
            <p className="text-gray-600">
              {integration} has been successfully connected
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Redirecting to settings...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-red-600">Connection Failed</h2>
            <p className="text-gray-600">
              We couldn't complete the connection to {integration}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Redirecting to settings...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
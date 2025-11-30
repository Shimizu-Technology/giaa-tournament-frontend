import { useCallback, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js';
import { X, Loader2, CreditCard, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (sessionId: string) => void;
  golferData: {
    name: string;
    email: string;
    phone: string;
    mobile?: string;
    company?: string;
    address?: string;
  };
  entryFee: number; // in dollars
  stripePublicKey: string;
}

export function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  golferData,
  entryFee,
  stripePublicKey,
}: PaymentModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Stripe
  const stripePromise = loadStripe(stripePublicKey);

  // Fetch client secret from backend
  const fetchClientSecret = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      const response = await api.createEmbeddedCheckout(golferData);
      
      if (response.error) {
        setError(response.error);
        return '';
      }
      
      setIsLoading(false);
      return response.client_secret;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialize payment';
      setError(message);
      setIsLoading(false);
      return '';
    }
  }, [golferData]);

  // Handle checkout completion
  const handleComplete = useCallback(async () => {
    // The EmbeddedCheckout will redirect to return_url automatically
    // But we can also handle it here if needed
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Complete Payment
                </h2>
                <p className="text-sm text-gray-500">
                  Entry Fee: ${entryFee.toFixed(2)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Golfer summary */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-medium text-gray-900">{golferData.name}</span>
                <br />
                {golferData.email}
              </p>
            </div>

            {/* Error display */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Payment Error</p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="mt-2 text-sm text-red-700 hover:text-red-800 font-medium"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* Loading state */}
            {isLoading && !error && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <span className="ml-3 text-gray-600">Loading payment form...</span>
              </div>
            )}

            {/* Embedded Checkout */}
            {!error && (
              <div id="checkout" className="min-h-[400px]">
                <EmbeddedCheckoutProvider
                  stripe={stripePromise}
                  options={{
                    fetchClientSecret,
                    onComplete: handleComplete,
                  }}
                >
                  <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-100">
            <p className="text-xs text-center text-gray-500">
              Secure payment powered by Stripe. Your card details are encrypted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Trophy, ArrowRight, Loader2 } from 'lucide-react';
import { Button, Card } from '../components/ui';
import { api, Golfer } from '../services/api';

export const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [loading, setLoading] = useState(true);
  const [golfer, setGolfer] = useState<Golfer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTestMode, setIsTestMode] = useState(false);

  useEffect(() => {
    const confirmPayment = async () => {
      if (!sessionId) {
        setError('No payment session found');
        setLoading(false);
        return;
      }

      // Check if this is a test mode session
      if (sessionId.startsWith('test_session_')) {
        setIsTestMode(true);
      }

      try {
        const result = await api.confirmPayment(sessionId);
        
        if (result.success) {
          setGolfer(result.golfer);
          // Check if response indicates test mode
          if ((result as any).test_mode) {
            setIsTestMode(true);
          }
        } else {
          setError('Payment verification failed. Please contact support.');
        }
      } catch (err) {
        console.error('Error confirming payment:', err);
        // Even if confirmation fails, the webhook will handle it
        // So we can show a partial success message
        setError(
          'We received your payment but encountered an issue verifying it. ' +
          'You will receive a confirmation email shortly. If you have any concerns, please contact support.'
        );
      } finally {
        setLoading(false);
      }
    };

    confirmPayment();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8 sm:py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Payment Successful!
          </h1>

          {isTestMode && (
            <div className="bg-amber-100 border border-amber-300 rounded-lg px-4 py-2 mb-4 inline-block">
              <p className="text-amber-800 text-sm font-medium">
                🧪 Test Mode - No actual payment was charged
              </p>
            </div>
          )}

          {error ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-amber-800 text-sm">{error}</p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-6">
                Thank you for registering for the tournament!
              </p>

              {golfer && (
                <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                  <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Trophy className="text-amber-500" size={20} />
                    Registration Details
                  </h2>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Name:</span>
                      <span className="font-medium text-gray-900">{golfer.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span className="font-medium text-gray-900">{golfer.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {golfer.registration_status === 'confirmed' ? 'Confirmed' : 'Waitlist'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Payment:</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Paid
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 text-sm">
                  A confirmation email has been sent to <strong>{golfer?.email}</strong>
                </p>
              </div>
            </>
          )}

          <div className="pt-4 border-t border-gray-200">
            <Button onClick={() => navigate('/')} className="w-full sm:w-auto">
              Return to Home
              <ArrowRight size={16} />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};


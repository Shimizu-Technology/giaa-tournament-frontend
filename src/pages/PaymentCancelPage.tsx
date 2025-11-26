import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { Button, Card } from '../components/ui';

export const PaymentCancelPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const golferId = searchParams.get('golfer_id');

  const handleTryAgain = () => {
    // Navigate back to registration with a flag to retry payment
    navigate('/register', { state: { retryPayment: true, golferId } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-8 sm:py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-amber-600" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Payment Cancelled
          </h1>

          <p className="text-gray-600 mb-6">
            Your payment was cancelled. Don't worry - your registration has been saved.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-3">What happens now?</h2>
            <ul className="text-sm text-gray-600 text-left space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                Your registration is saved with "Pay on Day" status
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                You can pay online anytime by contacting us
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                Or pay at check-in on tournament day
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => navigate('/')}>
              Return to Home
              <ArrowRight size={16} />
            </Button>
            {golferId && (
              <Button onClick={handleTryAgain}>
                <RefreshCw size={16} />
                Try Payment Again
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};


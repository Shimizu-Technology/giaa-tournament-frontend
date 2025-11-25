import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Card } from '../components/ui';
import { CheckCircle, Clock, Trophy } from 'lucide-react';

export const RegistrationSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const registration = location.state?.registration;

  const isWaitlist = registration?.registrationStatus === 'waitlist';

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <Trophy className="text-blue-900" size={48} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900">
            Registration {isWaitlist ? 'Received' : 'Confirmed'}!
          </h1>
        </div>

        <Card>
          <div className="text-center mb-6">
            {isWaitlist ? (
              <Clock className="mx-auto text-amber-600 mb-4" size={64} />
            ) : (
              <CheckCircle className="mx-auto text-green-600 mb-4" size={64} />
            )}

            {isWaitlist ? (
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  You've Been Added to the Waitlist
                </h2>
                <p className="text-gray-600">
                  The tournament has reached capacity (160 players), but don't worry!
                  You're on our waitlist and will be notified immediately if a spot opens up.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  Your Spot is Confirmed!
                </h2>
                <p className="text-gray-600">
                  Thank you for registering for the Edward A.P. Muna II Memorial Golf Tournament.
                  A confirmation email has been sent to {registration?.email || 'your email'}.
                </p>
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-3">
            <h3 className="font-semibold text-gray-900 mb-3">Registration Details</h3>
            {registration && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-900">{registration.fullName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-gray-900">{registration.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment:</span>
                  <span className="font-medium text-gray-900">
                    {registration.paymentOption === 'pay-now' ? 'Paid Online' : 'Pay on Day'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${isWaitlist ? 'text-amber-600' : 'text-green-600'}`}>
                    {isWaitlist ? 'Waitlist' : 'Confirmed'}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              {isWaitlist ? (
                <>
                  <li>We'll email you if a spot becomes available</li>
                  <li>Keep an eye on your inbox for updates</li>
                  <li>You can contact us at 671.689.8677 for your position on the waitlist</li>
                </>
              ) : (
                <>
                  <li>Check your email for confirmation and additional details</li>
                  <li>Mark your calendar for the tournament date</li>
                  {registration?.paymentOption === 'pay-on-day' && (
                    <li>Remember to bring payment on the day of the tournament</li>
                  )}
                  <li>Arrive early for check-in on tournament day</li>
                </>
              )}
            </ul>
          </div>

          <div className="text-center">
            <Button onClick={() => navigate('/')} className="w-full sm:w-auto">
              Return to Home
            </Button>
          </div>
        </Card>

        <div className="text-center mt-8 text-gray-600">
          <p>Questions? Contact Peter Torres at 671.689.8677</p>
        </div>
      </div>
    </div>
  );
};

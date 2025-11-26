import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Card } from '../components/ui';
import { CheckCircle, Clock, Trophy } from 'lucide-react';

export const RegistrationSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const registration = location.state?.registration;
  const message = location.state?.message;
  const paymentType = location.state?.paymentType;
  const checkoutError = location.state?.checkoutError;

  const isWaitlist = registration?.registration_status === 'waitlist';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 relative overflow-hidden py-6 sm:py-12">
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23166534' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <div className="relative z-10 container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center items-center mb-3 sm:mb-4">
            <Trophy className="text-[#1e3a5f]" size={40} />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1e3a5f]">
            Registration {isWaitlist ? 'Received' : 'Confirmed'}!
          </h1>
        </div>

        <Card>
          <div className="text-center mb-4 sm:mb-6">
            {isWaitlist ? (
              <Clock className="mx-auto text-amber-600 mb-3 sm:mb-4" size={48} />
            ) : (
              <CheckCircle className="mx-auto text-green-600 mb-3 sm:mb-4" size={48} />
            )}

            {isWaitlist ? (
              <div className="space-y-2 sm:space-y-3">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                  You've Been Added to the Waitlist
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  {message || "The tournament has reached capacity (160 players), but don't worry! You're on our waitlist and will be notified immediately if a spot opens up."}
                </p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                  Your Spot is Confirmed!
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  {message || `Thank you for registering for the Edward A.P. Muna II Memorial Golf Tournament. A confirmation email has been sent to ${registration?.email || 'your email'}.`}
                </p>
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 space-y-2 sm:space-y-3">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-2 sm:mb-3">Registration Details</h3>
            {registration && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-900">{registration.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-gray-900">{registration.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment:</span>
                  <span className="font-medium text-gray-900">
                    {registration.payment_type === 'stripe' ? 'Pay Online' : 'Pay on Day'}
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

          {checkoutError && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <h3 className="font-semibold text-amber-900 text-sm sm:text-base mb-2">Payment Notice</h3>
              <p className="text-xs sm:text-sm text-amber-700">{checkoutError}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <h3 className="font-semibold text-[#1e3a5f] text-sm sm:text-base mb-2">What's Next?</h3>
            <ul className="text-xs sm:text-sm text-gray-700 space-y-1 list-disc list-inside">
              {isWaitlist ? (
                <>
                  <li>We'll email you if a spot becomes available</li>
                  <li>Keep an eye on your inbox for updates</li>
                  <li>You can contact us at 671.689.8677 for your position on the waitlist</li>
                </>
              ) : (
                <>
                  <li>Check your email for confirmation and additional details</li>
                  <li>Mark your calendar: January 9, 2026</li>
                  {(paymentType === 'pay-on-day' || registration?.payment_type === 'pay_on_day') && (
                    <li>Remember to bring payment ($125.00) on the day of the tournament</li>
                  )}
                  <li>Arrive early for check-in (Registration starts at 11:00 am)</li>
                </>
              )}
            </ul>
          </div>

          <div className="text-center">
            <Button onClick={() => navigate('/')} className="w-full sm:w-auto text-sm sm:text-base">
              Return to Home
            </Button>
          </div>
        </Card>

        <div className="text-center mt-6 sm:mt-8 text-gray-600">
          <p className="text-sm">Questions? Contact Peter Torres at 671.689.8677</p>
        </div>
      </div>
    </div>
  );
};

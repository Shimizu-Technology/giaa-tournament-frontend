import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Card } from '../components/ui';
import { CheckCircle, Clock, Trophy } from 'lucide-react';
import { api, RegistrationStatus } from '../services/api';

export const RegistrationSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const registration = location.state?.registration;
  const message = location.state?.message;
  const paymentType = location.state?.paymentType;
  const checkoutError = location.state?.checkoutError;
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus | null>(null);

  useEffect(() => {
    api.getRegistrationStatus()
      .then(setRegistrationStatus)
      .catch(console.error);
  }, []);

  const entryFee = registrationStatus?.entry_fee_dollars ?? 125;
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
          {/* Waitlist Banner - More prominent */}
          {isWaitlist && (
            <div className="bg-amber-50 border-b border-amber-200 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 mb-4 sm:mb-6 px-4 sm:px-6 py-3 sm:py-4 rounded-t-xl">
              <div className="flex items-center justify-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 bg-amber-500 rounded-full">
                  <Clock className="text-white" size={14} />
                </span>
                <span className="font-semibold text-amber-800 text-sm sm:text-base">You're on the Waitlist</span>
              </div>
            </div>
          )}

          <div className="text-center mb-4 sm:mb-6">
            {isWaitlist ? (
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <Clock className="text-amber-600" size={32} />
              </div>
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <CheckCircle className="text-green-600" size={32} />
              </div>
            )}

            {isWaitlist ? (
              <div className="space-y-2 sm:space-y-3">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                  Registration Received!
                </h2>
                <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto">
                  {message || "The tournament has reached capacity, but you're on our waitlist. We'll notify you immediately if a spot opens up!"}
                </p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                  Your Spot is Confirmed!
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  {message || "Your spot is confirmed!"}
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
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-600">Status:</span>
                  {isWaitlist ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                      Waitlist
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      Confirmed
                    </span>
                  )}
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-600">Payment:</span>
                  {registration.payment_status === 'paid' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      Paid
                    </span>
                  ) : (
                    <span className="font-medium text-gray-900">Pay on Day</span>
                  )}
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
                  <li>You can contact us at {registrationStatus?.contact_phone || '671.689.8677'} for your position on the waitlist</li>
                </>
              ) : (
                <>
                  <li>Check your email for confirmation and additional details</li>
                  <li>Mark your calendar: {registrationStatus?.event_date || 'January 9, 2026'}</li>
                  {(paymentType === 'pay-on-day' || registration?.payment_type === 'pay_on_day') && (
                    <li>Remember to bring payment (${entryFee.toFixed(2)}) on the day of the tournament</li>
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
          <p className="text-sm">Questions? Contact {registrationStatus?.contact_name || 'Peter Torres'} at {registrationStatus?.contact_phone || '671.689.8677'}</p>
        </div>
      </div>
    </div>
  );
};

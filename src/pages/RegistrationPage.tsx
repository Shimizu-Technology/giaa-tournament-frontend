import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../components/ui';
import { LiabilityWaiver } from '../components/LiabilityWaiver';
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { api } from '../services/api';

interface FormData {
  fullName: string;
  company: string;
  mailingAddress: string;
  phone: string;
  email: string;
  paymentOption: 'pay-now' | 'pay-on-day' | '';
  waiverAccepted: boolean;
}

export const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    company: '',
    mailingAddress: '',
    phone: '',
    email: '',
    paymentOption: '',
    waiverAccepted: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    setSubmitError(null);
  };

  const validateStep1 = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.mailingAddress.trim()) newErrors.mailingAddress = 'Mailing address is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.waiverAccepted) {
      newErrors.waiverAccepted = 'You must accept the liability waiver to continue';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.paymentOption) {
      newErrors.paymentOption = 'Please select a payment option';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    } else if (step === 3 && validateStep3()) {
      setStep(4);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure we're on step 4 and payment option is selected
    if (step !== 4 || !validateStep4()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Map frontend form data to backend API format
      const result = await api.registerGolfer({
        golfer: {
          name: formData.fullName,
          company: formData.company,
          address: formData.mailingAddress,
          phone: formData.phone,
          email: formData.email,
          payment_type: formData.paymentOption === 'pay-now' ? 'stripe' : 'pay_on_day' as const,
        },
        waiver_accepted: formData.waiverAccepted,
      });

      // Navigate to success page with registration data
      navigate('/registration/success', { 
        state: { 
          registration: result.golfer,
          message: result.message,
          paymentType: formData.paymentOption,
        } 
      });
    } catch (error) {
      console.error('Registration error:', error);
      setSubmitError(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-6 sm:py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center items-center mb-3 sm:mb-4">
            <Trophy className="text-blue-900" size={40} />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-900 mb-1 sm:mb-2">
            Tournament Registration
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Edward A.P. Muna II Memorial Golf Tournament
          </p>
        </div>

        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((stepNumber) => (
              <React.Fragment key={stepNumber}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm sm:text-base ${
                      step >= stepNumber
                        ? 'bg-blue-900 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {stepNumber}
                  </div>
                  <span className="text-[10px] sm:text-xs mt-1 text-gray-600">
                    {stepNumber === 1 && 'Contact'}
                    {stepNumber === 2 && 'Details'}
                    {stepNumber === 3 && 'Waiver'}
                    {stepNumber === 4 && 'Payment'}
                  </span>
                </div>
                {stepNumber < 4 && (
                  <div
                    className={`flex-1 h-0.5 sm:h-1 mx-1 sm:mx-2 ${
                      step > stepNumber ? 'bg-blue-900' : 'bg-gray-300'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Contact Information
                </h2>
                <Input
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  error={errors.fullName}
                  required
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                />
                <Input
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  placeholder="671-123-4567"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  required
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Additional Details
                </h2>
                <Input
                  label="Company/Organization (Optional)"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                />
                <Input
                  label="Mailing Address"
                  name="mailingAddress"
                  value={formData.mailingAddress}
                  onChange={handleChange}
                  error={errors.mailingAddress}
                  required
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Liability Waiver
                </h2>
                <LiabilityWaiver />
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="waiverAccepted"
                    name="waiverAccepted"
                    checked={formData.waiverAccepted}
                    onChange={handleChange}
                    className="mt-1 w-5 h-5 text-blue-900 border-gray-300 rounded focus:ring-blue-900"
                  />
                  <label htmlFor="waiverAccepted" className="text-sm text-gray-700 font-medium">
                    I have read and agree to the Liability Waiver. I understand the risks
                    associated with participating in this golf tournament.
                  </label>
                </div>
                {errors.waiverAccepted && (
                  <p className="text-sm text-red-600">{errors.waiverAccepted}</p>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Payment Selection
                </h2>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                  <p className="text-base sm:text-lg font-semibold text-gray-900">
                    Entry Fee: $125.00
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    Includes Green Fee, Ditty Bag, Drinks & Food on the Course
                  </p>
                </div>

                <div className="space-y-3">
                  <label className={`flex items-start gap-3 p-3 sm:p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${formData.paymentOption === 'pay-now' ? 'border-blue-900 bg-blue-50' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      name="paymentOption"
                      value="pay-now"
                      checked={formData.paymentOption === 'pay-now'}
                      onChange={handleChange}
                      className="mt-0.5 w-4 h-4 sm:w-5 sm:h-5 text-blue-900 flex-shrink-0"
                    />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">Pay Now (Stripe)</p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Secure payment via credit card. Your spot will be confirmed immediately.
                      </p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 p-3 sm:p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${formData.paymentOption === 'pay-on-day' ? 'border-blue-900 bg-blue-50' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      name="paymentOption"
                      value="pay-on-day"
                      checked={formData.paymentOption === 'pay-on-day'}
                      onChange={handleChange}
                      className="mt-0.5 w-4 h-4 sm:w-5 sm:h-5 text-blue-900 flex-shrink-0"
                    />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">Pay on Day of Tournament</p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Pay by cash, check (payable to GIAAEO), or credit card at check-in.
                      </p>
                    </div>
                  </label>
                </div>

                {errors.paymentOption && (
                  <p className="text-sm text-red-600">{errors.paymentOption}</p>
                )}

                {submitError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {submitError}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between gap-3 mt-6 sm:mt-8">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="min-w-[100px] sm:min-w-[120px] text-sm sm:text-base"
                >
                  <ChevronLeft size={16} />
                  Back
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="min-w-[100px] sm:min-w-[120px] text-sm sm:text-base"
                >
                  Cancel
                </Button>
              )}

              {step < 4 ? (
                <Button 
                  type="button" 
                  onClick={handleNext} 
                  disabled={step === 3 && !formData.waiverAccepted}
                  className="min-w-[100px] sm:min-w-[120px] text-sm sm:text-base"
                >
                  Next
                  <ChevronRight size={16} />
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting} className="min-w-[100px] sm:min-w-[120px] text-sm sm:text-base">
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                  <ChevronRight size={16} />
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

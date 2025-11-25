import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../components/ui';
import { LiabilityWaiver } from '../components/LiabilityWaiver';
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { RegistrationFormData } from '../types';

export const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: '',
    company: '',
    mailingAddress: '',
    phone: '',
    mobile: '',
    email: '',
    paymentOption: 'pay-now',
    waiverAccepted: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationFormData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name as keyof RegistrationFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateStep1 = () => {
    const newErrors: Partial<Record<keyof RegistrationFormData, string>> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.mobile.trim()) newErrors.mobile = 'Mobile is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Partial<Record<keyof RegistrationFormData, string>> = {};
    if (!formData.company.trim()) newErrors.company = 'Company/Organization is required';
    if (!formData.mailingAddress.trim()) newErrors.mailingAddress = 'Mailing address is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Partial<Record<keyof RegistrationFormData, string>> = {};
    if (!formData.waiverAccepted) {
      newErrors.waiverAccepted = 'You must accept the liability waiver to continue';
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

    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      navigate('/registration/success', { state: { registration: data } });
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <Trophy className="text-blue-900" size={48} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2">
            Tournament Registration
          </h1>
          <p className="text-gray-600">
            Edward A.P. Muna II Memorial Golf Tournament
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((stepNumber) => (
              <React.Fragment key={stepNumber}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step >= stepNumber
                        ? 'bg-blue-900 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {stepNumber}
                  </div>
                  <span className="text-xs mt-1 text-gray-600">
                    {stepNumber === 1 && 'Contact'}
                    {stepNumber === 2 && 'Details'}
                    {stepNumber === 3 && 'Waiver'}
                    {stepNumber === 4 && 'Payment'}
                  </span>
                </div>
                {stepNumber < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
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
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    required
                  />
                  <Input
                    label="Mobile"
                    name="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={handleChange}
                    error={errors.mobile}
                    required
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Additional Details
                </h2>
                <Input
                  label="Company/Organization"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  error={errors.company}
                  required
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Payment Selection
                </h2>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <p className="text-lg font-semibold text-gray-900">
                    Entry Fee: $125.00
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Includes Green Fee, Ditty Bag, Drinks & Food on the Course
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentOption"
                      value="pay-now"
                      checked={formData.paymentOption === 'pay-now'}
                      onChange={handleChange}
                      className="mt-1 w-5 h-5 text-blue-900"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">Pay Now (Stripe)</p>
                      <p className="text-sm text-gray-600">
                        Secure payment via credit card. Your spot will be confirmed immediately.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentOption"
                      value="pay-on-day"
                      checked={formData.paymentOption === 'pay-on-day'}
                      onChange={handleChange}
                      className="mt-1 w-5 h-5 text-blue-900"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">Pay on Day of Tournament</p>
                      <p className="text-sm text-gray-600">
                        Pay by cash, check (payable to GIAAEO), or credit card at check-in.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                >
                  <ChevronLeft size={20} className="mr-1" />
                  Back
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                >
                  Cancel
                </Button>
              )}

              {step < 4 ? (
                <Button type="button" onClick={handleNext}>
                  Next
                  <ChevronRight size={20} className="ml-1" />
                </Button>
              ) : (
                <Button type="submit">
                  Complete Registration
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

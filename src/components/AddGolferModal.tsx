import React, { useState } from 'react';
import { X, UserPlus, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface AddGolferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tournamentName?: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  payment_type: 'stripe' | 'pay_on_day';
  payment_status: 'paid' | 'unpaid';
  notes: string;
  waiverAccepted: boolean;
}

export const AddGolferModal: React.FC<AddGolferModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  tournamentName = 'Edward A.P. Muna II Memorial Golf Tournament',
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    payment_type: 'pay_on_day',
    payment_status: 'unpaid',
    notes: '',
    waiverAccepted: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWaiver, setShowWaiver] = useState(false);

  // Format phone number as user types
  const formatPhoneNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    
    let cleanDigits = digits;
    if (digits.startsWith('1') && digits.length > 10) {
      cleanDigits = digits.slice(1);
    }
    cleanDigits = cleanDigits.slice(0, 10);
    
    if (cleanDigits.length <= 3) {
      return cleanDigits;
    } else if (cleanDigits.length <= 6) {
      return `(${cleanDigits.slice(0, 3)}) ${cleanDigits.slice(3)}`;
    } else {
      return `(${cleanDigits.slice(0, 3)}) ${cleanDigits.slice(3, 6)}-${cleanDigits.slice(6)}`;
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    let processedValue = value;
    if (name === 'phone') {
      processedValue = formatPhoneNumber(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : processedValue,
    }));

    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.waiverAccepted) {
      newErrors.waiverAccepted = 'Waiver must be accepted';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await api.registerGolfer({
        golfer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company || undefined,
          address: formData.address,
          payment_type: formData.payment_type,
          payment_status: formData.payment_status,
          notes: formData.notes || undefined,
        },
        waiver_accepted: formData.waiverAccepted,
      });

      toast.success(`${formData.name} registered successfully!`);
      resetForm();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      address: '',
      payment_type: 'pay_on_day',
      payment_status: 'unpaid',
      notes: '',
      waiverAccepted: false,
    });
    setErrors({});
    setShowWaiver(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <UserPlus className="text-blue-900" size={20} />
            <h3 className="text-lg font-bold text-gray-900">Add Golfer</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 space-y-4">
            {/* Contact Info Section */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Contact Information
              </h4>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    +1
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`flex-1 px-3 py-2 border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="(671) 123-4567"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Additional Details Section */}
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Additional Details
              </h4>

              {/* Company */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company/Organization
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                  placeholder="Optional"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mailing Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="123 Main St, Tamuning, GU 96913"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                )}
              </div>
            </div>

            {/* Payment Section */}
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Payment
              </h4>

              <div className="grid grid-cols-2 gap-3">
                {/* Payment Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    name="payment_type"
                    value={formData.payment_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white"
                  >
                    <option value="pay_on_day">Pay on Day</option>
                    <option value="stripe">Online (Stripe)</option>
                  </select>
                </div>

                {/* Payment Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    name="payment_status"
                    value={formData.payment_status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 resize-none"
                placeholder="Optional admin notes..."
              />
            </div>

            {/* Waiver Section */}
            <div className="pt-2 space-y-3">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Liability Waiver
              </h4>

              {/* Collapsible Waiver Text */}
              <button
                type="button"
                onClick={() => setShowWaiver(!showWaiver)}
                className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <span>View Waiver Text</span>
                {showWaiver ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {showWaiver && (
                <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 max-h-32 overflow-y-auto border border-gray-200">
                  <p className="font-semibold mb-2">WAIVER OF LIABILITY AND ASSUMPTION OF RISK</p>
                  <p className="mb-2">
                    In consideration of being permitted to participate in the {tournamentName}, I hereby waive, release, and discharge any and all
                    claims for damages for death, personal injury, or property damage which I may
                    have, or which may hereafter accrue to me, against the Guam International
                    Airport Authority, its officers, employees, and agents.
                  </p>
                  <p className="mb-2">
                    I acknowledge that golf is a potentially hazardous activity that could cause
                    injury or death. I voluntarily assume full responsibility for any risks of
                    loss, property damage, or personal injury that may be sustained as a result
                    of participating in this tournament.
                  </p>
                  <p>
                    I agree to abide by all rules and regulations of the tournament and the golf
                    course. I certify that I am physically fit and have no medical conditions
                    that would prevent my participation.
                  </p>
                </div>
              )}

              {/* Waiver Checkbox */}
              <div
                className={`flex items-start gap-3 p-3 rounded-lg border-2 ${
                  errors.waiverAccepted
                    ? 'border-red-300 bg-red-50'
                    : formData.waiverAccepted
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  id="waiverAccepted"
                  name="waiverAccepted"
                  checked={formData.waiverAccepted}
                  onChange={handleChange}
                  className="mt-0.5 w-5 h-5 text-blue-900 border-gray-300 rounded focus:ring-blue-900"
                />
                <label
                  htmlFor="waiverAccepted"
                  className="text-sm text-gray-700 font-medium cursor-pointer"
                >
                  Golfer has read and agrees to the Liability Waiver
                </label>
              </div>
              {errors.waiverAccepted && (
                <p className="text-sm text-red-600">{errors.waiverAccepted}</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 lg:px-6 py-4 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting || !formData.waiverAccepted}
            >
              {isSubmitting ? 'Adding...' : 'Add Golfer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};


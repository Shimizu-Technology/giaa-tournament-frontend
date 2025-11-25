import React, { useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { Card, Button, Input, Select } from '../components/ui';
import { Search, CheckCircle, DollarSign, User } from 'lucide-react';
import { Golfer, CheckInPayment } from '../types';

const mockGolfers: Golfer[] = [
  {
    id: '1',
    fullName: 'John Doe',
    company: 'ABC Corp',
    mailingAddress: '123 Main St',
    phone: '671-123-4567',
    mobile: '671-234-5678',
    email: 'john@example.com',
    paymentOption: 'pay-now',
    paymentStatus: 'paid',
    registrationStatus: 'confirmed',
    checkedIn: false,
    groupNumber: 1,
    groupPosition: '1A',
    holeAssignment: 1,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    fullName: 'Jane Smith',
    company: 'XYZ Inc',
    mailingAddress: '456 Oak Ave',
    phone: '671-234-5678',
    mobile: '671-345-6789',
    email: 'jane@example.com',
    paymentOption: 'pay-on-day',
    paymentStatus: 'unpaid',
    registrationStatus: 'confirmed',
    checkedIn: false,
    groupNumber: 1,
    groupPosition: '1B',
    holeAssignment: 1,
    createdAt: '2024-01-15T11:00:00Z',
  },
];

export const CheckInPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGolfer, setSelectedGolfer] = useState<Golfer | null>(null);
  const [golfers, setGolfers] = useState<Golfer[]>(mockGolfers);
  const [paymentInfo, setPaymentInfo] = useState<CheckInPayment>({
    method: 'cash',
    receiptNumber: '',
    notes: '',
  });

  const searchResults = searchTerm
    ? golfers.filter(
        (g) =>
          g.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          g.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          g.phone.includes(searchTerm) ||
          g.mobile.includes(searchTerm)
      )
    : [];

  const handleSelectGolfer = (golfer: Golfer) => {
    setSelectedGolfer(golfer);
    setSearchTerm('');
    setPaymentInfo({
      method: 'cash',
      receiptNumber: '',
      notes: '',
    });
  };

  const handleCheckIn = () => {
    if (!selectedGolfer) return;

    const updatedGolfers = golfers.map((g) =>
      g.id === selectedGolfer.id
        ? {
            ...g,
            checkedIn: true,
            paymentStatus: selectedGolfer.paymentOption === 'pay-on-day' ? 'paid' : g.paymentStatus,
          }
        : g
    );

    setGolfers(updatedGolfers);
    setSelectedGolfer(null);
    setPaymentInfo({
      method: 'cash',
      receiptNumber: '',
      notes: '',
    });
  };

  const handleClearSelection = () => {
    setSelectedGolfer(null);
    setSearchTerm('');
  };

  const recentCheckIns = golfers.filter((g) => g.checkedIn).slice(0, 5);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Player Check-In</h1>
          <div className="text-right">
            <p className="text-sm text-gray-600">Checked In</p>
            <p className="text-2xl font-bold text-green-600">
              {golfers.filter(g => g.checkedIn).length} / {golfers.length}
            </p>
          </div>
        </div>

        <Card className="lg:max-w-3xl lg:mx-auto">
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                Search Player
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-4 text-gray-400" size={24} />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                  autoFocus
                />
              </div>

              {searchTerm && searchResults.length > 0 && (
                <div className="mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {searchResults.map((golfer) => (
                    <button
                      key={golfer.id}
                      onClick={() => handleSelectGolfer(golfer)}
                      className="w-full text-left p-4 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 text-lg">
                            {golfer.fullName}
                          </p>
                          <p className="text-sm text-gray-600">{golfer.email}</p>
                          <p className="text-sm text-gray-600">{golfer.mobile}</p>
                        </div>
                        {golfer.checkedIn && (
                          <CheckCircle className="text-green-600" size={24} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searchTerm && searchResults.length === 0 && (
                <div className="mt-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-amber-800">No players found matching your search.</p>
                </div>
              )}
            </div>

            {selectedGolfer && (
              <div className="border-t-2 border-gray-200 pt-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-4 rounded-full">
                      <User className="text-blue-900" size={32} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedGolfer.fullName}
                      </h2>
                      <p className="text-gray-600">{selectedGolfer.company}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleClearSelection}
                    className="text-gray-500 hover:text-gray-700 px-4 py-2"
                  >
                    Clear
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p className="font-medium text-gray-900">{selectedGolfer.email}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Mobile</p>
                    <p className="font-medium text-gray-900">{selectedGolfer.mobile}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Group</p>
                    <p className="font-medium text-gray-900">
                      {selectedGolfer.groupPosition || 'Not Assigned'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Hole Assignment</p>
                    <p className="font-medium text-gray-900">
                      {selectedGolfer.holeAssignment ? `Hole ${selectedGolfer.holeAssignment}` : 'Not Assigned'}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className={`p-4 rounded-lg border-2 ${
                    selectedGolfer.paymentStatus === 'paid'
                      ? 'bg-green-50 border-green-500'
                      : 'bg-amber-50 border-amber-500'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign size={24} className={
                        selectedGolfer.paymentStatus === 'paid'
                          ? 'text-green-600'
                          : 'text-amber-600'
                      } />
                      <p className="font-semibold text-lg">Payment Status</p>
                    </div>
                    <p className={`text-lg font-bold ${
                      selectedGolfer.paymentStatus === 'paid'
                        ? 'text-green-600'
                        : 'text-amber-600'
                    }`}>
                      {selectedGolfer.paymentStatus === 'paid' ? 'PAID' : 'PAYMENT REQUIRED'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedGolfer.paymentOption === 'pay-now'
                        ? 'Paid online'
                        : 'Pay on day of tournament'}
                    </p>
                  </div>
                </div>

                {selectedGolfer.paymentOption === 'pay-on-day' && selectedGolfer.paymentStatus === 'unpaid' && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      Collect Payment ($125.00)
                    </h3>

                    <Select
                      label="Payment Method"
                      value={paymentInfo.method}
                      onChange={(e) =>
                        setPaymentInfo({ ...paymentInfo, method: e.target.value as CheckInPayment['method'] })
                      }
                      options={[
                        { value: 'cash', label: 'Cash' },
                        { value: 'check', label: 'Check (payable to GIAAEO)' },
                        { value: 'credit', label: 'Credit Card' },
                      ]}
                    />

                    <Input
                      label="Receipt Number"
                      value={paymentInfo.receiptNumber}
                      onChange={(e) =>
                        setPaymentInfo({ ...paymentInfo, receiptNumber: e.target.value })
                      }
                      placeholder="Enter receipt number"
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={paymentInfo.notes}
                        onChange={(e) =>
                          setPaymentInfo({ ...paymentInfo, notes: e.target.value })
                        }
                        placeholder="Any additional notes..."
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                        rows={2}
                      />
                    </div>
                  </div>
                )}

                {selectedGolfer.checkedIn ? (
                  <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 text-center">
                    <CheckCircle className="mx-auto text-green-600 mb-3" size={48} />
                    <p className="text-xl font-bold text-green-600">
                      Already Checked In
                    </p>
                  </div>
                ) : (
                  <Button
                    onClick={handleCheckIn}
                    className="w-full py-4 text-lg"
                    size="lg"
                  >
                    <CheckCircle size={24} className="mr-2" />
                    Mark as Checked In
                  </Button>
                )}
              </div>
            )}
          </div>
        </Card>

        {recentCheckIns.length > 0 && (
          <Card className="lg:max-w-3xl lg:mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Recent Check-Ins
            </h2>
            <div className="space-y-2">
              {recentCheckIns.map((golfer) => (
                <div
                  key={golfer.id}
                  className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{golfer.fullName}</p>
                    <p className="text-sm text-gray-600">{golfer.groupPosition}</p>
                  </div>
                  <CheckCircle className="text-green-600" size={24} />
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

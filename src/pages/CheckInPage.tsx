import React, { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { Card, Button, Input, Select } from '../components/ui';
import { Search, CheckCircle, DollarSign, User, RefreshCw, X, UserCheck, CreditCard, Users } from 'lucide-react';
import { api, Golfer, GolferStats } from '../services/api';

interface PaymentInfo {
  method: 'cash' | 'check' | 'credit';
  receiptNumber: string;
  notes: string;
}

type CheckInQueue = 'paid' | 'unpaid' | 'checked-in' | 'all';

// Player detail content - extracted to avoid re-render issues
const PlayerDetailPanel: React.FC<{
  golfer: Golfer;
  paymentInfo: PaymentInfo;
  setPaymentInfo: React.Dispatch<React.SetStateAction<PaymentInfo>>;
  isProcessing: boolean;
  onCheckIn: () => void;
  onRecordPayment: () => void;
  onClose: () => void;
  showCloseButton?: boolean;
}> = ({ golfer, paymentInfo, setPaymentInfo, isProcessing, onCheckIn, onRecordPayment, onClose, showCloseButton = true }) => {
  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center gap-3 lg:gap-4">
        <div className={`p-3 lg:p-4 rounded-full ${
          golfer.checked_in 
            ? 'bg-blue-100' 
            : golfer.payment_status === 'paid' 
            ? 'bg-green-100' 
            : 'bg-amber-100'
        }`}>
          <User className={
            golfer.checked_in 
              ? 'text-blue-600' 
              : golfer.payment_status === 'paid' 
              ? 'text-green-600' 
              : 'text-amber-600'
          } size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 truncate">
            {golfer.name}
          </h2>
          <p className="text-sm text-gray-600 truncate">{golfer.company || '-'}</p>
        </div>
        {showCloseButton && (
          <button
            onClick={onClose}
            className="hidden lg:block text-gray-400 hover:text-gray-600 p-1 touch-manipulation"
          >
            <X size={24} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Email</p>
          <p className="font-medium text-gray-900 text-sm truncate">{golfer.email}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Phone</p>
          <p className="font-medium text-gray-900 text-sm">{golfer.phone || '-'}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Group</p>
          <p className="font-medium text-gray-900 text-sm">
            {golfer.group_position_label || 'Not Assigned'}
          </p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Hole</p>
          <p className="font-medium text-gray-900 text-sm">
            {golfer.hole_number ? `Hole ${golfer.hole_number}` : 'Not Assigned'}
          </p>
        </div>
      </div>

      {golfer.checked_in ? (
        <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4 lg:p-6 text-center">
          <CheckCircle className="mx-auto text-blue-600 mb-2" size={40} />
          <p className="text-lg font-bold text-blue-600">
            Already Checked In
          </p>
        </div>
      ) : golfer.payment_status === 'paid' ? (
        <>
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-3 lg:p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={20} className="text-green-600" />
              <p className="font-semibold text-green-800">Payment Complete</p>
            </div>
            <p className="text-sm text-green-700">
              {golfer.payment_type === 'stripe' ? 'Paid online via Stripe' : 'Payment has been recorded'}
            </p>
          </div>

          <Button
            onClick={onCheckIn}
            className="w-full py-3 lg:py-4 text-base lg:text-lg bg-green-600 hover:bg-green-700"
            size="lg"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <RefreshCw size={20} className="mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle size={20} className="mr-2" />
                Check In Player
              </>
            )}
          </Button>
        </>
      ) : (
        <>
          <div className="bg-amber-50 border-2 border-amber-500 rounded-lg p-3 lg:p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign size={20} className="text-amber-600" />
              <p className="font-semibold text-amber-800">Payment Required</p>
            </div>
            <p className="text-sm text-amber-700">
              Collect $125.00 before checking in
            </p>
          </div>

          <div className="p-3 lg:p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3 lg:space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <CreditCard size={18} />
              Record Payment
            </h3>

            <Select
              label="Payment Method"
              value={paymentInfo.method}
              onChange={(e) =>
                setPaymentInfo(prev => ({ ...prev, method: e.target.value as PaymentInfo['method'] }))
              }
              options={[
                { value: 'cash', label: 'Cash' },
                { value: 'check', label: 'Check' },
                { value: 'credit', label: 'Credit Card' },
              ]}
            />

            <Input
              label="Receipt Number"
              value={paymentInfo.receiptNumber}
              onChange={(e) =>
                setPaymentInfo(prev => ({ ...prev, receiptNumber: e.target.value }))
              }
              placeholder="Enter receipt #"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={paymentInfo.notes}
                onChange={(e) =>
                  setPaymentInfo(prev => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Any notes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm"
                rows={2}
              />
            </div>

            <Button
              onClick={onRecordPayment}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <RefreshCw size={18} className="mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign size={18} className="mr-2" />
                  Mark as Paid ($125)
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export const CheckInPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGolfer, setSelectedGolfer] = useState<Golfer | null>(null);
  const [golfers, setGolfers] = useState<Golfer[]>([]);
  const [stats, setStats] = useState<GolferStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeQueue, setActiveQueue] = useState<CheckInQueue>('paid');
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    method: 'cash',
    receiptNumber: '',
    notes: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [golfersResponse, statsResponse] = await Promise.all([
        api.getGolfers({ per_page: 1000 }),
        api.getGolferStats(),
      ]);
      setGolfers(golfersResponse.golfers);
      setStats(statsResponse);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-hide success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Calculate counts
  const counts = useMemo(() => {
    const pending = golfers.filter(g => !g.checked_in);
    return {
      total: golfers.length,
      checkedIn: golfers.filter(g => g.checked_in).length,
      paidPending: pending.filter(g => g.payment_status === 'paid').length,
      unpaidPending: pending.filter(g => g.payment_status === 'unpaid').length,
    };
  }, [golfers]);

  // Filter golfers based on active queue and search
  const filteredGolfers = useMemo(() => {
    let filtered = golfers;

    switch (activeQueue) {
      case 'paid':
        filtered = filtered.filter(g => !g.checked_in && g.payment_status === 'paid');
        break;
      case 'unpaid':
        filtered = filtered.filter(g => !g.checked_in && g.payment_status === 'unpaid');
        break;
      case 'checked-in':
        filtered = filtered.filter(g => g.checked_in);
        break;
      case 'all':
        break;
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(g =>
        g.name?.toLowerCase().includes(search) ||
        g.email?.toLowerCase().includes(search) ||
        g.phone?.includes(searchTerm) ||
        g.company?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [golfers, searchTerm, activeQueue]);

  const handleSelectGolfer = (golfer: Golfer) => {
    setSelectedGolfer(golfer);
    setPaymentInfo({
      method: 'cash',
      receiptNumber: '',
      notes: '',
    });
  };

  const handleRecordPayment = async () => {
    if (!selectedGolfer) return;

    try {
      setIsProcessing(true);
      setError(null);

      await api.addPaymentDetails(selectedGolfer.id, {
        payment_method: paymentInfo.method,
        receipt_number: paymentInfo.receiptNumber,
        payment_notes: paymentInfo.notes,
      });
      
      setSuccessMessage(`Payment recorded for ${selectedGolfer.name}!`);
      
      await fetchData();
      
      // Update the selected golfer to show paid status
      setSelectedGolfer(prev => prev ? { ...prev, payment_status: 'paid' } : null);
      
      setPaymentInfo({
        method: 'cash',
        receiptNumber: '',
        notes: '',
      });
    } catch (err) {
      console.error('Error recording payment:', err);
      setError(err instanceof Error ? err.message : 'Failed to record payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckIn = async () => {
    if (!selectedGolfer) return;

    try {
      setIsProcessing(true);
      setError(null);

      await api.checkInGolfer(selectedGolfer.id);
      
      setSuccessMessage(`${selectedGolfer.name} checked in successfully!`);
      
      await fetchData();
      
      setSelectedGolfer(null);
    } catch (err) {
      console.error('Error during check-in:', err);
      setError(err instanceof Error ? err.message : 'Failed to check in golfer');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedGolfer(null);
  };

  const getQueueTitle = () => {
    switch (activeQueue) {
      case 'paid': return 'Paid';
      case 'unpaid': return 'Not Paid';
      case 'checked-in': return 'Checked In';
      case 'all': return 'All Players';
    }
  };

  const getQueueDescription = () => {
    switch (activeQueue) {
      case 'paid': return 'Ready for quick check-in';
      case 'unpaid': return 'Collect payment first';
      case 'checked-in': return 'Already checked in';
      case 'all': return 'All registered players';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2 text-gray-600">
            <RefreshCw className="animate-spin" size={24} />
            <span>Loading...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Player Check-In</h1>
            <p className="text-xs lg:text-sm text-gray-500 mt-1">
              {counts.checkedIn} of {counts.total} checked in
            </p>
          </div>
          <Button variant="outline" onClick={fetchData} className="text-sm lg:text-base">
            <RefreshCw size={18} className="mr-2" />
            Refresh
          </Button>
        </div>

        {/* Queue Selection - 2x2 grid on mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
          {/* Paid Queue - Green */}
          <button
            onClick={() => setActiveQueue('paid')}
            className={`p-3 lg:p-4 rounded-lg border-2 transition-all touch-manipulation ${
              activeQueue === 'paid' 
                ? 'border-green-500 ring-2 ring-green-200 bg-green-50' 
                : 'border-gray-200 hover:border-green-200 bg-white'
            }`}
          >
            <div className="flex items-center gap-2 lg:gap-3">
              <div className={`p-2 lg:p-3 rounded-full ${activeQueue === 'paid' ? 'bg-green-500' : 'bg-green-100'}`}>
                <CheckCircle className={activeQueue === 'paid' ? 'text-white' : 'text-green-600'} size={18} />
              </div>
              <div className="text-left">
                <p className="text-[10px] lg:text-xs font-medium text-green-700 uppercase">Paid</p>
                <p className="text-xl lg:text-2xl font-bold text-green-600">{counts.paidPending}</p>
              </div>
            </div>
          </button>

          {/* Unpaid Queue - Amber */}
          <button
            onClick={() => setActiveQueue('unpaid')}
            className={`p-3 lg:p-4 rounded-lg border-2 transition-all touch-manipulation ${
              activeQueue === 'unpaid' 
                ? 'border-amber-500 ring-2 ring-amber-200 bg-amber-50' 
                : 'border-gray-200 hover:border-amber-200 bg-white'
            }`}
          >
            <div className="flex items-center gap-2 lg:gap-3">
              <div className={`p-2 lg:p-3 rounded-full ${activeQueue === 'unpaid' ? 'bg-amber-500' : 'bg-amber-100'}`}>
                <CreditCard className={activeQueue === 'unpaid' ? 'text-white' : 'text-amber-600'} size={18} />
              </div>
              <div className="text-left">
                <p className="text-[10px] lg:text-xs font-medium text-amber-700 uppercase">Not Paid</p>
                <p className="text-xl lg:text-2xl font-bold text-amber-600">{counts.unpaidPending}</p>
              </div>
            </div>
          </button>

          {/* Checked In - Blue */}
          <button
            onClick={() => setActiveQueue('checked-in')}
            className={`p-3 lg:p-4 rounded-lg border-2 transition-all touch-manipulation ${
              activeQueue === 'checked-in' 
                ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-200 bg-white'
            }`}
          >
            <div className="flex items-center gap-2 lg:gap-3">
              <div className={`p-2 lg:p-3 rounded-full ${activeQueue === 'checked-in' ? 'bg-blue-500' : 'bg-blue-100'}`}>
                <UserCheck className={activeQueue === 'checked-in' ? 'text-white' : 'text-blue-600'} size={18} />
              </div>
              <div className="text-left">
                <p className="text-[10px] lg:text-xs font-medium text-blue-700 uppercase">Checked In</p>
                <p className="text-xl lg:text-2xl font-bold text-blue-600">{counts.checkedIn}</p>
              </div>
            </div>
          </button>

          {/* All Players - Gray */}
          <button
            onClick={() => setActiveQueue('all')}
            className={`p-3 lg:p-4 rounded-lg border-2 transition-all touch-manipulation ${
              activeQueue === 'all' 
                ? 'border-gray-500 ring-2 ring-gray-200 bg-gray-50' 
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-center gap-2 lg:gap-3">
              <div className={`p-2 lg:p-3 rounded-full ${activeQueue === 'all' ? 'bg-gray-500' : 'bg-gray-100'}`}>
                <Users className={activeQueue === 'all' ? 'text-white' : 'text-gray-600'} size={18} />
              </div>
              <div className="text-left">
                <p className="text-[10px] lg:text-xs font-medium text-gray-700 uppercase">All</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-600">{counts.total}</p>
              </div>
            </div>
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-3 lg:px-4 py-2 lg:py-3 rounded-lg flex items-center gap-2 animate-fade-in text-sm">
            <CheckCircle size={18} />
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-sm">
            {error}
            <button onClick={() => setError(null)} className="ml-2 text-red-500 hover:text-red-700">×</button>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Player List */}
          <Card className="p-3 lg:p-6">
            <div className="space-y-3 lg:space-y-4">
              <div>
                <h2 className="text-lg lg:text-xl font-bold text-gray-900">
                  {getQueueTitle()}
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({filteredGolfers.length})
                  </span>
                </h2>
                <p className="text-xs lg:text-sm text-gray-500 mt-1">{getQueueDescription()}</p>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 lg:top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search name, email, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 lg:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 text-sm lg:text-base"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-2.5 lg:top-3 text-gray-400 hover:text-gray-600"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Player List */}
              <div className="space-y-2 max-h-[40vh] lg:max-h-[calc(100vh-480px)] overflow-y-auto">
                {filteredGolfers.length === 0 ? (
                  <div className="text-center py-6 lg:py-8 text-gray-500 text-sm">
                    {searchTerm ? 'No players found.' : 'No players in this queue.'}
                  </div>
                ) : (
                  filteredGolfers.map((golfer) => (
                    <button
                      key={golfer.id}
                      onClick={() => handleSelectGolfer(golfer)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all touch-manipulation ${
                        selectedGolfer?.id === golfer.id
                          ? 'border-blue-500 bg-blue-50'
                          : golfer.checked_in
                          ? 'border-green-200 bg-green-50 hover:border-green-300'
                          : golfer.payment_status === 'paid'
                          ? 'border-green-200 hover:border-green-300 hover:bg-green-50'
                          : 'border-amber-200 hover:border-amber-300 hover:bg-amber-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-gray-900 text-sm lg:text-base truncate">
                              {golfer.name}
                            </p>
                            {golfer.checked_in ? (
                              <span className="text-[10px] lg:text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle size={10} /> Done
                              </span>
                            ) : golfer.payment_status === 'paid' ? (
                              <span className="text-[10px] lg:text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                                Paid
                              </span>
                            ) : (
                              <span className="text-[10px] lg:text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                                Unpaid
                              </span>
                            )}
                          </div>
                          <p className="text-xs lg:text-sm text-gray-600 truncate">{golfer.email}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] lg:text-xs text-gray-500">
                              {golfer.group_position_label || 'No group'}
                            </span>
                            {golfer.company && (
                              <span className="text-[10px] lg:text-xs text-gray-500 truncate">• {golfer.company}</span>
                            )}
                          </div>
                        </div>
                        {golfer.checked_in ? (
                          <CheckCircle className="text-blue-600 flex-shrink-0" size={20} />
                        ) : golfer.payment_status === 'paid' ? (
                          <div className="w-5 h-5 border-2 border-green-400 rounded-full flex-shrink-0 bg-green-50" />
                        ) : (
                          <DollarSign className="text-amber-500 flex-shrink-0" size={20} />
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </Card>

          {/* Desktop: Player Detail Panel */}
          <Card className="hidden lg:block p-6">
            {selectedGolfer ? (
              <PlayerDetailPanel
                golfer={selectedGolfer}
                paymentInfo={paymentInfo}
                setPaymentInfo={setPaymentInfo}
                isProcessing={isProcessing}
                onCheckIn={handleCheckIn}
                onRecordPayment={handleRecordPayment}
                onClose={handleClearSelection}
                showCloseButton={true}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <div className={`p-6 rounded-full mb-4 ${
                  activeQueue === 'paid' ? 'bg-green-100' : 
                  activeQueue === 'unpaid' ? 'bg-amber-100' : 'bg-gray-100'
                }`}>
                  {activeQueue === 'paid' ? (
                    <UserCheck className="text-green-500" size={48} />
                  ) : activeQueue === 'unpaid' ? (
                    <CreditCard className="text-amber-500" size={48} />
                  ) : (
                    <User className="text-gray-400" size={48} />
                  )}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeQueue === 'paid' ? 'Paid Players' : activeQueue === 'unpaid' ? 'Unpaid Players' : 'Select a Player'}
                </h3>
                <p className="text-gray-500 max-w-xs">
                  {activeQueue === 'paid' 
                    ? 'Select a player for quick check-in (payment complete)'
                    : activeQueue === 'unpaid'
                    ? 'Select a player to collect payment and check them in'
                    : 'Click on a player from the list to view details'
                  }
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Mobile: Full-screen Modal for Player Details */}
        {selectedGolfer && (
          <div className="lg:hidden fixed inset-0 z-[60] flex flex-col bg-white animate-slide-up">
            {/* Modal Header */}
            <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Player Details</h3>
              <button 
                onClick={handleClearSelection}
                className="p-2 rounded-full hover:bg-gray-100 touch-manipulation -mr-1"
              >
                <X size={22} />
              </button>
            </div>
            
            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 pb-8">
              <PlayerDetailPanel
                golfer={selectedGolfer}
                paymentInfo={paymentInfo}
                setPaymentInfo={setPaymentInfo}
                isProcessing={isProcessing}
                onCheckIn={handleCheckIn}
                onRecordPayment={handleRecordPayment}
                onClose={handleClearSelection}
                showCloseButton={false}
              />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

import React, { useState, useMemo, useEffect } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { Card, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Select } from '../components/ui';
import { Search, Download, RefreshCw, ChevronDown, ChevronUp, X, User, Mail, Phone, Building2, Users, MapPin, CheckCircle, CreditCard, FileText, Trash2, UserPlus, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { api, Golfer, GolferStats } from '../services/api';
import { AddGolferModal } from '../components/AddGolferModal';

// Format date for display (uses browser's locale which respects timezone)
const formatRegistrationDate = (dateString: string) => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      timeZone: 'Pacific/Guam'
    }),
    time: date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true,
      timeZone: 'Pacific/Guam'
    }),
  };
};

export const AdminDashboard: React.FC = () => {
  const [golfers, setGolfers] = useState<Golfer[]>([]);
  const [stats, setStats] = useState<GolferStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [checkinFilter, setCheckinFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [holeFilter, setHoleFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGolfer, setSelectedGolfer] = useState<Golfer | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

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

  const filteredGolfers = useMemo(() => {
    return golfers.filter((golfer) => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const name = golfer.name?.toLowerCase() || '';
        const email = golfer.email?.toLowerCase() || '';
        const company = golfer.company?.toLowerCase() || '';
        if (!name.includes(search) && !email.includes(search) && !company.includes(search)) {
          return false;
        }
      }

      if (paymentFilter !== 'all' && golfer.payment_status !== paymentFilter) return false;
      if (paymentMethodFilter !== 'all') {
        const filterValue = paymentMethodFilter === 'pay-now' ? 'stripe' : 'pay_on_day';
        if (golfer.payment_type !== filterValue) return false;
      }
      if (statusFilter !== 'all' && golfer.registration_status !== statusFilter) return false;
      if (checkinFilter !== 'all') {
        const isCheckedIn = checkinFilter === 'checked-in';
        if (golfer.checked_in !== isCheckedIn) return false;
      }
      if (groupFilter !== 'all') {
        if (groupFilter === 'unassigned') {
          if (golfer.group_position_label) return false;
        } else {
          const groupNum = parseInt(groupFilter);
          if (!golfer.group || golfer.group.group_number !== groupNum) return false;
        }
      }
      if (holeFilter !== 'all') {
        const holeNum = parseInt(holeFilter);
        if (golfer.hole_number !== holeNum) return false;
      }

      return true;
    });
  }, [golfers, searchTerm, paymentFilter, paymentMethodFilter, statusFilter, checkinFilter, groupFilter, holeFilter]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (paymentFilter !== 'all') count++;
    if (paymentMethodFilter !== 'all') count++;
    if (statusFilter !== 'all') count++;
    if (checkinFilter !== 'all') count++;
    if (groupFilter !== 'all') count++;
    if (holeFilter !== 'all') count++;
    return count;
  }, [paymentFilter, paymentMethodFilter, statusFilter, checkinFilter, groupFilter, holeFilter]);

  const clearAllFilters = () => {
    setPaymentFilter('all');
    setPaymentMethodFilter('all');
    setStatusFilter('all');
    setCheckinFilter('all');
    setGroupFilter('all');
    setHoleFilter('all');
    setSearchTerm('');
  };

  const handleExport = () => {
    const headers = ['Name', 'Email', 'Company', 'Phone', 'Payment Type', 'Payment Status', 'Registration Status', 'Group', 'Hole', 'Checked In', 'Registered Date', 'Registered Time'];
    const csvData = filteredGolfers.map(g => {
      const regDate = g.created_at ? formatRegistrationDate(g.created_at) : { date: '', time: '' };
      return [
        g.name,
        g.email,
        g.company || '',
        g.phone || '',
        g.payment_type === 'stripe' ? 'Pay Now' : 'Pay on Day',
        g.payment_status,
        g.registration_status,
        g.group_position_label || 'Unassigned',
        g.hole_number || '-',
        g.checked_in ? 'Yes' : 'No',
        regDate.date,
        regDate.time,
      ];
    });
    
    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `golfers-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDeleteGolfer = async () => {
    if (!selectedGolfer) return;
    
    setIsDeleting(true);
    try {
      await api.deleteGolfer(selectedGolfer.id);
      toast.success(`${selectedGolfer.name} has been removed`);
      setSelectedGolfer(null);
      setShowDeleteConfirm(false);
      fetchData(); // Refresh the list
    } catch (err) {
      console.error('Error deleting golfer:', err);
      toast.error('Failed to delete golfer');
    } finally {
      setIsDeleting(false);
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

  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
          >
            <RefreshCw size={18} />
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-3 lg:space-y-6">
        {/* Mobile Header - Ultra minimal */}
        <div className="flex items-center justify-between lg:hidden">
          <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowAddModal(true)}
              className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
              title="Add Golfer"
            >
              <UserPlus size={18} />
            </button>
            <button
              onClick={fetchData}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={handleExport}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="Export"
            >
              <Download size={18} />
            </button>
          </div>
        </div>

        {/* Mobile Stats - Clean summary with capacity */}
        <div className="lg:hidden space-y-2">
          {/* Capacity Bar */}
          {stats && (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-gray-600">
                  Capacity: <span className="font-semibold text-gray-900">{stats.confirmed}/{stats.max_capacity}</span>
                </span>
                <span className={`font-medium ${stats.at_capacity ? 'text-amber-600' : 'text-green-600'}`}>
                  {stats.at_capacity ? 'Full - Waitlist Only' : `${stats.capacity_remaining} spots left`}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    stats.at_capacity ? 'bg-amber-500' : 
                    stats.confirmed / stats.max_capacity > 0.8 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, (stats.confirmed / stats.max_capacity) * 100)}%` }}
                />
              </div>
            </div>
          )}
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{stats?.total || 0}</span> registered
            <span className="mx-1.5 text-gray-300">·</span>
            <span className="font-semibold text-purple-600">{stats?.paid || 0}</span> paid
            <span className="mx-1.5 text-gray-300">·</span>
            <span className="font-semibold text-teal-600">{stats?.checked_in || 0}</span> checked in
            {(stats?.waitlist || 0) > 0 && (
              <>
                <span className="mx-1.5 text-gray-300">·</span>
                <span className="font-semibold text-amber-600">{stats?.waitlist}</span> waitlist
              </>
            )}
          </p>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <UserPlus size={18} />
              <span>Add Golfer</span>
            </button>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={18} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
            >
              <Download size={18} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Desktop Capacity Indicator */}
        {stats && (
          <div className="hidden lg:block">
            <Card className={`p-4 ${stats.at_capacity ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Users className={`${stats.at_capacity ? 'text-amber-600' : 'text-emerald-600'}`} size={24} />
                    <div>
                      <p className="text-sm text-gray-600">Tournament Capacity</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.confirmed} <span className="text-lg font-normal text-gray-500">/ {stats.max_capacity}</span>
                      </p>
                    </div>
                  </div>
                  <div className="h-12 w-px bg-gray-300 mx-4" />
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className={`text-lg font-semibold ${stats.at_capacity ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {stats.at_capacity ? '⚠️ Waitlist Only' : `${stats.capacity_remaining} spots available`}
                    </p>
                  </div>
                </div>
                <div className="w-64">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>0</span>
                    <span>{Math.round((stats.confirmed / stats.max_capacity) * 100)}% full</span>
                    <span>{stats.max_capacity}</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        stats.at_capacity ? 'bg-amber-500' : 
                        stats.confirmed / stats.max_capacity > 0.8 ? 'bg-yellow-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, (stats.confirmed / stats.max_capacity) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Desktop Stats Grid - Full cards */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-4">
          <Card className="bg-blue-50 border-l-4 border-blue-900">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total</h3>
            <p className="text-3xl font-bold text-blue-900">{stats?.total || 0}</p>
          </Card>
          <Card className="bg-green-50 border-l-4 border-green-600">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Confirmed</h3>
            <p className="text-3xl font-bold text-green-600">{stats?.confirmed || 0}</p>
          </Card>
          <Card className="bg-amber-50 border-l-4 border-amber-600">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Waitlist</h3>
            <p className="text-3xl font-bold text-amber-600">{stats?.waitlist || 0}</p>
          </Card>
          <Card className="bg-purple-50 border-l-4 border-purple-600">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Paid</h3>
            <p className="text-3xl font-bold text-purple-600">{stats?.paid || 0}</p>
          </Card>
          <Card className="bg-teal-50 border-l-4 border-teal-600">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Checked In</h3>
            <p className="text-3xl font-bold text-teal-600">{stats?.checked_in || 0}</p>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="p-3 lg:p-6">
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 text-base"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Filter Toggle for Mobile */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200 mb-3"
          >
            <span className="text-sm font-medium text-gray-700">
              Filters {activeFilterCount > 0 && `(${activeFilterCount} active)`}
            </span>
            {showFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-blue-600 hover:text-blue-800 mb-3"
            >
              Clear all filters
            </button>
          )}

          {/* Filters Grid - Collapsible on mobile */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
              <Select
                label="Payment"
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'paid', label: 'Paid' },
                  { value: 'unpaid', label: 'Unpaid' },
                ]}
              />

              <Select
                label="Method"
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'pay-now', label: 'Online' },
                  { value: 'pay-on-day', label: 'On Day' },
                ]}
              />

              <Select
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'confirmed', label: 'Confirmed' },
                  { value: 'waitlist', label: 'Waitlist' },
                ]}
              />

              <Select
                label="Check-In"
                value={checkinFilter}
                onChange={(e) => setCheckinFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'checked-in', label: 'Yes' },
                  { value: 'not-checked-in', label: 'No' },
                ]}
              />

              <Select
                label="Group"
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'unassigned', label: 'Unassigned' },
                  ...Array.from({ length: 40 }, (_, i) => ({
                    value: String(i + 1),
                    label: `Group ${i + 1}`,
                  })),
                ]}
              />

              <Select
                label="Hole"
                value={holeFilter}
                onChange={(e) => setHoleFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All' },
                  ...Array.from({ length: 18 }, (_, i) => ({
                    value: String(i + 1),
                    label: `Hole ${i + 1}`,
                  })),
                ]}
              />
            </div>
          </div>
        </Card>

        {/* Registrants */}
        <Card className="p-3 lg:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg lg:text-xl font-bold text-gray-900">
              Registrants ({filteredGolfers.length})
            </h2>
            <p className="text-xs text-gray-500 hidden sm:block">Click on a player to view details</p>
          </div>

          {filteredGolfers.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No registrants found matching your filters.
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="lg:hidden space-y-3 max-h-[60vh] overflow-y-auto">
                {filteredGolfers.map((golfer) => (
                  <button
                    key={golfer.id}
                    onClick={() => setSelectedGolfer(golfer)}
                    className="w-full text-left bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 truncate">{golfer.name}</p>
                        <p className="text-sm text-gray-600 truncate">{golfer.email}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 ml-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            golfer.payment_status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {golfer.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                        </span>
                        {golfer.checked_in && (
                          <span className="text-xs text-green-600 font-medium">✓ Checked In</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      {golfer.company && <span>{golfer.company}</span>}
                      <span className={!golfer.group_position_label ? 'text-amber-600 font-medium' : ''}>
                        Group: {golfer.group_position_label || 'Unassigned'}
                      </span>
                      <span>Hole: {golfer.hole_number || '-'}</span>
                      <span
                        className={`${
                          golfer.registration_status === 'confirmed'
                            ? 'text-blue-600'
                            : 'text-gray-500'
                        }`}
                      >
                        {golfer.registration_status === 'confirmed' ? 'Confirmed' : 'Waitlist'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead>Hole</TableHead>
                      <TableHead>Checked In</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGolfers.map((golfer) => (
                      <TableRow 
                        key={golfer.id} 
                        className="cursor-pointer hover:bg-blue-50 transition-colors"
                        onClick={() => setSelectedGolfer(golfer)}
                      >
                        <TableCell className="font-medium">{golfer.name}</TableCell>
                        <TableCell>{golfer.email}</TableCell>
                        <TableCell>{golfer.company || '-'}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              golfer.payment_status === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {golfer.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              golfer.registration_status === 'confirmed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {golfer.registration_status === 'confirmed' ? 'Confirmed' : 'Waitlist'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {golfer.group_position_label || (
                            <span className="text-amber-600 font-medium">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>{golfer.hole_number || '-'}</TableCell>
                        <TableCell>
                          {golfer.checked_in ? (
                            <span className="text-green-600 font-medium">Yes</span>
                          ) : (
                            <span className="text-gray-400">No</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Add Golfer Modal */}
      <AddGolferModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchData}
      />

      {/* Golfer Detail Modal */}
      {selectedGolfer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => { setSelectedGolfer(null); setShowDeleteConfirm(false); }}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Player Details</h3>
              <button 
                onClick={() => { setSelectedGolfer(null); setShowDeleteConfirm(false); }}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-4 lg:p-6 space-y-6">
              {/* Player Header */}
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-full ${
                  selectedGolfer.checked_in 
                    ? 'bg-green-100' 
                    : selectedGolfer.payment_status === 'paid'
                    ? 'bg-blue-100'
                    : 'bg-amber-100'
                }`}>
                  <User className={
                    selectedGolfer.checked_in 
                      ? 'text-green-600' 
                      : selectedGolfer.payment_status === 'paid'
                      ? 'text-blue-600'
                      : 'text-amber-600'
                  } size={28} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedGolfer.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        selectedGolfer.registration_status === 'confirmed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {selectedGolfer.registration_status === 'confirmed' ? 'Confirmed' : 'Waitlist'}
                    </span>
                    {selectedGolfer.checked_in && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                        <CheckCircle size={12} /> Checked In
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Contact Information</h4>
                <div className="grid gap-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="text-gray-400 flex-shrink-0" size={18} />
                    <span className="text-gray-900">{selectedGolfer.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="text-gray-400 flex-shrink-0" size={18} />
                    <span className="text-gray-900">{selectedGolfer.phone || '-'}</span>
                  </div>
                  {selectedGolfer.company && (
                    <div className="flex items-center gap-3 text-sm">
                      <Building2 className="text-gray-400 flex-shrink-0" size={18} />
                      <span className="text-gray-900">{selectedGolfer.company}</span>
                    </div>
                  )}
                  {selectedGolfer.address && (
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin className="text-gray-400 flex-shrink-0 mt-0.5" size={18} />
                      <span className="text-gray-900">{selectedGolfer.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tournament Info */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Tournament Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3 rounded-lg ${selectedGolfer.group_position_label ? 'bg-gray-50' : 'bg-amber-50 border border-amber-200'}`}>
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Users size={14} />
                      <span className="text-xs">Group</span>
                    </div>
                    <p className={`font-semibold ${selectedGolfer.group_position_label ? 'text-gray-900' : 'text-amber-600'}`}>
                      {selectedGolfer.group_position_label || 'Unassigned'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <MapPin size={14} />
                      <span className="text-xs">Starting Hole</span>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {selectedGolfer.hole_number ? `Hole ${selectedGolfer.hole_number}` : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Payment</h4>
                <div className={`p-4 rounded-lg border-2 ${
                  selectedGolfer.payment_status === 'paid'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-amber-50 border-amber-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {selectedGolfer.payment_status === 'paid' ? (
                      <CheckCircle className="text-green-600" size={20} />
                    ) : (
                      <CreditCard className="text-amber-600" size={20} />
                    )}
                    <span className={`font-semibold ${
                      selectedGolfer.payment_status === 'paid' ? 'text-green-800' : 'text-amber-800'
                    }`}>
                      {selectedGolfer.payment_status === 'paid' ? 'Payment Complete' : 'Payment Pending'}
                    </span>
                  </div>
                  <p className={`text-sm ${
                    selectedGolfer.payment_status === 'paid' ? 'text-green-700' : 'text-amber-700'
                  }`}>
                    {selectedGolfer.payment_status === 'paid'
                      ? selectedGolfer.payment_type === 'stripe'
                        ? 'Paid online via Stripe'
                        : 'Paid on day of tournament'
                      : selectedGolfer.payment_type === 'stripe'
                        ? `Stripe payment pending ($${stats?.entry_fee_dollars?.toFixed(2) ?? '125.00'})`
                        : `Will pay on day of tournament ($${stats?.entry_fee_dollars?.toFixed(2) ?? '125.00'})`
                    }
                  </p>
                  
                  {/* Payment Details - shown when paid */}
                  {selectedGolfer.payment_status === 'paid' && (
                    <div className="mt-3 pt-3 border-t border-green-200 space-y-2 text-sm">
                      {selectedGolfer.payment_method && (
                        <div className="flex justify-between">
                          <span className="text-green-600">Method:</span>
                          <span className="text-green-800 font-medium capitalize">{selectedGolfer.payment_method}</span>
                        </div>
                      )}
                      {selectedGolfer.receipt_number && (
                        <div className="flex justify-between">
                          <span className="text-green-600">Receipt #:</span>
                          <span className="text-green-800 font-medium">{selectedGolfer.receipt_number}</span>
                        </div>
                      )}
                      {selectedGolfer.payment_notes && (
                        <div className="mt-2">
                          <span className="text-green-600 block mb-1">Notes:</span>
                          <p className="text-green-800 bg-green-100/50 p-2 rounded text-xs">{selectedGolfer.payment_notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Waiver Status */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Waiver</h4>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="text-gray-400" size={18} />
                  {selectedGolfer.waiver_signed ? (
                    <span className="text-green-600 font-medium flex items-center gap-1">
                      <CheckCircle size={14} /> Waiver Signed
                    </span>
                  ) : (
                    <span className="text-amber-600 font-medium">Waiver Not Signed</span>
                  )}
                </div>
              </div>

              {/* Registration Info */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Registration</h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="text-gray-400 flex-shrink-0" size={18} />
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedGolfer.created_at 
                          ? formatRegistrationDate(selectedGolfer.created_at).date 
                          : 'Unknown'}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {selectedGolfer.created_at 
                          ? `at ${formatRegistrationDate(selectedGolfer.created_at).time} (Guam Time)` 
                          : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delete Section */}
              <div className="pt-4 border-t border-gray-200">
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Trash2 size={16} />
                    Remove Golfer
                  </button>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800 font-medium mb-3">
                      Are you sure you want to remove {selectedGolfer.name}? This cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={isDeleting}
                        className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteGolfer}
                        disabled={isDeleting}
                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {isDeleting ? 'Removing...' : 'Yes, Remove'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { Card, Button, Input } from '../components/ui';
import { api, Golfer, Group, GolferStats } from '../services/api';
import { 
  RefreshCw, 
  Download, 
  Users, 
  CheckCircle, 
  DollarSign,
  MapPin,
  Phone,
  Search,
  List,
  Grid3X3,
  ClipboardList
} from 'lucide-react';
import * as XLSX from 'xlsx';

type ReportTab = 'registrations' | 'checkin' | 'payments' | 'groups' | 'contacts';

export const ReportsPage: React.FC = () => {
  const [golfers, setGolfers] = useState<Golfer[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [stats, setStats] = useState<GolferStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ReportTab>('registrations');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'cancelled' | 'waitlist'>('all');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [golfersResponse, groupsData, statsData] = await Promise.all([
        api.getGolfers({ per_page: 1000 }),
        api.getGroups(),
        api.getGolferStats(),
      ]);
      
      setGolfers(golfersResponse.golfers);
      setGroups(groupsData);
      setStats(statsData);
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

  // Filter golfers based on search and status
  const filteredGolfers = useMemo(() => {
    let filtered = golfers;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(g => g.registration_status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(g => 
        g.name.toLowerCase().includes(search) ||
        g.email?.toLowerCase().includes(search) ||
        g.company?.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  }, [golfers, searchTerm, statusFilter]);

  // Compute report data
  // Only include confirmed golfers for check-in sheet (exclude cancelled and waitlist)
  const confirmedGolfers = useMemo(() => 
    filteredGolfers.filter(g => g.registration_status === 'confirmed'), 
    [filteredGolfers]
  );

  const paidGolfers = useMemo(() => 
    confirmedGolfers.filter(g => g.payment_status === 'paid'), 
    [confirmedGolfers]
  );
  
  const unpaidGolfers = useMemo(() => 
    confirmedGolfers.filter(g => g.payment_status !== 'paid'), 
    [confirmedGolfers]
  );
  
  const checkedInGolfers = useMemo(() => 
    confirmedGolfers.filter(g => g.checked_in), 
    [confirmedGolfers]
  );

  // Groups sorted by group number (creation order)
  const groupsByNumber = useMemo(() => {
    return [...groups].sort((a, b) => a.group_number - b.group_number);
  }, [groups]);

  const handleExport = () => {
    const wb = XLSX.utils.book_new();
    
    switch (activeTab) {
      case 'registrations': {
        const data = filteredGolfers.map(g => ({
          'Name': g.name,
          'Email': g.email,
          'Phone': g.phone || '-',
          'Company': g.company || '-',
          'Status': g.registration_status,
          'Payment': g.payment_status,
          'Checked In': g.checked_in ? 'Yes' : 'No',
          'Group': g.group_position_label || 'Unassigned',
          'Hole': g.hole_number ? `Hole ${g.hole_number}` : '-',
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Registrations');
        break;
      }
      case 'checkin': {
        const data = confirmedGolfers.map(g => ({
          'Name': g.name,
          'Company': g.company || '-',
          'Group': g.group_position_label || 'Unassigned',
          'Hole': g.hole_number ? `Hole ${g.hole_number}` : '-',
          'Paid': g.payment_status === 'paid' ? '✓' : '',
          'Checked In': g.checked_in ? '✓' : '',
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Check-In Sheet');
        break;
      }
      case 'payments': {
        const paidData = paidGolfers.map(g => ({
          'Name': g.name,
          'Company': g.company || '-',
          'Payment Method': g.payment_method || g.payment_type || '-',
          'Receipt #': g.receipt_number || '-',
          'Notes': g.payment_notes || '-',
        }));
        const unpaidData = unpaidGolfers.map(g => ({
          'Name': g.name,
          'Email': g.email,
          'Phone': g.phone || '-',
          'Company': g.company || '-',
        }));
        const ws1 = XLSX.utils.json_to_sheet(paidData);
        const ws2 = XLSX.utils.json_to_sheet(unpaidData);
        XLSX.utils.book_append_sheet(wb, ws1, 'Paid');
        XLSX.utils.book_append_sheet(wb, ws2, 'Unpaid');
        break;
      }
      case 'groups': {
        const data: any[] = [];
        groupsByNumber.forEach(group => {
          data.push({
            'Group': `Group ${group.group_number}`,
            'Hole': group.hole_number ? `Hole ${group.hole_number}` : 'Unassigned',
            'Player 1': group.golfers?.[0]?.name || '',
            'Player 2': group.golfers?.[1]?.name || '',
            'Player 3': group.golfers?.[2]?.name || '',
            'Player 4': group.golfers?.[3]?.name || '',
          });
        });
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Groups by Hole');
        break;
      }
      case 'contacts': {
        // Only export confirmed registrants for contact list
        const data = confirmedGolfers.map(g => ({
          'Name': g.name,
          'Email': g.email,
          'Phone': g.phone || '-',
          'Company': g.company || '-',
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Contact List');
        break;
      }
    }
    
    XLSX.writeFile(wb, `${activeTab}-report-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const tabs: { id: ReportTab; label: string; icon: React.ReactNode; mobileLabel: string }[] = [
    { id: 'registrations', label: 'All Registrations', icon: <List size={14} />, mobileLabel: 'All' },
    { id: 'checkin', label: 'Check-In Sheet', icon: <ClipboardList size={14} />, mobileLabel: 'Check-In' },
    { id: 'payments', label: 'Payment Summary', icon: <DollarSign size={14} />, mobileLabel: 'Payments' },
    { id: 'groups', label: 'Groups by Hole', icon: <Grid3X3 size={14} />, mobileLabel: 'Groups' },
    { id: 'contacts', label: 'Contact List', icon: <Phone size={14} />, mobileLabel: 'Contacts' },
  ];

  // Mobile card component for golfer display
  const GolferCard = ({ golfer, showPayment = true, showStatus = true, showGroup = false }: { 
    golfer: Golfer; 
    showPayment?: boolean; 
    showStatus?: boolean;
    showGroup?: boolean;
  }) => (
    <div className="p-3 border-b border-gray-100 last:border-b-0">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-gray-900 truncate">{golfer.name}</p>
          {golfer.company && (
            <p className="text-xs text-gray-500 truncate">{golfer.company}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {showStatus && (
            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
              golfer.registration_status === 'confirmed' 
                ? 'bg-green-100 text-green-700' 
                : golfer.registration_status === 'cancelled'
                ? 'bg-red-100 text-red-700'
                : 'bg-amber-100 text-amber-700'
            }`}>
              {golfer.registration_status === 'confirmed' ? 'conf' : golfer.registration_status === 'cancelled' ? 'canc' : 'wait'}
            </span>
          )}
          {showPayment && (
            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
              golfer.payment_status === 'paid' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {golfer.payment_status === 'paid' ? 'paid' : 'unpaid'}
            </span>
          )}
          {showGroup && golfer.group_position_label && (
            <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
              {golfer.group_position_label}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-3 lg:space-y-6">
        {/* Header - Compact on mobile */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg lg:text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-xs lg:text-sm text-gray-600">View and export tournament data</p>
          </div>
          <div className="flex gap-1.5 lg:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={loading}
              className="px-2 lg:px-3"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="px-2 lg:px-3"
            >
              <Download size={16} />
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Summary Cards - Compact 4-column grid on mobile */}
        {stats && (
          <div className="grid grid-cols-4 gap-2 lg:gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2 lg:p-4 border border-blue-200">
              <div className="flex flex-col lg:flex-row lg:items-center lg:gap-3">
                <div className="hidden lg:block p-2 bg-blue-500 rounded-lg">
                  <Users className="text-white" size={18} />
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-[10px] lg:text-xs text-blue-600 font-medium">Registered</p>
                  <p className="text-lg lg:text-2xl font-bold text-blue-900">{stats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-2 lg:p-4 border border-green-200">
              <div className="flex flex-col lg:flex-row lg:items-center lg:gap-3">
                <div className="hidden lg:block p-2 bg-green-500 rounded-lg">
                  <DollarSign className="text-white" size={18} />
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-[10px] lg:text-xs text-green-600 font-medium">Paid</p>
                  <p className="text-lg lg:text-2xl font-bold text-green-900">{stats.paid}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-2 lg:p-4 border border-emerald-200">
              <div className="flex flex-col lg:flex-row lg:items-center lg:gap-3">
                <div className="hidden lg:block p-2 bg-emerald-500 rounded-lg">
                  <CheckCircle className="text-white" size={18} />
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-[10px] lg:text-xs text-emerald-600 font-medium">Checked In</p>
                  <p className="text-lg lg:text-2xl font-bold text-emerald-900">{stats.checked_in}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-2 lg:p-4 border border-purple-200">
              <div className="flex flex-col lg:flex-row lg:items-center lg:gap-3">
                <div className="hidden lg:block p-2 bg-purple-500 rounded-lg">
                  <MapPin className="text-white" size={18} />
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-[10px] lg:text-xs text-purple-600 font-medium">Groups</p>
                  <p className="text-lg lg:text-2xl font-bold text-purple-900">{groups.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs - Sticky on mobile */}
        <div className="sticky top-0 z-10 bg-gray-50 -mx-4 px-4 py-2 lg:static lg:mx-0 lg:px-0 lg:py-0 lg:bg-transparent">
          <div className="flex overflow-x-auto gap-1 pb-1 scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 lg:px-3 lg:py-2 rounded-lg text-xs lg:text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#1e3a5f] text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {tab.icon}
                <span className="lg:hidden">{tab.mobileLabel}</span>
                <span className="hidden lg:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        {activeTab !== 'groups' && (
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 py-2 text-sm"
            />
          </div>
        )}

        {/* Report Content */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
              Loading...
            </div>
          ) : (
            <>
              {/* Registrations Tab */}
              {activeTab === 'registrations' && (
                <>
                  <div className="p-2 lg:p-4 border-b bg-gray-50 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs lg:text-sm text-gray-600">{filteredGolfers.length} registrations</span>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-500">Status:</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as 'all' | 'confirmed' | 'cancelled' | 'waitlist')}
                        className="text-xs lg:text-sm border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="waitlist">Waitlist</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Mobile View - Card layout */}
                  <div className="lg:hidden max-h-[60vh] overflow-y-auto">
                    {filteredGolfers.map(g => (
                      <GolferCard key={g.id} golfer={g} showGroup />
                    ))}
                    {filteredGolfers.length === 0 && (
                      <div className="p-4 text-center text-gray-500 text-sm">No registrations found</div>
                    )}
                  </div>

                  {/* Desktop View - Table */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Name</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Email</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Company</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Status</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Payment</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Group</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredGolfers.map(g => (
                          <tr key={g.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 font-medium">{g.name}</td>
                            <td className="px-3 py-2 text-gray-600">{g.email}</td>
                            <td className="px-3 py-2 text-gray-600">{g.company || '-'}</td>
                            <td className="px-3 py-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                g.registration_status === 'confirmed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : g.registration_status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {g.registration_status}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                g.payment_status === 'paid' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {g.payment_status}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-gray-600">
                              {g.group_position_label || 'Unassigned'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Check-In Sheet Tab */}
              {activeTab === 'checkin' && (
                <>
                  <div className="p-2 lg:p-4 border-b bg-gray-50 flex justify-between items-center">
                    <span className="text-xs lg:text-sm text-gray-600">{confirmedGolfers.length} players</span>
                    <span className="text-xs lg:text-sm font-medium text-green-700">
                      {checkedInGolfers.length} checked in
                    </span>
                  </div>
                  
                  {/* Mobile View */}
                  <div className="lg:hidden max-h-[60vh] overflow-y-auto">
                    {confirmedGolfers.map(g => (
                      <div key={g.id} className={`p-3 border-b border-gray-100 last:border-b-0 ${g.checked_in ? 'bg-green-50' : ''}`}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 truncate">{g.name}</p>
                            <p className="text-xs text-gray-500">{g.group_position_label || 'No group'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {g.payment_status === 'paid' && (
                              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                <DollarSign size={12} className="text-green-600" />
                              </div>
                            )}
                            {g.checked_in && (
                              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                <CheckCircle size={12} className="text-blue-600" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Name</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Company</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Group</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Hole</th>
                          <th className="px-3 py-2 text-center font-medium text-gray-500">Paid</th>
                          <th className="px-3 py-2 text-center font-medium text-gray-500">✓</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {confirmedGolfers.map(g => (
                          <tr key={g.id} className={`hover:bg-gray-50 ${g.checked_in ? 'bg-green-50' : ''}`}>
                            <td className="px-3 py-2 font-medium">{g.name}</td>
                            <td className="px-3 py-2 text-gray-600">{g.company || '-'}</td>
                            <td className="px-3 py-2 text-gray-600">{g.group_position_label || '-'}</td>
                            <td className="px-3 py-2 text-gray-600">
                              {g.hole_number ? `Hole ${g.hole_number}` : '-'}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {g.payment_status === 'paid' && (
                                <CheckCircle size={16} className="text-green-600 mx-auto" />
                              )}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {g.checked_in && (
                                <CheckCircle size={16} className="text-blue-600 mx-auto" />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Payments Tab */}
              {activeTab === 'payments' && (
                <>
                  <div className="p-2 lg:p-4 border-b bg-gray-50 flex justify-between items-center">
                    <span className="text-xs lg:text-sm font-medium text-green-700">
                      {paidGolfers.length} Paid
                    </span>
                    <span className="text-xs lg:text-sm font-medium text-red-700">
                      {unpaidGolfers.length} Unpaid
                    </span>
                  </div>
                  
                  <div className="max-h-[60vh] lg:max-h-none overflow-y-auto">
                    {/* Paid Section */}
                    <div className="border-b">
                      <div className="p-2 lg:p-3 bg-green-50 font-medium text-green-800 flex items-center gap-2 text-sm">
                        <CheckCircle size={14} />
                        Paid ({paidGolfers.length})
                      </div>
                      
                      {/* Mobile */}
                      <div className="lg:hidden">
                        {paidGolfers.map(g => (
                          <div key={g.id} className="p-3 border-b border-gray-100 last:border-b-0">
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-900 truncate">{g.name}</p>
                                <p className="text-xs text-gray-500 capitalize">
                                  {g.payment_method || g.payment_type || 'Method unknown'}
                                  {g.receipt_number && ` • #${g.receipt_number}`}
                                </p>
                              </div>
                              <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                            </div>
                          </div>
                        ))}
                        {paidGolfers.length === 0 && (
                          <div className="p-4 text-center text-gray-500 text-sm">No paid golfers</div>
                        )}
                      </div>

                      {/* Desktop */}
                      <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b">
                            <tr>
                              <th className="px-3 py-2 text-left font-medium text-gray-500">Name</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-500">Company</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-500">Method</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-500">Receipt #</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {paidGolfers.map(g => (
                              <tr key={g.id} className="hover:bg-gray-50">
                                <td className="px-3 py-2 font-medium">{g.name}</td>
                                <td className="px-3 py-2 text-gray-600">{g.company || '-'}</td>
                                <td className="px-3 py-2 text-gray-600 capitalize">
                                  {g.payment_method || g.payment_type || '-'}
                                </td>
                                <td className="px-3 py-2 text-gray-600">
                                  {g.receipt_number || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    {/* Unpaid Section */}
                    <div>
                      <div className="p-2 lg:p-3 bg-red-50 font-medium text-red-800 flex items-center gap-2 text-sm">
                        <DollarSign size={14} />
                        Unpaid ({unpaidGolfers.length})
                      </div>
                      
                      {/* Mobile */}
                      <div className="lg:hidden">
                        {unpaidGolfers.map(g => (
                          <div key={g.id} className="p-3 border-b border-gray-100 last:border-b-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-900 truncate">{g.name}</p>
                                <p className="text-xs text-gray-500 truncate">{g.phone || g.email}</p>
                              </div>
                              <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 flex-shrink-0">
                                unpaid
                              </span>
                            </div>
                          </div>
                        ))}
                        {unpaidGolfers.length === 0 && (
                          <div className="p-4 text-center text-gray-500 text-sm">Everyone is paid!</div>
                        )}
                      </div>

                      {/* Desktop */}
                      <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b">
                            <tr>
                              <th className="px-3 py-2 text-left font-medium text-gray-500">Name</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-500">Email</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-500">Phone</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-500">Company</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {unpaidGolfers.map(g => (
                              <tr key={g.id} className="hover:bg-gray-50">
                                <td className="px-3 py-2 font-medium">{g.name}</td>
                                <td className="px-3 py-2 text-gray-600">{g.email}</td>
                                <td className="px-3 py-2 text-gray-600">{g.phone || '-'}</td>
                                <td className="px-3 py-2 text-gray-600">{g.company || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Groups Tab */}
              {activeTab === 'groups' && (
                <>
                  <div className="p-2 lg:p-4 border-b bg-gray-50">
                    <span className="text-xs lg:text-sm text-gray-600">{groups.length} groups</span>
                  </div>
                  <div className="p-3 lg:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[60vh] lg:max-h-none overflow-y-auto">
                    {groupsByNumber.map(group => (
                      <div 
                        key={group.id} 
                        className="border rounded-lg p-3 bg-white hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-gray-900 text-sm">Group {group.group_number}</span>
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                            group.hole_number 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {group.hole_number ? `Hole ${group.hole_number}` : 'No Hole'}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {group.golfers && group.golfers.length > 0 ? (
                            group.golfers.map((golfer, idx) => (
                              <div 
                                key={golfer.id} 
                                className="flex items-center gap-2 text-sm"
                              >
                                <span className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-medium text-blue-600">
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                <span className="truncate text-gray-700">{golfer.name}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-gray-400 italic">Empty</p>
                          )}
                          {/* Empty slots */}
                          {group.golfers && group.golfers.length < 4 && group.golfers.length > 0 && (
                            Array.from({ length: 4 - group.golfers.length }).map((_, idx) => (
                              <div 
                                key={`empty-${idx}`} 
                                className="flex items-center gap-2 text-sm text-gray-300"
                              >
                                <span className="w-4 h-4 rounded-full bg-gray-50 flex items-center justify-center text-[10px] font-medium">
                                  {String.fromCharCode(65 + group.golfers!.length + idx)}
                                </span>
                                <span className="italic text-xs">Empty</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Contacts Tab - Only show confirmed registrants */}
              {activeTab === 'contacts' && (
                <>
                  <div className="p-2 lg:p-4 border-b bg-gray-50">
                    <span className="text-xs lg:text-sm text-gray-600">{confirmedGolfers.length} contacts</span>
                  </div>
                  
                  {/* Mobile */}
                  <div className="lg:hidden max-h-[60vh] overflow-y-auto">
                    {confirmedGolfers.map(g => (
                      <div key={g.id} className="p-3 border-b border-gray-100 last:border-b-0">
                        <p className="font-medium text-gray-900">{g.name}</p>
                        <div className="mt-1 space-y-0.5">
                          <a href={`mailto:${g.email}`} className="block text-xs text-blue-600 truncate">
                            {g.email}
                          </a>
                          {g.phone && (
                            <a href={`tel:${g.phone}`} className="block text-xs text-blue-600">
                              {g.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                    {confirmedGolfers.length === 0 && (
                      <div className="p-4 text-center text-gray-500 text-sm">No contacts found</div>
                    )}
                  </div>

                  {/* Desktop */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Name</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Email</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Phone</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">Company</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {confirmedGolfers.map(g => (
                          <tr key={g.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 font-medium">{g.name}</td>
                            <td className="px-3 py-2">
                              <a href={`mailto:${g.email}`} className="text-blue-600 hover:underline">
                                {g.email}
                              </a>
                            </td>
                            <td className="px-3 py-2">
                              {g.phone ? (
                                <a href={`tel:${g.phone}`} className="text-blue-600 hover:underline">
                                  {g.phone}
                                </a>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td className="px-3 py-2 text-gray-600">
                              {g.company || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

import React, { useState, useMemo } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { Card, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Select, Input } from '../components/ui';
import { Search, Download } from 'lucide-react';
import { Golfer } from '../types';

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
];

export const AdminDashboard: React.FC = () => {
  const [golfers] = useState<Golfer[]>(mockGolfers);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [checkinFilter, setCheckinFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [holeFilter, setHoleFilter] = useState('all');

  const filteredGolfers = useMemo(() => {
    return golfers.filter((golfer) => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        if (
          !golfer.fullName.toLowerCase().includes(search) &&
          !golfer.email.toLowerCase().includes(search) &&
          !golfer.company.toLowerCase().includes(search)
        ) {
          return false;
        }
      }

      if (paymentFilter !== 'all' && golfer.paymentStatus !== paymentFilter) return false;
      if (paymentMethodFilter !== 'all' && golfer.paymentOption !== paymentMethodFilter) return false;
      if (statusFilter !== 'all' && golfer.registrationStatus !== statusFilter) return false;
      if (checkinFilter !== 'all') {
        const isCheckedIn = checkinFilter === 'checked-in';
        if (golfer.checkedIn !== isCheckedIn) return false;
      }
      if (groupFilter !== 'all') {
        const groupNum = parseInt(groupFilter);
        if (golfer.groupNumber !== groupNum) return false;
      }
      if (holeFilter !== 'all') {
        const holeNum = parseInt(holeFilter);
        if (golfer.holeAssignment !== holeNum) return false;
      }

      return true;
    });
  }, [golfers, searchTerm, paymentFilter, paymentMethodFilter, statusFilter, checkinFilter, groupFilter, holeFilter]);

  const stats = useMemo(() => {
    const total = golfers.length;
    const confirmed = golfers.filter(g => g.registrationStatus === 'confirmed').length;
    const waitlist = golfers.filter(g => g.registrationStatus === 'waitlist').length;
    const paid = golfers.filter(g => g.paymentStatus === 'paid').length;
    const checkedIn = golfers.filter(g => g.checkedIn).length;

    return { total, confirmed, waitlist, paid, checkedIn };
  }, [golfers]);

  const handleExport = () => {
    console.log('Exporting data...');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            <Download size={18} />
            Export Data
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-blue-50 border-l-4 border-blue-900">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Registrations</h3>
            <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
          </Card>
          <Card className="bg-green-50 border-l-4 border-green-600">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Confirmed</h3>
            <p className="text-3xl font-bold text-green-600">{stats.confirmed}</p>
          </Card>
          <Card className="bg-amber-50 border-l-4 border-amber-600">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Waitlist</h3>
            <p className="text-3xl font-bold text-amber-600">{stats.waitlist}</p>
          </Card>
          <Card className="bg-purple-50 border-l-4 border-purple-600">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Paid</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.paid}</p>
          </Card>
          <Card className="bg-teal-50 border-l-4 border-teal-600">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Checked In</h3>
            <p className="text-3xl font-bold text-teal-600">{stats.checkedIn}</p>
          </Card>
        </div>

        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Filters & Search</h2>

          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Select
              label="Payment Status"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All' },
                { value: 'paid', label: 'Paid' },
                { value: 'unpaid', label: 'Unpaid' },
              ]}
            />

            <Select
              label="Payment Method"
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All' },
                { value: 'pay-now', label: 'Pay Now' },
                { value: 'pay-on-day', label: 'Pay on Day' },
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
                { value: 'checked-in', label: 'Checked In' },
                { value: 'not-checked-in', label: 'Not Checked In' },
              ]}
            />

            <Select
              label="Group"
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Groups' },
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
                { value: 'all', label: 'All Holes' },
                ...Array.from({ length: 18 }, (_, i) => ({
                  value: String(i + 1),
                  label: `Hole ${i + 1}`,
                })),
              ]}
            />
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Registrants ({filteredGolfers.length})
            </h2>
          </div>

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
              {filteredGolfers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                    No registrants found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredGolfers.map((golfer) => (
                  <TableRow key={golfer.id}>
                    <TableCell className="font-medium">{golfer.fullName}</TableCell>
                    <TableCell>{golfer.email}</TableCell>
                    <TableCell>{golfer.company}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          golfer.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {golfer.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          golfer.registrationStatus === 'confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {golfer.registrationStatus === 'confirmed' ? 'Confirmed' : 'Waitlist'}
                      </span>
                    </TableCell>
                    <TableCell>{golfer.groupPosition || '-'}</TableCell>
                    <TableCell>{golfer.holeAssignment || '-'}</TableCell>
                    <TableCell>
                      {golfer.checkedIn ? (
                        <span className="text-green-600 font-medium">Yes</span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AdminLayout>
  );
};

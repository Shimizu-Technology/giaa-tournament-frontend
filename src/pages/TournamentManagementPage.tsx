import React, { useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { useTournament } from '../contexts';
import { api, Tournament } from '../services/api';
import { Button, Card, Input, Modal } from '../components/ui';
import { 
  Plus, Calendar, Users, DollarSign, MapPin, Clock, 
  Archive, Copy, Play, Pause, Trash2, Edit, 
  CheckCircle, AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';

type TabType = 'active' | 'archived';

export const TournamentManagementPage = () => {
  const { tournaments, currentTournament, setCurrentTournament, refreshTournaments } = useTournament();
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const activeTournaments = tournaments.filter(t => t.status !== 'archived');
  const archivedTournaments = tournaments.filter(t => t.status === 'archived');

  const handleArchive = async (tournament: Tournament) => {
    if (!confirm(`Archive "${tournament.display_name}"? This will close registration and hide it from the active list.`)) return;
    
    setIsLoading(true);
    try {
      await api.archiveTournament(tournament.id);
      toast.success('Tournament archived successfully');
      refreshTournaments();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to archive tournament');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (tournament: Tournament) => {
    if (!confirm(`Create a new tournament based on "${tournament.display_name}"?`)) return;
    
    setIsLoading(true);
    try {
      const newTournament = await api.copyTournament(tournament.id);
      toast.success(`Created new tournament: ${newTournament.display_name}`);
      refreshTournaments();
      setSelectedTournament(newTournament);
      setIsEditModalOpen(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to copy tournament');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = async (tournament: Tournament) => {
    if (!confirm(`Open "${tournament.display_name}" for registration? This will close any other open tournaments.`)) return;
    
    setIsLoading(true);
    try {
      const updated = await api.openTournament(tournament.id);
      toast.success('Tournament opened for registration');
      setCurrentTournament(updated);
      refreshTournaments();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to open tournament');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = async (tournament: Tournament) => {
    if (!confirm(`Close "${tournament.display_name}"? Registration will be disabled.`)) return;
    
    setIsLoading(true);
    try {
      await api.closeTournament(tournament.id);
      toast.success('Tournament closed');
      refreshTournaments();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to close tournament');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (tournament: Tournament) => {
    if (!confirm(`Delete "${tournament.display_name}"? This cannot be undone. Tournaments with golfers cannot be deleted.`)) return;
    
    setIsLoading(true);
    try {
      await api.deleteTournament(tournament.id);
      toast.success('Tournament deleted');
      refreshTournaments();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete tournament');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: Tournament['status']) => {
    switch (status) {
      case 'open':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full"><CheckCircle size={12} /> Open</span>;
      case 'draft':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full"><AlertCircle size={12} /> Draft</span>;
      case 'closed':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded-full"><Pause size={12} /> Closed</span>;
      case 'archived':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full"><Archive size={12} /> Archived</span>;
    }
  };

  const TournamentCard = ({ tournament }: { tournament: Tournament }) => {
    const isExpanded = expandedId === tournament.id;
    const isCurrent = currentTournament?.id === tournament.id;

    return (
      <Card className={`mb-4 overflow-hidden ${isCurrent ? 'ring-2 ring-blue-500' : ''}`}>
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{tournament.display_name}</h3>
                {getStatusBadge(tournament.status)}
                {isCurrent && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    Current
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {tournament.event_date || 'Date TBD'}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={14} />
                  {tournament.confirmed_count}/{tournament.max_capacity}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign size={14} />
                  ${tournament.entry_fee_dollars}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => setExpandedId(isExpanded ? null : tournament.id)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>

          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Location</p>
                  <p className="font-medium flex items-center gap-1">
                    <MapPin size={14} />
                    {tournament.location_name || 'TBD'}
                  </p>
                  {tournament.location_address && (
                    <p className="text-gray-500 text-xs">{tournament.location_address}</p>
                  )}
                </div>
                <div>
                  <p className="text-gray-500">Time</p>
                  <p className="font-medium flex items-center gap-1">
                    <Clock size={14} />
                    {tournament.registration_time} registration, {tournament.start_time} start
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Format</p>
                  <p className="font-medium">{tournament.format_name || 'TBD'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Stats</p>
                  <p className="font-medium">
                    {tournament.confirmed_count} confirmed, {tournament.waitlist_count} waitlist, {tournament.paid_count} paid
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                {tournament.status !== 'archived' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTournament(tournament);
                        setIsEditModalOpen(true);
                      }}
                    >
                      <Edit size={14} className="mr-1" /> Edit
                    </Button>
                    
                    {tournament.status === 'draft' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpen(tournament)}
                        disabled={isLoading}
                      >
                        <Play size={14} className="mr-1" /> Open Registration
                      </Button>
                    )}
                    
                    {tournament.status === 'open' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleClose(tournament)}
                        disabled={isLoading}
                      >
                        <Pause size={14} className="mr-1" /> Close Registration
                      </Button>
                    )}
                    
                    {tournament.status === 'closed' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpen(tournament)}
                        disabled={isLoading}
                      >
                        <Play size={14} className="mr-1" /> Reopen Registration
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(tournament)}
                      disabled={isLoading}
                    >
                      <Copy size={14} className="mr-1" /> Copy for Next Year
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleArchive(tournament)}
                      disabled={isLoading}
                      className="text-amber-600 border-amber-300 hover:bg-amber-50"
                    >
                      <Archive size={14} className="mr-1" /> Archive
                    </Button>
                  </>
                )}
                
                {tournament.status === 'archived' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(tournament)}
                    disabled={isLoading}
                  >
                    <Copy size={14} className="mr-1" /> Copy for New Tournament
                  </Button>
                )}
                
                {tournament.confirmed_count === 0 && tournament.waitlist_count === 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(tournament)}
                    disabled={isLoading}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 size={14} className="mr-1" /> Delete
                  </Button>
                )}
                
                {!isCurrent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentTournament(tournament)}
                  >
                    Switch to This Tournament
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tournament Management</h1>
            <p className="text-gray-600 mt-1">Create, edit, and manage tournaments</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={18} className="mr-2" />
            New Tournament
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'active'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Active ({activeTournaments.length})
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'archived'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Archived ({archivedTournaments.length})
          </button>
        </div>

        {/* Tournament List */}
        <div>
          {activeTab === 'active' ? (
            activeTournaments.length > 0 ? (
              activeTournaments.map(tournament => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))
            ) : (
              <Card className="p-8 text-center">
                <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Tournaments</h3>
                <p className="text-gray-500 mb-4">Create your first tournament to get started.</p>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus size={18} className="mr-2" />
                  Create Tournament
                </Button>
              </Card>
            )
          ) : (
            archivedTournaments.length > 0 ? (
              archivedTournaments.map(tournament => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))
            ) : (
              <Card className="p-8 text-center">
                <Archive size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Archived Tournaments</h3>
                <p className="text-gray-500">Completed tournaments will appear here after archiving.</p>
              </Card>
            )
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <TournamentFormModal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedTournament(null);
        }}
        tournament={selectedTournament}
        onSuccess={() => {
          refreshTournaments();
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedTournament(null);
        }}
      />
    </AdminLayout>
  );
};

// Tournament Form Modal Component
interface TournamentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: Tournament | null;
  onSuccess: () => void;
}

const TournamentFormModal = ({ isOpen, onClose, tournament, onSuccess }: TournamentFormModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Tournament>>({});

  // Update form when tournament changes or modal opens
  React.useEffect(() => {
    if (isOpen) {
      if (tournament) {
        // Editing existing tournament - populate with current values
        setFormData({
          name: tournament.name,
          year: tournament.year,
          edition: tournament.edition || '',
          event_date: tournament.event_date || '',
          registration_time: tournament.registration_time || '11:00 am',
          start_time: tournament.start_time || '12:30 pm',
          location_name: tournament.location_name || '',
          location_address: tournament.location_address || '',
          max_capacity: tournament.max_capacity,
          entry_fee: tournament.entry_fee,
          format_name: tournament.format_name || '',
          fee_includes: tournament.fee_includes || '',
          checks_payable_to: tournament.checks_payable_to || '',
          contact_name: tournament.contact_name || '',
          contact_phone: tournament.contact_phone || '',
        });
      } else {
        // Creating new tournament - use defaults
        setFormData({
          name: '',
          year: new Date().getFullYear() + 1,
          edition: '',
          event_date: '',
          registration_time: '11:00 am',
          start_time: '12:30 pm',
          location_name: '',
          location_address: '',
          max_capacity: 160,
          entry_fee: 12500,
          format_name: 'Individual Callaway',
          fee_includes: 'Green Fee, Ditty Bag, Drinks & Food',
          checks_payable_to: 'GIAAEO',
          contact_name: '',
          contact_phone: '',
        });
      }
    }
  }, [isOpen, tournament]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (tournament) {
        await api.updateTournament(tournament.id, formData);
        toast.success('Tournament updated successfully');
      } else {
        await api.createTournament(formData);
        toast.success('Tournament created successfully');
      }
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save tournament');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof Tournament, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tournament ? 'Edit Tournament' : 'Create New Tournament'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Tournament Name"
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Edward A.P. Muna II Memorial Golf Tournament"
              required
            />
          </div>
          
          <Input
            label="Year"
            type="number"
            value={formData.year || ''}
            onChange={(e) => handleChange('year', parseInt(e.target.value))}
            required
          />
          
          <Input
            label="Edition"
            value={formData.edition || ''}
            onChange={(e) => handleChange('edition', e.target.value)}
            placeholder="e.g., 5th"
          />
          
          <Input
            label="Event Date"
            value={formData.event_date || ''}
            onChange={(e) => handleChange('event_date', e.target.value)}
            placeholder="e.g., January 9, 2026"
          />
          
          <Input
            label="Max Capacity"
            type="number"
            value={formData.max_capacity || ''}
            onChange={(e) => handleChange('max_capacity', parseInt(e.target.value))}
          />
          
          <Input
            label="Registration Time"
            value={formData.registration_time || ''}
            onChange={(e) => handleChange('registration_time', e.target.value)}
            placeholder="e.g., 11:00 am"
          />
          
          <Input
            label="Start Time"
            value={formData.start_time || ''}
            onChange={(e) => handleChange('start_time', e.target.value)}
            placeholder="e.g., 12:30 pm"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entry Fee ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={((formData.entry_fee || 0) / 100).toFixed(2)}
                onChange={(e) => {
                  const dollars = parseFloat(e.target.value) || 0;
                  const cents = Math.round(dollars * 100);
                  handleChange('entry_fee', cents);
                }}
                className="w-full pl-7 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                placeholder="125.00"
              />
            </div>
          </div>
          
          <Input
            label="Location Name"
            value={formData.location_name || ''}
            onChange={(e) => handleChange('location_name', e.target.value)}
            placeholder="e.g., Country Club of the Pacific"
          />
          
          <div className="sm:col-span-2">
            <Input
              label="Location Address"
              value={formData.location_address || ''}
              onChange={(e) => handleChange('location_address', e.target.value)}
              placeholder="e.g., Windward Hills, Guam"
            />
          </div>
          
          <Input
            label="Format"
            value={formData.format_name || ''}
            onChange={(e) => handleChange('format_name', e.target.value)}
            placeholder="e.g., Individual Callaway"
          />
          
          <Input
            label="Checks Payable To"
            value={formData.checks_payable_to || ''}
            onChange={(e) => handleChange('checks_payable_to', e.target.value)}
          />
          
          <div className="sm:col-span-2">
            <Input
              label="Fee Includes"
              value={formData.fee_includes || ''}
              onChange={(e) => handleChange('fee_includes', e.target.value)}
              placeholder="e.g., Green Fee, Ditty Bag, Drinks & Food"
            />
          </div>
          
          <Input
            label="Contact Name"
            value={formData.contact_name || ''}
            onChange={(e) => handleChange('contact_name', e.target.value)}
          />
          
          <Input
            label="Contact Phone"
            value={formData.contact_phone || ''}
            onChange={(e) => handleChange('contact_phone', e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : tournament ? 'Update Tournament' : 'Create Tournament'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};


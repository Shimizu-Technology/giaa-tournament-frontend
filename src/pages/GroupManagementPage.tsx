import React, { useState, useEffect, useRef } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { Card, Button, Select } from '../components/ui';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Users, GripVertical, Trash2, RefreshCw, Plus, CheckCircle, ChevronDown, ChevronUp, X } from 'lucide-react';
import { api, Golfer, Group } from '../services/api';

interface DraggableGolferProps {
  golfer: Golfer;
  onRemove?: () => void;
  compact?: boolean;
}

const DraggableGolfer: React.FC<DraggableGolferProps> = ({ golfer, onRemove, compact }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: golfer.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 lg:gap-3 ${compact ? 'p-2' : 'p-3'} bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow touch-manipulation`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-1"
      >
        <GripVertical size={compact ? 18 : 20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-gray-900 truncate ${compact ? 'text-sm' : ''}`}>{golfer.name}</p>
        {!compact && <p className="text-xs text-gray-500 truncate">{golfer.email}</p>}
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="text-red-500 hover:text-red-700 p-1.5 touch-manipulation"
        >
          <Trash2 size={compact ? 16 : 18} />
        </button>
      )}
    </div>
  );
};

// Droppable zone component for groups
interface DroppableGroupZoneProps {
  groupId: number;
  children: React.ReactNode;
  isOver: boolean;
  canDrop: boolean;
}

const DroppableGroupZone: React.FC<DroppableGroupZoneProps> = ({ groupId, children, isOver, canDrop }) => {
  const { setNodeRef } = useDroppable({
    id: `group-drop-${groupId}`,
    data: { groupId },
  });

  return (
    <div
      ref={setNodeRef}
      className={`border-2 border-dashed rounded-lg p-3 lg:p-4 text-center transition-colors min-h-[80px] ${
        isOver && canDrop
          ? 'border-blue-500 bg-blue-50'
          : isOver && !canDrop
          ? 'border-red-300 bg-red-50'
          : 'border-gray-300'
      }`}
    >
      {children}
    </div>
  );
};

export const GroupManagementPage: React.FC = () => {
  const [unassigned, setUnassigned] = useState<Golfer[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overGroupId, setOverGroupId] = useState<number | null>(null);
  const [newGroupId, setNewGroupId] = useState<number | null>(null);
  const [showUnassigned, setShowUnassigned] = useState(false);
  
  const groupsContainerRef = useRef<HTMLDivElement>(null);
  const newGroupRef = useRef<HTMLDivElement>(null);

  // Add touch sensor for mobile drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  const fetchData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      
      const [golfersResponse, groupsData] = await Promise.all([
        api.getGolfers({ assigned: 'false', per_page: 1000 }),
        api.getGroups(),
      ]);
      
      setUnassigned(golfersResponse.golfers);
      // Sort groups by group_number in descending order (newest first)
      const sortedGroups = [...groupsData].sort((a, b) => b.group_number - a.group_number);
      setGroups(sortedGroups);
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

  // Scroll to new group when it's created
  useEffect(() => {
    if (newGroupId && newGroupRef.current) {
      newGroupRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const timer = setTimeout(() => setNewGroupId(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [newGroupId, groups]);

  // Auto-hide success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      const overId = over.id as string;
      if (overId.startsWith('group-drop-')) {
        const groupId = parseInt(overId.replace('group-drop-', ''));
        setOverGroupId(groupId);
      } else {
        setOverGroupId(null);
      }
    } else {
      setOverGroupId(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverGroupId(null);

    if (!over) return;

    const activeGolferId = parseInt(active.id as string);
    const overId = over.id as string;

    if (overId.startsWith('group-drop-')) {
      const groupId = parseInt(overId.replace('group-drop-', ''));
      
      const golfer = unassigned.find(g => g.id === activeGolferId);
      if (!golfer) return;

      const group = groups.find(g => g.id === groupId);
      if (!group || (group.golfers?.length || 0) >= 4) return;

      try {
        setUnassigned(prev => prev.filter(g => g.id !== activeGolferId));
        setGroups(prev => prev.map(g => 
          g.id === groupId 
            ? { ...g, golfers: [...(g.golfers || []), golfer] }
            : g
        ));
        
        await api.addGolferToGroup(groupId, activeGolferId);
        await fetchData(false);
        setSuccessMessage(`${golfer.name} added to Group ${group.group_number}`);
      } catch (err) {
        console.error('Error adding golfer to group:', err);
        setError(err instanceof Error ? err.message : 'Failed to add golfer to group');
        await fetchData(false);
      }
    }
  };

  const createNewGroup = async () => {
    try {
      setIsCreating(true);
      setError(null);
      const newGroup = await api.createGroup();
      
      setGroups(prev => [newGroup, ...prev]);
      setNewGroupId(newGroup.id);
      setSuccessMessage(`Group ${newGroup.group_number} created!`);
      
      if (groupsContainerRef.current) {
        groupsContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Error creating group:', err);
      setError(err instanceof Error ? err.message : 'Failed to create group');
    } finally {
      setIsCreating(false);
    }
  };

  const addToGroup = async (groupId: number, golferId: number) => {
    const golfer = unassigned.find(g => g.id === golferId);
    const group = groups.find(g => g.id === groupId);
    
    try {
      if (golfer) {
        setUnassigned(prev => prev.filter(g => g.id !== golferId));
        setGroups(prev => prev.map(g => 
          g.id === groupId 
            ? { ...g, golfers: [...(g.golfers || []), golfer] }
            : g
        ));
      }
      
      await api.addGolferToGroup(groupId, golferId);
      await fetchData(false);
      if (golfer && group) {
        setSuccessMessage(`${golfer.name} added to Group ${group.group_number}`);
      }
    } catch (err) {
      console.error('Error adding golfer to group:', err);
      setError(err instanceof Error ? err.message : 'Failed to add golfer to group');
      await fetchData(false);
    }
  };

  const removeFromGroup = async (groupId: number, golferId: number) => {
    const group = groups.find(g => g.id === groupId);
    const golfer = group?.golfers?.find(g => g.id === golferId);
    
    try {
      setGroups(prev => prev.map(g => 
        g.id === groupId 
          ? { ...g, golfers: g.golfers?.filter(p => p.id !== golferId) || [] }
          : g
      ));
      if (golfer) {
        setUnassigned(prev => [...prev, golfer]);
      }
      
      await api.removeGolferFromGroup(groupId, golferId);
      await fetchData(false);
    } catch (err) {
      console.error('Error removing golfer from group:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove golfer from group');
      await fetchData(false);
    }
  };

  const updateGroupHole = async (groupId: number, hole: number) => {
    try {
      setGroups(prev => prev.map(g => 
        g.id === groupId ? { ...g, hole_number: hole } : g
      ));
      
      await api.setGroupHole(groupId, hole);
    } catch (err) {
      console.error('Error updating group hole:', err);
      setError(err instanceof Error ? err.message : 'Failed to update group hole');
      await fetchData(false);
    }
  };

  const deleteGroup = async (groupId: number) => {
    const group = groups.find(g => g.id === groupId);
    
    try {
      setGroups(prev => prev.filter(g => g.id !== groupId));
      if (group?.golfers) {
        setUnassigned(prev => [...prev, ...group.golfers!]);
      }
      
      await api.deleteGroup(groupId);
      await fetchData(false);
      setSuccessMessage(`Group ${group?.group_number} deleted`);
    } catch (err) {
      console.error('Error deleting group:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete group');
      await fetchData(false);
    }
  };

  const activeGolfer = activeId 
    ? [...unassigned, ...groups.flatMap(g => g.golfers || [])].find(g => g.id.toString() === activeId) 
    : null;

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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-4 lg:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Group Management</h1>
              <p className="text-xs lg:text-sm text-gray-500 mt-1">
                {groups.length} group{groups.length !== 1 ? 's' : ''} • {unassigned.length} unassigned
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={() => fetchData()}
                className="flex-1 sm:flex-none text-sm lg:text-base px-3 lg:px-4"
              >
                <RefreshCw size={18} className="lg:mr-2" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button 
                onClick={createNewGroup} 
                disabled={isCreating}
                className="flex-1 sm:flex-none text-sm lg:text-base px-3 lg:px-4"
              >
                {isCreating ? (
                  <RefreshCw size={18} className="animate-spin lg:mr-2" />
                ) : (
                  <Plus size={18} className="lg:mr-2" />
                )}
                <span className="hidden sm:inline">{isCreating ? 'Creating...' : 'New Group'}</span>
              </Button>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-3 lg:px-4 py-2 lg:py-3 rounded-lg flex items-center gap-2 animate-fade-in text-sm lg:text-base">
              <CheckCircle size={18} />
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-sm lg:text-base">
              {error}
              <button onClick={() => setError(null)} className="ml-2 text-red-500 hover:text-red-700">×</button>
            </div>
          )}

          {/* Mobile: Unassigned Players Toggle */}
          {unassigned.length > 0 && (
            <div className="lg:hidden">
              <button
                onClick={() => setShowUnassigned(!showUnassigned)}
                className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow-md border border-gray-200"
              >
                <div className="flex items-center gap-2">
                  <Users size={20} className="text-blue-900" />
                  <span className="font-semibold text-gray-900">Unassigned Players</span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {unassigned.length}
                  </span>
                </div>
                {showUnassigned ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              
              {showUnassigned && (
                <Card className="mt-2 p-3 animate-fade-in">
                  <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                    <SortableContext
                      items={unassigned.map(g => g.id.toString())}
                      strategy={verticalListSortingStrategy}
                    >
                      {unassigned.map((golfer) => (
                        <DraggableGolfer key={golfer.id} golfer={golfer} compact />
                      ))}
                    </SortableContext>
                  </div>
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Drag players to groups below, or use the dropdown in each group
                  </p>
                </Card>
              )}
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Desktop: Unassigned Players Sidebar */}
            <Card className="hidden lg:block lg:col-span-1">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users size={24} />
                Unassigned Players ({unassigned.length})
              </h2>
              <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                <SortableContext
                  items={unassigned.map(g => g.id.toString())}
                  strategy={verticalListSortingStrategy}
                >
                  {unassigned.map((golfer) => (
                    <DraggableGolfer key={golfer.id} golfer={golfer} />
                  ))}
                </SortableContext>
                {unassigned.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    All players have been assigned to groups
                  </p>
                )}
              </div>
            </Card>

            {/* Groups */}
            <div 
              ref={groupsContainerRef}
              className="lg:col-span-2 space-y-4 max-h-[calc(100vh-280px)] lg:max-h-[calc(100vh-200px)] overflow-y-auto"
            >
              {groups.length === 0 ? (
                <Card className="p-4 lg:p-6">
                  <div className="text-center py-8 lg:py-12">
                    <Users className="mx-auto text-gray-400 mb-4" size={40} />
                    <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">
                      No Groups Created
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Create your first group to start organizing players
                    </p>
                    <Button onClick={createNewGroup} disabled={isCreating}>
                      {isCreating ? 'Creating...' : 'Create New Group'}
                    </Button>
                  </div>
                </Card>
              ) : (
                groups.map((group) => {
                  const isOverThisGroup = overGroupId === group.id;
                  const golferCount = group.golfers?.length || 0;
                  const canDropHere = golferCount < 4;
                  const isNewGroup = newGroupId === group.id;

                  return (
                    <div
                      key={group.id}
                      ref={isNewGroup ? newGroupRef : undefined}
                    >
                      <Card 
                        className={`p-3 lg:p-6 transition-all duration-500 ${
                          golferCount === 4 
                            ? 'border-2 border-green-500' 
                            : isNewGroup 
                            ? 'border-2 border-blue-500 ring-4 ring-blue-100 animate-pulse' 
                            : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3 lg:mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-1 lg:mb-2 flex items-center gap-2 flex-wrap">
                              Group {group.group_number}
                              {golferCount === 4 && (
                                <span className="text-xs lg:text-sm font-normal text-green-600">
                                  (Complete)
                                </span>
                              )}
                              {isNewGroup && (
                                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                                  New!
                                </span>
                              )}
                            </h3>
                            <div className="flex items-center gap-2 lg:gap-4">
                              <Select
                                label="Hole"
                                value={group.hole_number?.toString() || ''}
                                onChange={(e) => updateGroupHole(group.id, parseInt(e.target.value))}
                                options={[
                                  { value: '', label: 'No hole' },
                                  ...Array.from({ length: 18 }, (_, i) => ({
                                    value: String(i + 1),
                                    label: `Hole ${i + 1}`,
                                  })),
                                ]}
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => deleteGroup(group.id)}
                            className="text-red-500 hover:text-red-700 p-2 touch-manipulation"
                            title="Delete group"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className="space-y-2">
                          {group.golfers?.map((player, index) => {
                            const positions = ['A', 'B', 'C', 'D'];
                            const positionLabel = `${group.group_number}${positions[index]}`;
                            
                            return (
                              <div
                                key={player.id}
                                className="flex items-center gap-2 lg:gap-3 p-2 lg:p-3 bg-blue-50 border border-blue-200 rounded-lg"
                              >
                                <div className="w-7 h-7 lg:w-8 lg:h-8 bg-blue-900 text-white rounded-full flex items-center justify-center font-bold text-xs lg:text-sm flex-shrink-0">
                                  {positionLabel}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 text-sm lg:text-base truncate">{player.name}</p>
                                  <p className="text-xs text-gray-500 truncate hidden sm:block">{player.email}</p>
                                </div>
                                <button
                                  onClick={() => removeFromGroup(group.id, player.id)}
                                  className="text-red-500 hover:text-red-700 p-1.5 touch-manipulation flex-shrink-0"
                                  title="Remove from group"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            );
                          })}

                          {golferCount < 4 && (
                            <DroppableGroupZone 
                              groupId={group.id} 
                              isOver={isOverThisGroup}
                              canDrop={canDropHere}
                            >
                              <p className="text-gray-500 text-xs lg:text-sm mb-1 lg:mb-2">
                                {4 - golferCount} spot{4 - golferCount !== 1 ? 's' : ''} remaining
                              </p>
                              <p className="text-xs text-gray-400 mb-2 lg:mb-3 hidden lg:block">
                                {isOverThisGroup && canDropHere 
                                  ? '✓ Drop here to add player!' 
                                  : 'Drag players from the left to add them'}
                              </p>
                              {unassigned.length > 0 && !activeId && (
                                <select
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      addToGroup(group.id, parseInt(e.target.value));
                                      e.target.value = '';
                                    }
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                                  defaultValue=""
                                >
                                  <option value="">Add player...</option>
                                  {unassigned.map(golfer => (
                                    <option key={golfer.id} value={golfer.id}>
                                      {golfer.name}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </DroppableGroupZone>
                          )}
                        </div>
                      </Card>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeGolfer ? (
            <div className="bg-white border-2 border-blue-500 rounded-lg p-3 shadow-xl cursor-grabbing">
              <p className="font-medium text-gray-900">{activeGolfer.name}</p>
              <p className="text-xs text-gray-500">{activeGolfer.email}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </AdminLayout>
  );
};

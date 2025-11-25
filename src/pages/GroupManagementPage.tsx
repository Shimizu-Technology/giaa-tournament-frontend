import React, { useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { Card, Button, Select } from '../components/ui';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Users, GripVertical, Trash2 } from 'lucide-react';
import { Golfer, Group } from '../types';

const mockUnassignedGolfers: Golfer[] = [
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
    createdAt: '2024-01-15T11:00:00Z',
  },
];

interface DraggableGolferProps {
  golfer: Golfer;
  onRemove?: () => void;
}

const DraggableGolfer: React.FC<DraggableGolferProps> = ({ golfer, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: golfer.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
      >
        <GripVertical size={20} />
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-900">{golfer.fullName}</p>
        <p className="text-xs text-gray-500">{golfer.email}</p>
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="text-red-500 hover:text-red-700 p-1"
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  );
};

export const GroupManagementPage: React.FC = () => {
  const [unassigned, setUnassigned] = useState<Golfer[]>(mockUnassignedGolfers);
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
  };

  const createNewGroup = () => {
    const newGroup: Group = {
      id: `group-${Date.now()}`,
      number: groups.length + 1,
      players: [],
    };
    setGroups([...groups, newGroup]);
  };

  const addToGroup = (groupId: string, golferId: string) => {
    const golfer = unassigned.find(g => g.id === golferId);
    if (!golfer) return;

    const group = groups.find(g => g.id === groupId);
    if (!group || group.players.length >= 4) return;

    const positions = ['A', 'B', 'C', 'D'];
    const position = positions[group.players.length];

    const updatedGolfer = {
      ...golfer,
      groupNumber: group.number,
      groupPosition: `${group.number}${position}`,
    };

    setUnassigned(unassigned.filter(g => g.id !== golferId));
    setGroups(groups.map(g =>
      g.id === groupId
        ? { ...g, players: [...g.players, updatedGolfer] }
        : g
    ));
  };

  const removeFromGroup = (groupId: string, golferId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    const golfer = group.players.find(p => p.id === golferId);
    if (!golfer) return;

    const { groupNumber, groupPosition, ...cleanGolfer } = golfer;

    setUnassigned([...unassigned, cleanGolfer]);
    setGroups(groups.map(g => {
      if (g.id === groupId) {
        const updatedPlayers = g.players.filter(p => p.id !== golferId);
        const positions = ['A', 'B', 'C', 'D'];
        return {
          ...g,
          players: updatedPlayers.map((player, index) => ({
            ...player,
            groupPosition: `${g.number}${positions[index]}`,
          })),
        };
      }
      return g;
    }));
  };

  const updateGroupHole = (groupId: string, hole: number) => {
    setGroups(groups.map(g =>
      g.id === groupId ? { ...g, holeAssignment: hole } : g
    ));
  };

  const deleteGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      const cleanPlayers = group.players.map(p => {
        const { groupNumber, groupPosition, ...clean } = p;
        return clean;
      });
      setUnassigned([...unassigned, ...cleanPlayers]);
      setGroups(groups.filter(g => g.id !== groupId).map((g, index) => ({
        ...g,
        number: index + 1,
        players: g.players.map((player, pIndex) => ({
          ...player,
          groupNumber: index + 1,
          groupPosition: `${index + 1}${['A', 'B', 'C', 'D'][pIndex]}`,
        })),
      })));
    }
  };

  return (
    <AdminLayout>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Group Management</h1>
            <Button onClick={createNewGroup}>
              <Users size={18} className="mr-2" />
              Create New Group
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users size={24} />
                Unassigned Players ({unassigned.length})
              </h2>
              <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                <SortableContext
                  items={unassigned.map(g => g.id)}
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

            <div className="lg:col-span-2 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {groups.length === 0 ? (
                <Card>
                  <div className="text-center py-12">
                    <Users className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Groups Created
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Create your first group to start organizing players
                    </p>
                    <Button onClick={createNewGroup}>Create New Group</Button>
                  </div>
                </Card>
              ) : (
                groups.map((group) => (
                  <Card key={group.id} className={group.players.length === 4 ? 'border-2 border-green-500' : ''}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          Group {group.number}
                          {group.players.length === 4 && (
                            <span className="ml-2 text-sm font-normal text-green-600">
                              (Complete)
                            </span>
                          )}
                        </h3>
                        <div className="flex items-center gap-4">
                          <Select
                            label="Assign to Hole"
                            value={group.holeAssignment?.toString() || ''}
                            onChange={(e) => updateGroupHole(group.id, parseInt(e.target.value))}
                            options={[
                              { value: '', label: 'No hole assigned' },
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
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {group.players.map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                        >
                          <div className="w-8 h-8 bg-blue-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {player.groupPosition}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{player.fullName}</p>
                            <p className="text-xs text-gray-500">{player.email}</p>
                          </div>
                          <button
                            onClick={() => removeFromGroup(group.id, player.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}

                      {group.players.length < 4 && (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <p className="text-gray-500 text-sm">
                            {4 - group.players.length} spot{4 - group.players.length !== 1 ? 's' : ''} remaining
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Drag players from the left to add them
                          </p>
                          {unassigned.length > 0 && (
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  addToGroup(group.id, e.target.value);
                                  e.target.value = '';
                                }
                              }}
                              className="mt-3 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              defaultValue=""
                            >
                              <option value="">Select player to add...</option>
                              {unassigned.map(golfer => (
                                <option key={golfer.id} value={golfer.id}>
                                  {golfer.fullName}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="bg-white border-2 border-blue-500 rounded-lg p-3 shadow-lg">
              <p className="font-medium">
                {[...unassigned, ...groups.flatMap(g => g.players)].find(g => g.id === activeId)?.fullName}
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </AdminLayout>
  );
};

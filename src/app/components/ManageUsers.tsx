import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Edit } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';

interface User {
  id: string;
  name: string;
  role: 'Admin' | 'Manager' | 'Operator' | 'View Only';
  status: 'Active' | 'Invited' | 'Disabled';
  lastActive: string;
}

const users: User[] = [
  {
    id: '1',
    name: 'Admin User',
    role: 'Admin',
    status: 'Active',
    lastActive: '5/25/2026'
  },
  {
    id: '2',
    name: 'Manager User',
    role: 'Manager',
    status: 'Active',
    lastActive: '5/24/2026'
  },
  {
    id: '3',
    name: 'Operator User',
    role: 'Operator',
    status: 'Active',
    lastActive: '5/25/2026'
  },
  {
    id: '4',
    name: 'View Only User',
    role: 'View Only',
    status: 'Active',
    lastActive: '5/20/2026'
  }
];

export default function ManageUsers() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/profile-menu')}
            className="text-gray-600 active:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Manage Users</h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        <div className="p-3 bg-gray-50 border border-gray-300 rounded text-xs text-gray-600 leading-relaxed">
          <strong>Static wireframe:</strong> User invites, edits, and role changes are not connected to Supabase yet.
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        {/* Add User Button */}
        <button
          disabled
          className="w-full bg-gray-100 text-gray-500 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Add User (Not Ready)
        </button>

        {/* User List */}
        <div className="space-y-3">
          {filteredUsers.map(user => (
            <UserCard key={user.id} user={user} navigate={navigate} />
          ))}
        </div>

        {/* Annotation */}
        <div className="mt-6 p-3 bg-gray-50 border border-gray-300 rounded text-xs text-gray-600 leading-relaxed">
          <strong>Admin Access:</strong> Manage Users is visible only to Admin, or Manager if allowed.
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function UserCard({ user, navigate }: { user: User; navigate: any }) {
  const getStatusColor = () => {
    if (user.status === 'Active') return 'bg-gray-100 border-gray-300 text-gray-700';
    if (user.status === 'Invited') return 'bg-gray-50 border-gray-200 text-gray-600';
    if (user.status === 'Disabled') return 'bg-gray-100 border-gray-300 text-gray-500';
    return 'bg-gray-100 border-gray-300 text-gray-700';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-semibold text-gray-900 mb-1">{user.name}</div>
          <div className="flex gap-2">
            <span className="text-xs px-2 py-1 bg-gray-100 border border-gray-300 text-gray-700 rounded">
              {user.role}
            </span>
            <span className={`text-xs px-2 py-1 rounded border ${getStatusColor()}`}>
              {user.status}
            </span>
          </div>
        </div>
      </div>
      <div className="text-sm text-gray-600 mb-3">Last active: {user.lastActive}</div>
      <button
        onClick={() => navigate('/edit-user', { state: { user } })}
        className="w-full bg-white border border-gray-300 text-gray-900 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 active:bg-gray-50"
      >
        <Edit size={16} />
        Edit (placeholder)
      </button>
    </div>
  );
}

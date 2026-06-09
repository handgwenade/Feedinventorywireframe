import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Edit } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';

interface User {
  id: string;
  name: string;
  role: 'admin' | 'manager' | 'operator' | 'viewer';
  status: 'Active' | 'Invited' | 'Disabled';
  lastActive: string;
}

function formatRoleLabel(role: User['role']): string {
  if (role === 'viewer') return 'View Only';
  return role.charAt(0).toUpperCase() + role.slice(1);
}

const initialUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    role: 'admin',
    status: 'Active',
    lastActive: '5/25/2026'
  },
  {
    id: '2',
    name: 'Manager User',
    role: 'manager',
    status: 'Active',
    lastActive: '5/24/2026'
  },
  {
    id: '3',
    name: 'Operator User',
    role: 'operator',
    status: 'Active',
    lastActive: '5/25/2026'
  },
  {
    id: '4',
    name: 'View Only User',
    role: 'viewer',
    status: 'Active',
    lastActive: '5/20/2026'
  }
];

export default function ManageUsers() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [showAddUserPanel, setShowAddUserPanel] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<User['role']>('operator');
  const [addUserError, setAddUserError] = useState<string | null>(null);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = () => {
    setAddUserError(null);

    if (!newUserName.trim()) {
      setAddUserError('User name is required.');
      return;
    }

    const user: User = {
      id: `local-${Date.now()}`,
      name: newUserName.trim(),
      role: newUserRole,
      status: 'Invited',
      lastActive: 'Not active yet',
    };

    setUsers((currentUsers) => [user, ...currentUsers]);
    setNewUserName('');
    setNewUserRole('operator');
    setShowAddUserPanel(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f4ed] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-[#e8dfd1] p-4 flex items-center justify-between shadow-[0_1px_4px_rgba(61,47,31,0.06)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/profile-menu')}
            className="text-[#8b7a6f] active:text-[#3d2f1f]"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-[#3d2f1f]">Manage Users</h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        <div className="p-3 bg-white border border-[#ded2c0] rounded-2xl text-xs text-[#8b7a6f] leading-relaxed shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <strong>Beta wireframe:</strong> Added users appear in this session only. Real invites, edits, and role changes are not connected to Supabase yet.
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b7a6f]" size={20} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-[#ded2c0] rounded-2xl text-[#3d2f1f] placeholder:text-[#8b7a6f] focus:outline-none focus:ring-2 focus:ring-[#5a7a4d] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
          />
        </div>

        {/* Add User Button */}
        <button
          onClick={() => {
            setShowAddUserPanel((current) => !current);
            setAddUserError(null);
          }}
          className="w-full bg-[#5a7a4d] text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 active:bg-[#4a6a3d] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
        >
          <Plus size={20} />
          Add User
        </button>

        {showAddUserPanel && (
          <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 space-y-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <div>
              <h2 className="font-bold text-[#3d2f1f] mb-1">Invite User</h2>
              <p className="text-sm text-[#8b7a6f]">
                This creates a local invited user for the wireframe. Supabase invite email is still future work.
              </p>
            </div>

            {addUserError && (
              <div className="p-3 bg-[#fff4f0] border border-[#d8a59a] rounded-2xl text-sm text-[#8b3f2f]">
                {addUserError}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-[#3d2f1f] mb-2">Name</label>
              <input
                type="text"
                value={newUserName}
                onChange={(event) => setNewUserName(event.target.value)}
                placeholder="Enter user name..."
                className="w-full px-4 py-3 bg-white border border-[#ded2c0] rounded-2xl text-[#3d2f1f] placeholder:text-[#8b7a6f] focus:outline-none focus:ring-2 focus:ring-[#5a7a4d]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#3d2f1f] mb-2">Role</label>
              <select
                value={newUserRole}
                onChange={(event) => setNewUserRole(event.target.value as User['role'])}
                className="w-full px-4 py-3 bg-white border border-[#ded2c0] rounded-2xl text-[#3d2f1f] focus:outline-none focus:ring-2 focus:ring-[#5a7a4d]"
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="operator">Operator</option>
                <option value="viewer">View Only</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setShowAddUserPanel(false);
                  setAddUserError(null);
                }}
                className="bg-white border border-[#ded2c0] text-[#3d2f1f] py-3 rounded-2xl font-semibold active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="bg-[#5a7a4d] text-white py-3 rounded-2xl font-semibold active:bg-[#4a6a3d] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
              >
                Add User
              </button>
            </div>
          </div>
        )}

        {/* User List */}
        <div className="space-y-3">
          {filteredUsers.map(user => (
            <UserCard key={user.id} user={user} navigate={navigate} />
          ))}
        </div>

        {/* Annotation */}
        <div className="mt-6 p-3 bg-white border border-[#ded2c0] rounded-2xl text-xs text-[#8b7a6f] leading-relaxed shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <strong>Admin Access:</strong> Manage Users is available to active admins only.
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function UserCard({ user }: { user: User; navigate: any }) {
  const getStatusColor = () => {
    if (user.status === 'Active') return 'bg-[#e9f0e5] border-[#cbd8c4] text-[#5a7a4d]';
    if (user.status === 'Invited') return 'bg-[#fff4d8] border-[#d4a574] text-[#8b5a1f]';
    if (user.status === 'Disabled') return 'bg-[#f7f4ed] border-[#ded2c0] text-[#8b7a6f]';
    return 'bg-[#e9f0e5] border-[#cbd8c4] text-[#5a7a4d]';
  };

  return (
    <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-semibold text-[#3d2f1f] mb-1">{user.name}</div>
          <div className="flex gap-2">
            <span className="text-xs px-3 py-1 bg-[#e9f0e5] border border-[#cbd8c4] text-[#5a7a4d] rounded-full font-semibold">
              {formatRoleLabel(user.role)}
            </span>
            <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${getStatusColor()}`}>
              {user.status}
            </span>
          </div>
        </div>
      </div>
      <div className="text-sm text-[#8b7a6f] mb-3">Last active: {user.lastActive}</div>
      <button
        disabled
        className="w-full bg-[#f7f4ed] border border-[#ded2c0] text-[#8b7a6f] py-2 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 cursor-not-allowed opacity-75 shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
      >
        <Edit size={16} />
        Edit Coming Soon
      </button>
    </div>
  );
}

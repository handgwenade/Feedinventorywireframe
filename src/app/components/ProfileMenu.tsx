import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Settings, Shield, HelpCircle, LogOut, Users, Lock, Building } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';
import { supabase } from '../services/supabaseClient';

// In a real app, this would come from auth context
const currentUser = {
  name: 'Operator User',
  role: 'Operator',
  business: 'C&C Feed Inventory'
};

// Set to 'admin' to see admin-only options
const userRole: 'admin' | 'manager' | 'operator' | 'view-only' = 'operator';

export default function ProfileMenu() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 active:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        {/* Current User Info */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-300">
              <User size={32} className="text-gray-600" />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-lg">{currentUser.name}</div>
              <div className="text-sm text-gray-600">{currentUser.role}</div>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">Business</div>
            <div className="font-medium text-gray-900">{currentUser.business}</div>
          </div>
        </div>

        {/* Menu Options */}
        <div className="space-y-2">
          <MenuOption
            icon={<User size={20} />}
            label="My Profile"
            onClick={() => navigate('/my-profile')}
          />
          <MenuOption
            icon={<Settings size={20} />}
            label="Settings"
            onClick={() => navigate('/settings')}
          />
          <MenuOption
            icon={<Shield size={20} />}
            label="Current Role & Permissions"
            onClick={() => navigate('/role-permissions')}
          />
          <MenuOption
            icon={<HelpCircle size={20} />}
            label="Help / Support"
            onClick={() => {}}
          />

          {/* Admin-only options */}
          {userRole === 'admin' && (
            <>
              <div className="pt-4 pb-2">
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Admin Tools</div>
              </div>
              <MenuOption
                icon={<Users size={20} />}
                label="Manage Users"
                onClick={() => navigate('/manage-users')}
              />
              <MenuOption
                icon={<Lock size={20} />}
                label="Manage Permissions"
                onClick={() => {}}
              />
              <MenuOption
                icon={<Building size={20} />}
                label="Business Settings"
                onClick={() => {}}
              />
            </>
          )}

          <div className="pt-4">
            <MenuOption
              icon={<LogOut size={20} />}
              label="Sign Out"
              onClick={handleSignOut}
              danger
            />
          </div>
        </div>

        {/* Annotations */}
        <div className="mt-6 space-y-3">
          <div className="p-3 bg-gray-50 border border-gray-300 rounded text-xs text-gray-600 leading-relaxed">
            <strong>Role-based menu:</strong> User/profile area is role-based. Admin sees management tools. Operators see personal settings and permissions only.
          </div>
          <div className="p-3 bg-gray-50 border border-gray-300 rounded text-xs text-gray-600 leading-relaxed">
            <strong>Cost visibility:</strong> Cost per unit visibility is permission-based and should only be available to Admin/Manager unless explicitly overridden.
          </div>
          <div className="p-3 bg-gray-50 border border-gray-300 rounded text-xs text-gray-600 leading-relaxed">
            <strong>View Only users:</strong> View Only users can view allowed screens but cannot create, edit, record payments, or adjust inventory.
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function MenuOption({
  icon,
  label,
  onClick,
  danger = false
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-lg flex items-center gap-3 font-medium ${
        danger
          ? 'bg-white border border-gray-300 text-gray-900 active:bg-gray-50'
          : 'bg-white border border-gray-300 text-gray-900 active:bg-gray-50'
      }`}
    >
      <div className={danger ? 'text-gray-700' : 'text-gray-700'}>{icon}</div>
      <span>{label}</span>
    </button>
  );
}

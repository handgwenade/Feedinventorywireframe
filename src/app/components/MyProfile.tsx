import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Key, LogOut } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';

export default function MyProfile() {
  const navigate = useNavigate();

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
          <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        {/* Profile Info */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <div>
            <div className="text-sm text-gray-600 mb-1">Name</div>
            <div className="font-medium text-gray-900">Operator User</div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">Email</div>
            <div className="font-medium text-gray-900">operator@ccfeed.com</div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">Phone (optional)</div>
            <div className="font-medium text-gray-900">(555) 987-6543</div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">Current role</div>
            <div className="font-medium text-gray-900">Operator</div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">Last login</div>
            <div className="font-medium text-gray-900">5/25/2026 8:42 AM</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <ActionButton
            icon={<Edit size={20} />}
            label="Edit Profile"
            onClick={() => {}}
          />
          <ActionButton
            icon={<Key size={20} />}
            label="Change Password"
            onClick={() => {}}
          />
          <ActionButton
            icon={<LogOut size={20} />}
            label="Sign Out"
            onClick={() => navigate('/login')}
          />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 rounded-lg flex items-center gap-3 font-medium bg-white border border-gray-300 text-gray-900 active:bg-gray-50"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

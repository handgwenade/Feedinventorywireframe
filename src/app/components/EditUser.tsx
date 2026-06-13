import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import UserIcon from './shared/UserIcon';
import BottomNav from './shared/BottomNav';

function formatRoleLabel(role: string): string {
  if (role === 'viewer') return 'View Only';
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export default function EditUser() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = location.state || {
    user: {
      id: '3',
      name: 'Operator User',
      email: 'operator@ccfeed.com',
      role: 'operator',
      status: 'Active'
    }
  };

  const [selectedRole, setSelectedRole] = useState(user.role);
  const [selectedStatus, setSelectedStatus] = useState(user.status);

  // Permissions
  const [canTakeFeed, setCanTakeFeed] = useState(true);
  const [canAddStock, setCanAddStock] = useState(true);
  const [canRecordPayments, setCanRecordPayments] = useState(false);
  const [canAdjustCount, setCanAdjustCount] = useState(false);
  const [canAddAccountPerson, setCanAddAccountPerson] = useState(false);
  const [canSeeCostPerUnit, setCanSeeCostPerUnit] = useState(false);
  const [canVoidInvoices, setCanVoidInvoices] = useState(false);
  const [canManageUsers, setCanManageUsers] = useState(false);

  return (
    <div className="min-h-screen bg-[#f7f4ed] pb-32">
      {/* Header */}
      <div className="app-header-safe">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/manage-users')}
            className="app-header-action rounded-2xl text-[#8b7a6f] active:bg-[#faf8f5] active:text-[#3d2f1f]"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-[#3d2f1f]">Edit User</h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        {/* User Info */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 space-y-3 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div>
            <div className="text-sm text-[#8b7a6f] mb-1">User name</div>
            <div className="font-medium text-[#3d2f1f]">{user.name}</div>
          </div>

          <div className="border-t border-[#e8dfd1] pt-3">
            <div className="text-sm text-[#8b7a6f] mb-1">Email</div>
            <div className="font-medium text-[#3d2f1f]">{user.email || 'operator@ccfeed.com'}</div>
          </div>
        </div>

        {/* Role Selector */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div className="text-sm font-medium text-[#8b7a6f] mb-2">Role</div>
          <button className="w-full bg-white border border-[#ded2c0] rounded-2xl p-3 flex items-center justify-between text-[#3d2f1f] active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <span className="font-semibold">{formatRoleLabel(selectedRole)}</span>
            <ChevronDown size={20} className="text-[#8b7a6f]" />
          </button>
        </div>

        {/* Status Selector */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div className="text-sm font-medium text-[#8b7a6f] mb-2">Status</div>
          <button className="w-full bg-white border border-[#ded2c0] rounded-2xl p-3 flex items-center justify-between text-[#3d2f1f] active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <span className="font-semibold">{selectedStatus}</span>
            <ChevronDown size={20} className="text-[#8b7a6f]" />
          </button>
        </div>

        {/* Permission Toggles */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div className="p-4 border-b border-[#e8dfd1] bg-[#f7f4ed]">
            <h2 className="font-semibold text-[#3d2f1f]">Permission Toggles</h2>
          </div>
          <div className="p-4 space-y-3">
            <PermissionToggle label="Can Take Feed" value={canTakeFeed} onChange={setCanTakeFeed} />
            <PermissionToggle label="Can Add Stock" value={canAddStock} onChange={setCanAddStock} />
            <PermissionToggle label="Can Record Payments" value={canRecordPayments} onChange={setCanRecordPayments} />
            <PermissionToggle label="Can Adjust Count" value={canAdjustCount} onChange={setCanAdjustCount} />
            <PermissionToggle label="Can Add Account / Person" value={canAddAccountPerson} onChange={setCanAddAccountPerson} />
            <PermissionToggle label="Can See Cost per Unit" value={canSeeCostPerUnit} onChange={setCanSeeCostPerUnit} />
            <PermissionToggle label="Can Void Invoices" value={canVoidInvoices} onChange={setCanVoidInvoices} />
            <PermissionToggle label="Can Manage Users" value={canManageUsers} onChange={setCanManageUsers} />
          </div>
        </div>

        {/* Note */}
        <div className="p-3 bg-white border border-[#ded2c0] rounded-2xl text-xs text-[#8b7a6f] leading-relaxed shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <strong>Note:</strong> Permissions may be controlled by role defaults with optional overrides.
        </div>
      </div>

      {/* Fixed Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e8dfd1] p-4 max-w-md mx-auto space-y-2 shadow-[0_-4px_18px_rgba(61,47,31,0.14)]">
        <button
          onClick={() => navigate('/manage-users')}
          className="w-full bg-[#5a7a4d] text-white py-4 rounded-2xl font-semibold active:bg-[#4a6a3d] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
        >
          Save Changes
        </button>
        <button
          onClick={() => navigate('/manage-users')}
          className="w-full bg-white border border-[#ded2c0] text-[#3d2f1f] py-3 rounded-2xl font-semibold active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
        >
          Cancel
        </button>

        <BottomNav />
      </div>
    </div>
  );
}

function PermissionToggle({
  label,
  value,
  onChange
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm font-medium text-[#3d2f1f]">{label}</div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          value ? 'bg-[#5a7a4d]' : 'bg-[#ded2c0]'
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
            value ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

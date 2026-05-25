import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import UserIcon from './shared/UserIcon';
import BottomNav from './shared/BottomNav';

export default function EditUser() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = location.state || {
    user: {
      id: '3',
      name: 'Operator User',
      email: 'operator@ccfeed.com',
      role: 'Operator',
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
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/manage-users')}
            className="text-gray-600 active:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Edit User</h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        {/* User Info */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <div>
            <div className="text-sm text-gray-600 mb-1">User name</div>
            <div className="font-medium text-gray-900">{user.name}</div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">Email</div>
            <div className="font-medium text-gray-900">{user.email || 'operator@ccfeed.com'}</div>
          </div>
        </div>

        {/* Role Selector */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-2">Role</div>
          <button className="w-full bg-white border border-gray-300 rounded-lg p-3 flex items-center justify-between text-gray-900 active:bg-gray-50">
            <span className="font-medium">{selectedRole}</span>
            <ChevronDown size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Status Selector */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-2">Status</div>
          <button className="w-full bg-white border border-gray-300 rounded-lg p-3 flex items-center justify-between text-gray-900 active:bg-gray-50">
            <span className="font-medium">{selectedStatus}</span>
            <ChevronDown size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Permission Toggles */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">Permission Toggles</h2>
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
        <div className="p-3 bg-gray-50 border border-gray-300 rounded text-xs text-gray-600 leading-relaxed">
          <strong>Note:</strong> Permissions may be controlled by role defaults with optional overrides.
        </div>
      </div>

      {/* Fixed Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 max-w-md mx-auto space-y-2">
        <button
          onClick={() => navigate('/manage-users')}
          className="w-full bg-gray-900 text-white py-4 rounded-lg font-semibold active:bg-gray-800"
        >
          Save Changes
        </button>
        <button
          onClick={() => navigate('/manage-users')}
          className="w-full bg-white border border-gray-300 text-gray-900 py-3 rounded-lg font-semibold active:bg-gray-50"
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
      <div className="text-sm text-gray-700">{label}</div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          value ? 'bg-gray-900' : 'bg-gray-300'
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

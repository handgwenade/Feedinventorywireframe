import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';

export default function RolePermissions() {
  const navigate = useNavigate();

  const canDo = [
    'Take Feed',
    'Add Stock, if allowed',
    'Create invoices/records',
    'Record payments, if allowed',
    'View inventory',
    'View invoices',
    'View accounts',
    'View activity history'
  ];

  const cannotDo = [
    'See cost per unit',
    'Manage users',
    'Change permissions',
    'Delete records',
    'Edit historical activity'
  ];

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
          <h1 className="text-xl font-semibold text-gray-900">Role & Permissions</h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        {/* Current Role */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Current role</div>
          <div className="text-2xl font-bold text-gray-900">Operator</div>
        </div>

        {/* Operator Can */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">Operator can:</h2>
          </div>
          <div className="p-4 space-y-2">
            {canDo.map((permission, index) => (
              <PermissionItem key={index} label={permission} allowed />
            ))}
          </div>
        </div>

        {/* Operator Cannot */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">Operator cannot:</h2>
          </div>
          <div className="p-4 space-y-2">
            {cannotDo.map((permission, index) => (
              <PermissionItem key={index} label={permission} allowed={false} />
            ))}
          </div>
        </div>

        {/* Role Comparison */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">Role Comparison</h2>
          </div>
          <div className="p-4 space-y-3">
            <RoleCard
              role="Admin"
              description="Full access to all features, user management, and business settings."
            />
            <RoleCard
              role="Manager"
              description="Full operational access with limited user/account management if allowed."
            />
            <RoleCard
              role="Operator"
              description="Can record inventory movement, create invoices/records. Cannot see cost per unit."
              current
            />
            <RoleCard
              role="View Only"
              description="Can view allowed screens but cannot create, edit, or record changes."
            />
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function PermissionItem({ label, allowed }: { label: string; allowed: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {allowed ? (
        <Check size={18} className="text-gray-900 flex-shrink-0" />
      ) : (
        <X size={18} className="text-gray-400 flex-shrink-0" />
      )}
      <span className={`text-sm ${allowed ? 'text-gray-900' : 'text-gray-500'}`}>{label}</span>
    </div>
  );
}

function RoleCard({
  role,
  description,
  current = false
}: {
  role: string;
  description: string;
  current?: boolean;
}) {
  return (
    <div className={`p-3 rounded-lg border ${
      current ? 'bg-gray-50 border-gray-900' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center gap-2 mb-1">
        <div className="font-semibold text-gray-900">{role}</div>
        {current && (
          <span className="text-xs px-2 py-1 bg-gray-900 text-white rounded">Current</span>
        )}
      </div>
      <div className="text-sm text-gray-600">{description}</div>
    </div>
  );
}

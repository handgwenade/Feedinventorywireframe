import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';

export default function UtilityScreensReference() {
  const navigate = useNavigate();

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
          <h1 className="text-xl font-semibold text-gray-900">Utility Screens</h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        <p className="text-sm text-gray-600">
          Reference for login, empty states, warnings, and errors.
        </p>

        {/* Login & Session */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">Login & Session</h2>
          </div>
          <div className="p-4 space-y-2">
            <UtilityLink label="Sign In" route="/login" navigate={navigate} />
            <UtilityLink label="Session Expired" route="/session-expired" navigate={navigate} />
          </div>
        </div>

        {/* Empty States */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">Empty States</h2>
          </div>
          <div className="p-4 space-y-2">
            <UtilityLink label="Empty Inventory" route="/empty-inventory" navigate={navigate} />
            <UtilityLink label="Empty Invoices" route="/empty-invoices" navigate={navigate} />
            <UtilityLink label="Empty Accounts" route="/empty-accounts" navigate={navigate} />
            <UtilityLink label="Empty Reports" route="/empty-reports" navigate={navigate} />
          </div>
        </div>

        {/* Warnings & Errors */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">Warnings & Errors</h2>
          </div>
          <div className="p-4 space-y-2">
            <UtilityLink label="Low Stock Warning" route="/low-stock-warning" navigate={navigate} />
            <UtilityLink label="Not Enough Inventory Error" route="/not-enough-inventory-error" navigate={navigate} />
            <UtilityLink label="Missing Price Warning" route="/missing-price-warning" navigate={navigate} />
            <UtilityLink label="Permission Needed" route="/permission-needed" navigate={navigate} />
            <UtilityLink label="Cannot Edit Activity Warning" route="/cannot-edit-activity-warning" navigate={navigate} />
          </div>
        </div>

        {/* Annotations */}
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 border border-gray-300 rounded text-xs text-gray-600 leading-relaxed">
            <strong>No bottom nav:</strong> Login and session-expired screens do not show bottom navigation.
          </div>
          <div className="p-3 bg-gray-50 border border-gray-300 rounded text-xs text-gray-600 leading-relaxed">
            <strong>Next actions:</strong> Empty states should help the user take the next useful action instead of showing a dead-end screen.
          </div>
          <div className="p-3 bg-gray-50 border border-gray-300 rounded text-xs text-gray-600 leading-relaxed">
            <strong>Plain language:</strong> Errors and warnings should be plain-language, action-oriented, and role-aware.
          </div>
          <div className="p-3 bg-gray-50 border border-gray-300 rounded text-xs text-gray-600 leading-relaxed">
            <strong>No editing history:</strong> Activity History should not be casually editable. Corrections should create a new activity record.
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function UtilityLink({
  label,
  route,
  navigate
}: {
  label: string;
  route: string;
  navigate: any;
}) {
  return (
    <button
      onClick={() => navigate(route)}
      className="w-full p-3 rounded-lg flex items-center justify-between font-medium bg-white border border-gray-300 text-gray-900 active:bg-gray-50"
    >
      <span>{label}</span>
      <span className="text-gray-500">→</span>
    </button>
  );
}

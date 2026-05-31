import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';

export default function UtilityScreensReference() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f7f4ed] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-[#e8dfd1] p-4 flex items-center justify-between shadow-[0_1px_4px_rgba(61,47,31,0.06)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-[#8b7a6f] active:text-[#3d2f1f]"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-[#3d2f1f]">Utility Screens</h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        <p className="text-sm text-[#8b7a6f]">
          Wireframe/reference only. These utility examples are not part of normal production navigation.
        </p>

        {/* Login & Session */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div className="p-4 border-b border-[#e8dfd1] bg-[#f7f4ed]">
            <h2 className="font-semibold text-[#3d2f1f]">Login & Session</h2>
          </div>
          <div className="p-4 space-y-2">
            <UtilityLink label="Sign In" route="/login" navigate={navigate} />
            <UtilityLink label="Session Expired" route="/session-expired" navigate={navigate} />
          </div>
        </div>

        {/* Empty States */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div className="p-4 border-b border-[#e8dfd1] bg-[#f7f4ed]">
            <h2 className="font-semibold text-[#3d2f1f]">Empty States</h2>
          </div>
          <div className="p-4 space-y-2">
            <UtilityLink label="Empty Inventory" route="/empty-inventory" navigate={navigate} />
            <UtilityLink label="Empty Invoices" route="/empty-invoices" navigate={navigate} />
            <UtilityLink label="Empty Accounts" route="/empty-accounts" navigate={navigate} />
            <UtilityLink label="Empty Reports" route="/empty-reports" navigate={navigate} />
          </div>
        </div>

        {/* Warnings & Errors */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div className="p-4 border-b border-[#e8dfd1] bg-[#f7f4ed]">
            <h2 className="font-semibold text-[#3d2f1f]">Warnings & Errors</h2>
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
          <div className="p-3 bg-white border border-[#ded2c0] rounded-2xl text-xs text-[#8b7a6f] leading-relaxed shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <strong>No bottom nav:</strong> Login and session-expired screens do not show bottom navigation.
          </div>
          <div className="p-3 bg-white border border-[#ded2c0] rounded-2xl text-xs text-[#8b7a6f] leading-relaxed shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <strong>Next actions:</strong> Empty states should help the user take the next useful action instead of showing a dead-end screen.
          </div>
          <div className="p-3 bg-white border border-[#ded2c0] rounded-2xl text-xs text-[#8b7a6f] leading-relaxed shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <strong>Plain language:</strong> Errors and warnings should be plain-language, action-oriented, and role-aware.
          </div>
          <div className="p-3 bg-white border border-[#ded2c0] rounded-2xl text-xs text-[#8b7a6f] leading-relaxed shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
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
      className="w-full p-3 rounded-2xl flex items-center justify-between font-semibold bg-white border border-[#ded2c0] text-[#3d2f1f] active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)] transition-colors"
    >
      <span>{label}</span>
      <span className="text-[#8b7a6f]">→</span>
    </button>
  );
}

import { useNavigate } from 'react-router-dom';
import { Users, Plus } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';

export default function EmptyAccounts() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f7f4ed] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-[#e8dfd1] p-4 flex items-center justify-between shadow-[0_1px_4px_rgba(61,47,31,0.06)]">
        <h1 className="text-xl font-bold text-[#3d2f1f]">Accounts</h1>
        <UserIcon />
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center p-8 mt-16">
        <div className="w-24 h-24 bg-[#e9f0e5] rounded-full flex items-center justify-center mb-6 border-2 border-[#cbd8c4] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <Users size={48} className="text-[#5a7a4d]" />
        </div>

        <h2 className="text-xl font-bold text-[#3d2f1f] mb-2">No accounts or people yet.</h2>

        <p className="text-[#8b7a6f] text-center mb-8 max-w-sm">
          Add customers or people records to track who takes feed.
        </p>

        <div className="w-full max-w-sm">
          <button
            onClick={() => navigate('/add-account-person')}
            className="w-full bg-[#5a7a4d] text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 active:bg-[#4a6a3d] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
          >
            <Plus size={20} />
            Add Account / Person
          </button>
        </div>

        {/* Annotation */}
        <div className="mt-8 p-3 bg-white border border-[#ded2c0] rounded-2xl text-xs text-[#8b7a6f] leading-relaxed max-w-sm shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <strong>Permission-based:</strong> Add Account / Person may be visible only to Admin/Manager depending on permissions.
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

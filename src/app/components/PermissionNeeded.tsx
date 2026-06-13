import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';

export default function PermissionNeeded() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f7f4ed] pb-24">
      {/* Header */}
      <div className="app-header-safe">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-[#3d2f1f]">Permission Needed</h1>
        </div>
        <UserIcon />
      </div>

      {/* Permission State */}
      <div className="flex flex-col items-center justify-center p-8 mt-16">
        <div className="w-24 h-24 bg-[#fff4d8] rounded-full flex items-center justify-center mb-6 border-2 border-[#d4a574] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <Lock size={48} className="text-[#8b5a1f]" />
        </div>

        <h2 className="text-xl font-bold text-[#3d2f1f] mb-2">Permission Needed</h2>

        <p className="text-[#8b7a6f] text-center mb-6 max-w-sm">
          Your role does not allow this action.
        </p>

        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 mb-8 max-w-sm shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div className="text-sm font-semibold text-[#3d2f1f] mb-2">Example:</div>
          <div className="text-sm text-[#8b7a6f]">
            Operators cannot see cost per unit or manage users.
          </div>
        </div>

        <div className="w-full max-w-sm">
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-[#5a7a4d] text-white py-4 rounded-2xl font-semibold active:bg-[#4a6a3d] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
          >
            Back
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

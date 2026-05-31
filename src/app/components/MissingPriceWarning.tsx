import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';

export default function MissingPriceWarning() {
  const navigate = useNavigate();

  // In a real app, this would come from user context
  const userRole = 'operator'; // or 'admin', 'manager'
  const canAddPrice = userRole === 'admin' || userRole === 'manager';

  return (
    <div className="min-h-screen bg-[#f7f4ed] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-[#e8dfd1] p-4 flex items-center justify-between shadow-[0_1px_4px_rgba(61,47,31,0.06)]">
        <h1 className="text-xl font-bold text-[#3d2f1f]">Add Products</h1>
        <UserIcon />
      </div>

      {/* Warning Modal Overlay */}
      <div className="fixed inset-0 bg-[#3d2f1f]/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-[#ded2c0] shadow-[0_8px_28px_rgba(61,47,31,0.22)]">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-[#fff4d8] rounded-full flex items-center justify-center border-2 border-[#d4a574] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
              <AlertTriangle size={32} className="text-[#8b5a1f]" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-[#3d2f1f] mb-3 text-center">Missing Price</h2>

          <p className="text-[#8b7a6f] text-center mb-6">
            This product needs a price before it can be invoiced.
          </p>

          <div className="space-y-2">
            {canAddPrice && (
                <button
                  disabled
                  className="w-full bg-[#f7f4ed] border border-[#ded2c0] text-[#8b7a6f] py-3 rounded-2xl font-semibold shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
                >
                  Add Price (Not Ready)
                </button>
              )}
            {!canAddPrice && (
              <div className="text-sm font-medium text-[#8b7a6f] text-center mb-2">
                Admin/Manager only
              </div>
            )}
            <button
              onClick={() => navigate(-1)}
              className="w-full bg-white border border-[#ded2c0] text-[#3d2f1f] py-3 rounded-2xl font-semibold active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

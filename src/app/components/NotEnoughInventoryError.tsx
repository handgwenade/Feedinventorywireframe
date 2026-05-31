import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';

export default function NotEnoughInventoryError() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f7f4ed] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-[#e8dfd1] p-4 flex items-center justify-between shadow-[0_1px_4px_rgba(61,47,31,0.06)]">
        <h1 className="text-xl font-bold text-[#3d2f1f]">Take Feed</h1>
        <UserIcon />
      </div>

      {/* Error Modal Overlay */}
      <div className="fixed inset-0 bg-[#3d2f1f]/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-[#ded2c0] shadow-[0_8px_28px_rgba(61,47,31,0.22)]">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-[#fff4f0] rounded-full flex items-center justify-center border-2 border-[#d8a59a] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
              <XCircle size={32} className="text-[#8b3f2f]" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-[#3d2f1f] mb-3 text-center">Not Enough Inventory</h2>

          <p className="text-[#8b7a6f] text-center mb-6">
            Only 4 available. Adjust quantity or ask a Manager to override.
          </p>

          <div className="space-y-2">
            <button
              onClick={() => navigate(-1)}
              className="w-full bg-[#5a7a4d] text-white py-3 rounded-2xl font-semibold active:bg-[#4a6a3d] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
            >
              Adjust Quantity
            </button>
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

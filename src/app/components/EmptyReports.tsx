import { useNavigate } from 'react-router-dom';
import { BarChart3, ShoppingCart, Plus } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';

export default function EmptyReports() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f7f4ed] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-[#e8dfd1] p-4 flex items-center justify-between shadow-[0_1px_4px_rgba(61,47,31,0.06)]">
        <h1 className="text-xl font-bold text-[#3d2f1f]">Reports</h1>
        <UserIcon />
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center p-8 mt-16">
        <div className="w-24 h-24 bg-[#e9f0e5] rounded-full flex items-center justify-center mb-6 border-2 border-[#cbd8c4] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <BarChart3 size={48} className="text-[#5a7a4d]" />
        </div>

        <h2 className="text-xl font-bold text-[#3d2f1f] mb-2">No report data yet.</h2>

        <p className="text-[#8b7a6f] text-center mb-8 max-w-sm">
          Reports will appear after inventory, feed use, invoices, payments, or activity records exist.
        </p>

        <div className="w-full max-w-sm space-y-3">
          <button
            onClick={() => navigate('/choose-sale-type')}
            className="w-full bg-[#5a7a4d] text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 active:bg-[#4a6a3d] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
          >
            <ShoppingCart size={20} />
            Take Feed
          </button>
          <button
            onClick={() => navigate('/add-stock-select')}
            className="w-full bg-white border border-[#ded2c0] text-[#3d2f1f] py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
          >
            <Plus size={20} />
            Add Stock
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { FileText, ShoppingCart } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';

export default function EmptyInvoices() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f7f4ed] pb-24">
      {/* Header */}
      <div className="app-header-safe">
        <h1 className="text-xl font-bold text-[#3d2f1f]">Invoices</h1>
        <UserIcon />
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center p-8 mt-16">
        <div className="w-24 h-24 bg-[#e9f0e5] rounded-full flex items-center justify-center mb-6 border-2 border-[#cbd8c4] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <FileText size={48} className="text-[#5a7a4d]" />
        </div>

        <h2 className="text-xl font-bold text-[#3d2f1f] mb-2">No invoices yet.</h2>

        <p className="text-[#8b7a6f] text-center mb-8 max-w-sm">
          Invoices will appear after feed is recorded for a customer or K2.
        </p>

        <div className="w-full max-w-sm">
          <button
            onClick={() => navigate('/choose-sale-type')}
            className="w-full bg-[#5a7a4d] text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 active:bg-[#4a6a3d] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
          >
            <ShoppingCart size={20} />
            Take Feed
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { FileText, ShoppingCart } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';

export default function EmptyInvoices() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Invoices</h1>
        <UserIcon />
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center p-8 mt-16">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 border-2 border-gray-300">
          <FileText size={48} className="text-gray-400" />
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">No invoices yet.</h2>

        <p className="text-gray-600 text-center mb-8 max-w-sm">
          Invoices will appear after feed is recorded for a customer, K2, or family.
        </p>

        <div className="w-full max-w-sm">
          <button
            onClick={() => navigate('/choose-sale-type')}
            className="w-full bg-gray-900 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 active:bg-gray-800"
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

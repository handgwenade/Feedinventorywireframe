import { useNavigate } from 'react-router-dom';
import { Package, Upload, Plus } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';

export default function EmptyInventory() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Inventory</h1>
        <UserIcon />
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center p-8 mt-16">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 border-2 border-gray-300">
          <Package size={48} className="text-gray-400" />
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">No products yet.</h2>

        <p className="text-gray-600 text-center mb-8 max-w-sm">
          Import products or add your first product to start tracking inventory.
        </p>

        <div className="w-full max-w-sm space-y-3">
          <button
            onClick={() => {}}
            className="w-full bg-gray-900 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 active:bg-gray-800"
          >
            <Upload size={20} />
            Import Products
          </button>
          <button
            onClick={() => {}}
            className="w-full bg-white border border-gray-300 text-gray-900 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 active:bg-gray-50"
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

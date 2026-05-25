import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, PlusCircle, Package, Home } from 'lucide-react';
import BottomNav from './shared/BottomNav';

export default function AddStockSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    product = { name: 'Garlic Salt Blocks' },
    quantityAdded = 40,
    newQuantity = 287
  } = location.state || {};

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Success Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 border-2 border-gray-900">
            <CheckCircle2 size={32} className="text-gray-900" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Stock Added!</h1>
          <p className="text-gray-600">Stock successfully updated.</p>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {/* Stock Update Details */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <div>
            <div className="text-sm text-gray-600 mb-1">Product</div>
            <div className="font-semibold text-gray-900 text-lg">{product.name}</div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">Quantity added</div>
            <div className="text-xl font-bold text-gray-900">+{quantityAdded}</div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">New quantity</div>
            <div className="text-2xl font-bold text-gray-900">{newQuantity}</div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">Updated by</div>
            <div className="font-medium text-gray-900">Operator</div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 space-y-2">
        <button
          onClick={() => navigate('/add-stock-select')}
          className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 active:bg-gray-800"
        >
          <PlusCircle size={20} />
          Add More Stock
        </button>
        <button
          onClick={() => {}}
          className="w-full bg-white border border-gray-300 text-gray-900 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 active:bg-gray-50"
        >
          <Package size={20} />
          View Product
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full bg-white border border-gray-300 text-gray-900 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 active:bg-gray-50"
        >
          <Home size={20} />
          Back to Dashboard
        </button>
      </div>

      <BottomNav />
    </div>
  );
}

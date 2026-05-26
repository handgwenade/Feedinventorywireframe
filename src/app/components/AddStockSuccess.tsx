import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, PlusCircle, Package, Home } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import type { Product } from '../types';

export default function AddStockSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as {
    product?: Product;
    quantityAdded?: number;
    newQuantity?: number;
  };
  const product = state.product;
  const quantityAdded = state.quantityAdded ?? 40;

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/add-stock-select')}
            className="text-gray-600 active:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Stock Added</h1>
        </div>

        <div className="p-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="text-sm text-gray-700">Select a product before continuing.</div>
            <button
              onClick={() => navigate('/add-stock-select')}
              className="w-full bg-white border border-gray-300 text-gray-900 py-3 rounded-lg font-semibold active:bg-gray-50"
            >
              Back to Product Selection
            </button>
          </div>
        </div>

        <BottomNav />
      </div>
    );
  }

  const newQuantity = state.newQuantity ?? product.currentQuantity + quantityAdded;

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
            <div className="text-xl font-bold text-gray-900">
              +{quantityAdded} {product.unitLabel}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">New quantity</div>
            <div className="text-2xl font-bold text-gray-900">
              {newQuantity} {product.unitLabel}
            </div>
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
          onClick={() => navigate('/product-detail', { state: { product: { ...product, currentQuantity: newQuantity } } })}
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

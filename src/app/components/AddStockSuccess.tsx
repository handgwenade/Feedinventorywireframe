import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, PlusCircle, Package, Home } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import type { Product } from '../types';

export default function AddStockSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as {
    product?: Product;
    productId?: string;
    productName?: string;
    quantityAdded?: number;
    quantityBefore?: number;
    quantityAfter?: number;
    unitLabel?: string;
    inventoryTransactionId?: string;
  };
  const product = state.product;
  const productName = state.productName ?? product?.name;
  const quantityAdded = state.quantityAdded;
  const quantityBefore = state.quantityBefore;
  const quantityAfter = state.quantityAfter;
  const unitLabel = state.unitLabel ?? product?.unitLabel;

  if (!productName || quantityAdded === undefined || quantityBefore === undefined || quantityAfter === undefined || !unitLabel) {
    return (
      <div className="min-h-screen bg-[#f7f4ed] pb-24">
        <div className="bg-white border-b border-[#e8dfd1] p-4 flex items-center gap-3 shadow-[0_1px_4px_rgba(61,47,31,0.06)]">
          <button
            onClick={() => navigate('/add-stock-select')}
            className="text-[#8b7a6f] active:text-[#3d2f1f]"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-[#3d2f1f]">Stock Added</h1>
        </div>

        <div className="p-4">
          <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 space-y-3 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <div className="text-sm text-[#8b7a6f]">Select a product before continuing.</div>
            <button
              onClick={() => navigate('/add-stock-select')}
              className="w-full bg-white border border-[#ded2c0] text-[#3d2f1f] py-3 rounded-2xl font-semibold active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
            >
              Back to Product Selection
            </button>
          </div>
        </div>

        <BottomNav />
      </div>
    );
  }

  const productForDetail = product
    ? { ...product, currentQuantity: quantityAfter }
    : undefined;

  return (
    <div className="min-h-screen bg-[#f7f4ed] flex flex-col">
      {/* Success Header */}
      <div className="bg-white border-b border-[#e8dfd1] p-6 shadow-[0_1px_4px_rgba(61,47,31,0.06)]">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-[#e9f0e5] rounded-full flex items-center justify-center mb-4 border-2 border-[#5a7a4d] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <CheckCircle2 size={32} className="text-[#5a7a4d]" />
          </div>
          <h1 className="text-2xl font-bold text-[#3d2f1f] mb-2">Stock Added!</h1>
          <p className="text-[#8b7a6f]">Stock successfully updated.</p>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {/* Stock Update Details */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 space-y-3 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div>
            <div className="text-sm text-[#8b7a6f] mb-1">Product</div>
            <div className="font-semibold text-[#3d2f1f] text-lg">{productName}</div>
          </div>

          <div className="border-t border-[#e8dfd1] pt-3">
            <div className="text-sm text-[#8b7a6f] mb-1">Quantity added</div>
            <div className="text-xl font-bold text-[#3d2f1f]">
              +{quantityAdded} {unitLabel}
            </div>
          </div>

          <div className="border-t border-[#e8dfd1] pt-3">
            <div className="text-sm text-[#8b7a6f] mb-1">Previous quantity</div>
            <div className="font-semibold text-[#3d2f1f]">
              {quantityBefore} {unitLabel}
            </div>
          </div>

          <div className="border-t border-[#e8dfd1] pt-3">
            <div className="text-sm text-[#8b7a6f] mb-1">New quantity</div>
            <div className="text-2xl font-bold text-[#3d2f1f]">
              {quantityAfter} {unitLabel}
            </div>
          </div>

          <div className="border-t border-[#e8dfd1] pt-3">
            <div className="text-sm text-[#8b7a6f] mb-1">Updated by</div>
            <div className="font-medium text-[#3d2f1f]">Operator</div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 space-y-2">
        <button
          onClick={() => navigate('/add-stock-select')}
          className="w-full bg-[#5a7a4d] text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 active:bg-[#4a6a3d] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
        >
          <PlusCircle size={20} />
          Add More Stock
        </button>
        {productForDetail && (
          <button
            onClick={() => navigate('/product-detail', { state: { product: productForDetail } })}
            className="w-full bg-white border border-[#ded2c0] text-[#3d2f1f] py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
          >
            <Package size={20} />
            View Product
          </button>
        )}
        <button
          onClick={() => navigate('/')}
          className="w-full bg-white border border-[#ded2c0] text-[#3d2f1f] py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
        >
          <Home size={20} />
          Back to Dashboard
        </button>
      </div>

      <BottomNav />
    </div>
  );
}

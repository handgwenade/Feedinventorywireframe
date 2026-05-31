import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import type { Product } from '../types';

export default function AddStockQuantity() {
  const navigate = useNavigate();
  const location = useLocation();
  const { product } = (location.state ?? {}) as { product?: Product };

  const [quantityAddedInput, setQuantityAddedInput] = useState('0');
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const [vendorNote, setVendorNote] = useState('');
  const [notes, setNotes] = useState('');

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f7f4ed] pb-24">
        <div className="bg-white border-b border-[#e8dfd1] p-4 flex items-center gap-3 shadow-[0_1px_4px_rgba(61,47,31,0.06)]">
          <button
            onClick={() => navigate('/add-stock-select')}
            className="text-[#8b7a6f] active:text-[#3d2f1f]"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-[#3d2f1f]">Add Stock</h1>
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

  const quantityAdded = Number(quantityAddedInput);
  const hasValidQuantityAdded = Number.isFinite(quantityAdded) && quantityAdded > 0;
  const newQuantity = product.currentQuantity + (hasValidQuantityAdded ? quantityAdded : 0);

  const handleReview = () => {
    if (!hasValidQuantityAdded) {
      setQuantityError('Enter a quantity greater than 0.');
      return;
    }

    setQuantityError(null);
    navigate('/add-stock-review', {
      state: {
        product,
        quantityAdded,
        newQuantity,
        vendorNote,
        notes
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#f7f4ed] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-[#e8dfd1] p-4 flex items-center gap-3 shadow-[0_1px_4px_rgba(61,47,31,0.06)]">
        <button
          onClick={() => navigate('/add-stock-select')}
          className="text-[#8b7a6f] active:text-[#3d2f1f]"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-[#3d2f1f]">Add Stock</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Selected Product */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div className="text-sm text-[#8b7a6f] mb-1">Product</div>
          <div className="font-bold text-[#3d2f1f] text-lg">{product.name}</div>
        </div>

        {/* Current Quantity */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div className="text-sm text-[#8b7a6f] mb-1">Current quantity</div>
          <div className="text-2xl font-bold text-[#3d2f1f]">
            {product.currentQuantity} {product.unitLabel}
          </div>
        </div>

        {/* Quantity Added */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <label className="block text-sm font-medium text-[#8b7a6f] mb-3">Quantity added</label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                const current = Number(quantityAddedInput);
                const next = Number.isFinite(current) ? Math.max(0, current - 1) : 0;
                setQuantityAddedInput(String(next));
                setQuantityError(null);
              }}
              className="w-12 h-12 bg-[#f7f4ed] border border-[#ded2c0] rounded-2xl flex items-center justify-center text-2xl font-semibold text-[#3d2f1f] active:bg-[#faf8f5]"
            >
              −
            </button>
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              value={quantityAddedInput}
              onChange={(event) => {
                const rawValue = event.target.value;
                if (rawValue === '') {
                  setQuantityAddedInput('');
                  return;
                }
                if (/^\d*$/.test(rawValue)) {
                  setQuantityAddedInput(rawValue.replace(/^0+(\d)/, '$1'));
                }
                setQuantityError(null);
              }}
              onFocus={(event) => {
                if (event.target.value === '0') {
                  setQuantityAddedInput('');
                }
              }}
              placeholder="0"
              className="flex-1 text-center text-2xl font-bold text-[#3d2f1f] bg-white border border-[#ded2c0] rounded-2xl py-2 focus:outline-none focus:ring-2 focus:ring-[#5a7a4d]"
            />
            <button
              onClick={() => {
                const current = Number(quantityAddedInput);
                const next = Number.isFinite(current) ? current + 1 : 1;
                setQuantityAddedInput(String(next));
                setQuantityError(null);
              }}
              className="w-12 h-12 bg-[#f7f4ed] border border-[#ded2c0] rounded-2xl flex items-center justify-center text-2xl font-semibold text-[#3d2f1f] active:bg-[#faf8f5]"
            >
              +
            </button>
          </div>
          {quantityError && (
            <div className="mt-2 text-sm font-medium text-[#8b3f2f]">{quantityError}</div>
          )}
        </div>

        {/* New Quantity Preview */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div className="text-sm font-medium text-[#8b7a6f] mb-3">New quantity preview</div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#8b7a6f]">Current quantity:</span>
              <span className="font-medium text-[#3d2f1f]">
                {product.currentQuantity} {product.unitLabel}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#8b7a6f]">Quantity added:</span>
              <span className="font-medium text-[#3d2f1f]">
                {quantityAdded} {product.unitLabel}
              </span>
            </div>
            <div className="pt-2 border-t border-[#e8dfd1] flex justify-between">
              <span className="font-semibold text-[#3d2f1f]">New quantity:</span>
              <span className="text-xl font-bold text-[#3d2f1f]">
                {newQuantity} {product.unitLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Vendor/Source Note */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <label className="block text-sm font-medium text-[#8b7a6f] mb-2">
            Vendor/source note
          </label>
          <input
            type="text"
            value={vendorNote}
            onChange={(event) => setVendorNote(event.target.value)}
            placeholder="Vendor, delivery, or source..."
            className="w-full px-4 py-3 bg-white border border-[#ded2c0] rounded-2xl text-[#3d2f1f] placeholder:text-[#8b7a6f] focus:outline-none focus:ring-2 focus:ring-[#5a7a4d]"
          />
        </div>

        {/* Notes */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <label className="block text-sm font-medium text-[#8b7a6f] mb-2">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Add restock note..."
            rows={3}
            className="w-full bg-white border border-[#ded2c0] rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-[#5a7a4d] text-[#3d2f1f] placeholder:text-[#8b7a6f]"
          />
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e8dfd1] p-4 max-w-md mx-auto shadow-[0_-4px_18px_rgba(61,47,31,0.14)]">
        <button
          onClick={handleReview}
          className="w-full bg-[#5a7a4d] text-white py-3 rounded-2xl font-semibold active:bg-[#4a6a3d] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
        >
          Review Stock Update
        </button>

        {/* Role-based Field Annotation */}
        <div className="mt-3 p-3 bg-[#f7f4ed] border border-[#ded2c0] rounded-2xl text-xs text-[#8b7a6f] leading-relaxed">
          <strong>Role-based field:</strong><br />
          Cost per unit is visible only to Admin and Manager users. It is hidden for Operators and View Only users.
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

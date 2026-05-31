import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Package } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import { inventoryService, type AdjustProductCountResult } from '../services/inventoryService';
import type { Product } from '../types';

export default function AdjustCount() {
  const navigate = useNavigate();
  const location = useLocation();
  const { product } = (location.state ?? {}) as { product?: Product };

  const [physicalCount, setPhysicalCount] = useState('');
  const [reasonNote, setReasonNote] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [adjustmentResult, setAdjustmentResult] = useState<AdjustProductCountResult | null>(null);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f7f4ed] pb-24">
        <div className="bg-white border-b border-[#e8dfd1] p-4 flex items-center gap-3 shadow-[0_1px_4px_rgba(61,47,31,0.06)]">
          <button
            onClick={() => navigate('/inventory')}
            className="text-[#8b7a6f] active:text-[#3d2f1f]"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-[#3d2f1f]">Adjust Count</h1>
        </div>

        <div className="p-4">
          <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 space-y-3 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <div className="text-sm text-[#8b7a6f]">Select a product before continuing.</div>
            <button
              onClick={() => navigate('/inventory')}
              className="w-full bg-white border border-[#ded2c0] text-[#3d2f1f] py-3 rounded-2xl font-semibold active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
            >
              Back to Inventory
            </button>
          </div>
        </div>

        <BottomNav />
      </div>
    );
  }

  const parsedPhysicalCount = physicalCount === '' ? null : Number(physicalCount);
  const hasValidPhysicalCount = parsedPhysicalCount !== null && Number.isFinite(parsedPhysicalCount);
  const difference = hasValidPhysicalCount ? parsedPhysicalCount - product.currentQuantity : 0;
  const differenceText = difference > 0 ? `+${difference}` : difference.toString();
  const updatedProduct = adjustmentResult
    ? { ...product, currentQuantity: adjustmentResult.quantityAfter }
    : product;

  const handleSave = async () => {
    setErrorMessage(null);

    if (!hasValidPhysicalCount || parsedPhysicalCount < 0) {
      setErrorMessage('Enter a physical count of zero or greater.');
      return;
    }

    if (!reasonNote.trim()) {
      setErrorMessage('Adjustment reason is required.');
      return;
    }

    try {
      setIsSaving(true);
      const result = await inventoryService.adjustProductCount({
        productId: product.id,
        newQuantity: parsedPhysicalCount,
        reason: reasonNote,
        notes,
      });

      setAdjustmentResult(result);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to adjust count.');
    } finally {
      setIsSaving(false);
    }
  };

  if (adjustmentResult) {
    return (
      <div className="min-h-screen bg-[#f7f4ed] flex flex-col">
        <div className="bg-white border-b border-[#e8dfd1] p-6 shadow-[0_1px_4px_rgba(61,47,31,0.06)]">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#e9f0e5] rounded-full flex items-center justify-center mb-4 border-2 border-[#5a7a4d] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
              <CheckCircle2 size={32} className="text-[#5a7a4d]" />
            </div>
            <h1 className="text-2xl font-bold text-[#3d2f1f] mb-2">Count Adjusted</h1>
            <p className="text-[#8b7a6f]">Inventory correction was recorded.</p>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-4">
          <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 space-y-3 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <div>
              <div className="text-sm text-[#8b7a6f] mb-1">Product</div>
              <div className="font-semibold text-[#3d2f1f] text-lg">{adjustmentResult.productName}</div>
            </div>

            <div className="border-t border-[#e8dfd1] pt-3">
              <div className="text-sm text-[#8b7a6f] mb-1">Previous quantity</div>
              <div className="font-semibold text-[#3d2f1f]">
                {adjustmentResult.quantityBefore} {adjustmentResult.unitLabel}
              </div>
            </div>

            <div className="border-t border-[#e8dfd1] pt-3">
              <div className="text-sm text-[#8b7a6f] mb-1">New quantity</div>
              <div className="text-2xl font-bold text-[#3d2f1f]">
                {adjustmentResult.quantityAfter} {adjustmentResult.unitLabel}
              </div>
            </div>

            <div className="border-t border-[#e8dfd1] pt-3">
              <div className="text-sm text-[#8b7a6f] mb-1">Change</div>
              <div className="font-semibold text-[#3d2f1f]">
                {adjustmentResult.quantityChange > 0 ? '+' : ''}{adjustmentResult.quantityChange} {adjustmentResult.unitLabel}
              </div>
            </div>

            <div className="border-t border-[#e8dfd1] pt-3">
              <div className="text-sm text-[#8b7a6f] mb-1">Reason</div>
              <div className="text-[#3d2f1f]">{adjustmentResult.reason}</div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-2">
          <button
            onClick={() => navigate('/product-detail', { state: { product: updatedProduct, adjustmentResult } })}
            className="w-full bg-[#5a7a4d] text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 active:bg-[#4a6a3d] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
          >
            <Package size={20} />
            View Product
          </button>
          <button
            onClick={() => navigate('/inventory')}
            className="w-full bg-white border border-[#ded2c0] text-[#3d2f1f] py-3 rounded-2xl font-semibold active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
          >
            Back to Inventory
          </button>
        </div>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4ed] pb-32">
      {/* Header */}
      <div className="bg-white border-b border-[#e8dfd1] p-4 flex items-center gap-3 shadow-[0_1px_4px_rgba(61,47,31,0.06)]">
        <button
          onClick={() => navigate('/product-detail', { state: { product } })}
          className="text-[#8b7a6f] active:text-[#3d2f1f]"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-[#3d2f1f]">Adjust Count</h1>
      </div>

      <div className="p-4 space-y-4">
        {errorMessage && (
          <div className="bg-white border border-[#b7791f] rounded-2xl p-4 text-sm text-[#3d2f1f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            {errorMessage}
          </div>
        )}

        {/* Product */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div className="text-sm text-[#8b7a6f] mb-1">Product</div>
          <div className="font-semibold text-[#3d2f1f] text-lg">{product.name}</div>
        </div>

        {/* Current App Quantity */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div className="text-sm text-[#8b7a6f] mb-1">Current app quantity</div>
          <div className="text-2xl font-bold text-[#3d2f1f]">
            {product.currentQuantity} {product.unitLabel}
          </div>
        </div>

        {/* Physical Count */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <label className="block text-sm font-medium text-[#8b7a6f] mb-2">
            Physical count
          </label>
          <input
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={physicalCount}
            onChange={(e) => setPhysicalCount(e.target.value)}
            onFocus={(e) => {
              if (e.target.value === '0') {
                e.target.select();
              }
            }}
            placeholder="Enter actual count..."
            className="w-full px-4 py-3 bg-white border border-[#ded2c0] rounded-2xl text-[#3d2f1f] text-2xl font-bold placeholder:text-[#8b7a6f] focus:outline-none focus:ring-2 focus:ring-[#5a7a4d]"
          />
        </div>

        {/* Difference Preview */}
        {physicalCount && hasValidPhysicalCount && (
          <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <div className="text-sm font-medium text-[#8b7a6f] mb-3">Difference preview</div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#8b7a6f]">Current app quantity:</span>
                <span className="font-medium text-[#3d2f1f]">
                  {product.currentQuantity} {product.unitLabel}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8b7a6f]">Physical count:</span>
                <span className="font-medium text-[#3d2f1f]">
                  {physicalCount} {product.unitLabel}
                </span>
              </div>
              <div className="pt-2 border-t border-[#e8dfd1] flex justify-between">
                <span className="font-semibold text-[#3d2f1f]">Difference:</span>
                <span className={`text-xl font-bold ${difference > 0 ? 'text-[#3d2f1f]' : 'text-[#3d2f1f]'}`}>
                  {differenceText} {product.unitLabel}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Reason/Note */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <label className="block text-sm font-medium text-[#8b7a6f] mb-2">
            Reason
          </label>
          <textarea
            value={reasonNote}
            onChange={(e) => setReasonNote(e.target.value)}
            placeholder="Explain the count adjustment..."
            rows={3}
            className="w-full bg-white border border-[#ded2c0] rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-[#5a7a4d] text-[#3d2f1f] placeholder:text-[#8b7a6f]"
          />
        </div>

        {/* Notes */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <label className="block text-sm font-medium text-[#8b7a6f] mb-2">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add optional audit note..."
            rows={3}
            className="w-full bg-white border border-[#ded2c0] rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-[#5a7a4d] text-[#3d2f1f] placeholder:text-[#8b7a6f]"
          />
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e8dfd1] p-4 max-w-md mx-auto shadow-[0_-4px_18px_rgba(61,47,31,0.14)]">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-[#5a7a4d] text-white py-3 rounded-2xl font-semibold active:bg-[#4a6a3d] disabled:bg-[#c7bdb0] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
        >
          {isSaving ? 'Saving Adjustment...' : 'Save Count Adjustment'}
        </button>

        {/* Workflow Annotation */}
        <div className="mt-3 p-3 bg-[#f7f4ed] border border-[#ded2c0] rounded-2xl text-xs text-[#8b7a6f] leading-relaxed">
          <strong>Adjust Count:</strong><br />
          Adjust Count is for inventory corrections only. It does not create an invoice.
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

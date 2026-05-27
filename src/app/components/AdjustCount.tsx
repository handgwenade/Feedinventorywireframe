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
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/inventory')}
            className="text-gray-600 active:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Adjust Count</h1>
        </div>

        <div className="p-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="text-sm text-gray-700">Select a product before continuing.</div>
            <button
              onClick={() => navigate('/inventory')}
              className="w-full bg-white border border-gray-300 text-gray-900 py-3 rounded-lg font-semibold active:bg-gray-50"
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
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 border-2 border-gray-900">
              <CheckCircle2 size={32} className="text-gray-900" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Count Adjusted</h1>
            <p className="text-gray-600">Inventory correction was recorded.</p>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            <div>
              <div className="text-sm text-gray-600 mb-1">Product</div>
              <div className="font-semibold text-gray-900 text-lg">{adjustmentResult.productName}</div>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <div className="text-sm text-gray-600 mb-1">Previous quantity</div>
              <div className="font-semibold text-gray-900">
                {adjustmentResult.quantityBefore} {adjustmentResult.unitLabel}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <div className="text-sm text-gray-600 mb-1">New quantity</div>
              <div className="text-2xl font-bold text-gray-900">
                {adjustmentResult.quantityAfter} {adjustmentResult.unitLabel}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <div className="text-sm text-gray-600 mb-1">Change</div>
              <div className="font-semibold text-gray-900">
                {adjustmentResult.quantityChange > 0 ? '+' : ''}{adjustmentResult.quantityChange} {adjustmentResult.unitLabel}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <div className="text-sm text-gray-600 mb-1">Reason</div>
              <div className="text-gray-900">{adjustmentResult.reason}</div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-2">
          <button
            onClick={() => navigate('/product-detail', { state: { product: updatedProduct, adjustmentResult } })}
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 active:bg-gray-800"
          >
            <Package size={20} />
            View Product
          </button>
          <button
            onClick={() => navigate('/inventory')}
            className="w-full bg-white border border-gray-300 text-gray-900 py-3 rounded-lg font-semibold active:bg-gray-50"
          >
            Back to Inventory
          </button>
        </div>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/product-detail', { state: { product } })}
          className="text-gray-600 active:text-gray-900"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Adjust Count</h1>
      </div>

      <div className="p-4 space-y-4">
        {errorMessage && (
          <div className="bg-white border border-gray-300 rounded-lg p-4 text-sm text-gray-900">
            {errorMessage}
          </div>
        )}

        {/* Product */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Product</div>
          <div className="font-semibold text-gray-900 text-lg">{product.name}</div>
        </div>

        {/* Current App Quantity */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Current app quantity</div>
          <div className="text-2xl font-bold text-gray-900">
            {product.currentQuantity} {product.unitLabel}
          </div>
        </div>

        {/* Physical Count */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Physical count
          </label>
          <input
            type="number"
            min="0"
            step="any"
            value={physicalCount}
            onChange={(e) => setPhysicalCount(e.target.value)}
            placeholder="Enter actual count..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        {/* Difference Preview */}
        {physicalCount && hasValidPhysicalCount && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700 mb-3">Difference preview</div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Current app quantity:</span>
                <span className="font-medium text-gray-900">
                  {product.currentQuantity} {product.unitLabel}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Physical count:</span>
                <span className="font-medium text-gray-900">
                  {physicalCount} {product.unitLabel}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between">
                <span className="font-semibold text-gray-900">Difference:</span>
                <span className={`text-xl font-bold ${difference > 0 ? 'text-gray-900' : 'text-gray-900'}`}>
                  {differenceText} {product.unitLabel}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Reason/Note */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason
          </label>
          <textarea
            value={reasonNote}
            onChange={(e) => setReasonNote(e.target.value)}
            placeholder="Explain the count adjustment..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900"
          />
        </div>

        {/* Notes */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add optional audit note..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900"
          />
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 max-w-md mx-auto">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold active:bg-gray-800 disabled:bg-gray-400"
        >
          {isSaving ? 'Saving Adjustment...' : 'Save Count Adjustment'}
        </button>

        {/* Workflow Annotation */}
        <div className="mt-3 p-3 bg-gray-50 border border-gray-300 rounded text-xs text-gray-600 leading-relaxed">
          <strong>Adjust Count:</strong><br />
          Adjust Count is for inventory corrections only. It does not create an invoice.
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

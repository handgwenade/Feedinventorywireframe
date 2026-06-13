import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import { inventoryService } from '../services/inventoryService';
import type { Product } from '../types';

export default function AddStockReview() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as {
    product?: Product;
    quantityAdded?: number;
    newQuantity?: number;
    vendorNote?: string;
    notes?: string;
  };
  const product = state.product;
  const quantityAdded = Number(state.quantityAdded ?? 0);
  const vendorNote = state.vendorNote ?? '';
  const notes = state.notes ?? '';
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f7f4ed] pb-24">
        <div className="app-header-safe app-header-safe-start">
          <button
            type="button"
            onClick={() => navigate('/add-stock-select')}
            className="app-header-action rounded-2xl text-[#8b7a6f] active:bg-[#faf8f5] active:text-[#3d2f1f]"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-[#3d2f1f]">Review Stock Update</h1>
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

  const newQuantity = state.newQuantity ?? product.currentQuantity + quantityAdded;

  const handleAddStock = async () => {
    setErrorMessage(null);

    if (quantityAdded <= 0) {
      setErrorMessage('Quantity added must be greater than zero.');
      return;
    }

    try {
      setIsSaving(true);
      const stockResult = await inventoryService.addProductStock({
        productId: product.id,
        quantityAdded,
        vendorNote,
        notes,
      });
      const updatedProduct = {
        ...product,
        currentQuantity: stockResult.quantityAfter,
      };

      navigate('/add-stock-success', {
        state: {
          product: updatedProduct,
          productId: stockResult.productId,
          productName: stockResult.productName,
          quantityAdded: stockResult.quantityAdded,
          quantityBefore: stockResult.quantityBefore,
          quantityAfter: stockResult.quantityAfter,
          unitLabel: stockResult.unitLabel,
          inventoryTransactionId: stockResult.inventoryTransactionId,
          vendorNote,
          notes,
        }
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to add stock.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    navigate('/add-stock-quantity', {
      state: {
        product,
        quantityAdded,
        vendorNote,
        notes,
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#f7f4ed] pb-32">
      {/* Header */}
      <div className="app-header-safe app-header-safe-start">
        <button
          type="button"
          onClick={() => navigate('/add-stock-quantity', { state: { product } })}
          className="app-header-action rounded-2xl text-[#8b7a6f] active:bg-[#faf8f5] active:text-[#3d2f1f]"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-[#3d2f1f]">Review Stock Update</h1>
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

        {/* Stock Change Summary */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 space-y-3 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div className="flex justify-between">
            <span className="text-[#8b7a6f]">Current quantity</span>
            <span className="font-medium text-[#3d2f1f]">
              {product.currentQuantity} {product.unitLabel}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8b7a6f]">Quantity added</span>
            <span className="font-medium text-[#3d2f1f]">+{quantityAdded} {product.unitLabel}</span>
          </div>
          <div className="pt-3 border-t border-[#e8dfd1] flex justify-between items-center">
            <span className="font-semibold text-[#3d2f1f] text-lg">New quantity</span>
            <span className="font-bold text-[#3d2f1f] text-2xl">
              {newQuantity} {product.unitLabel}
            </span>
          </div>
        </div>

        {/* Vendor/Source Note */}
        {vendorNote && (
          <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <div className="text-sm text-[#8b7a6f] mb-1">Vendor/source</div>
            <div className="text-[#3d2f1f]">{vendorNote}</div>
          </div>
        )}

        {/* Notes */}
        {notes && (
          <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <div className="text-sm text-[#8b7a6f] mb-1">Notes</div>
            <div className="text-[#3d2f1f]">{notes}</div>
          </div>
        )}

        {/* Updated By */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div className="text-sm text-[#8b7a6f] mb-1">Updated by</div>
          <div className="font-medium text-[#3d2f1f]">Operator</div>
        </div>
      </div>

      {/* Fixed Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e8dfd1] p-4 max-w-md mx-auto space-y-2 shadow-[0_-4px_18px_rgba(61,47,31,0.14)]">
        <button
          onClick={handleEdit}
          disabled={isSaving}
          className="w-full bg-white border border-[#ded2c0] text-[#3d2f1f] py-3 rounded-2xl font-semibold active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
        >
          Edit
        </button>
        <button
          onClick={handleAddStock}
          disabled={isSaving}
          className="w-full bg-[#5a7a4d] text-white py-4 rounded-2xl font-semibold active:bg-[#4a6a3d] disabled:bg-[#c7bdb0] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
        >
          {isSaving ? 'Adding Stock...' : 'Add Stock'}
        </button>

        {/* Workflow Annotation */}
        <div className="mt-3 p-3 bg-[#f7f4ed] border border-[#ded2c0] rounded-2xl text-xs text-[#8b7a6f] leading-relaxed">
          <strong>Add Stock Workflow:</strong><br />
          Add Stock increases product quantity and creates a restock transaction in Activity History. No invoice is created.
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

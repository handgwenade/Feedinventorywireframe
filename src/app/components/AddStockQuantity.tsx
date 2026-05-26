import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import type { Product } from '../types';

export default function AddStockQuantity() {
  const navigate = useNavigate();
  const location = useLocation();
  const { product } = (location.state ?? {}) as { product?: Product };

  const [quantityAdded, setQuantityAdded] = useState(40);
  const [vendorNote, setVendorNote] = useState('');
  const [notes, setNotes] = useState('');

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
          <h1 className="text-xl font-semibold text-gray-900">Add Stock</h1>
        </div>

        <div className="p-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
            Select a product before adding stock.
          </div>
        </div>

        <BottomNav />
      </div>
    );
  }

  const newQuantity = product.currentQuantity + quantityAdded;

  const handleReview = () => {
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
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/add-stock-select')}
          className="text-gray-600 active:text-gray-900"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Add Stock</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Selected Product */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Product</div>
          <div className="font-semibold text-gray-900 text-lg">{product.name}</div>
        </div>

        {/* Current Quantity */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Current quantity</div>
          <div className="text-2xl font-bold text-gray-900">
            {product.currentQuantity} {product.unitLabel}
          </div>
        </div>

        {/* Quantity Added */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">Quantity added</label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQuantityAdded(Math.max(1, quantityAdded - 1))}
              className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl font-semibold text-gray-700 active:bg-gray-200"
            >
              −
            </button>
            <input
              type="number"
              value={quantityAdded}
              onChange={(event) => setQuantityAdded(Math.max(1, parseInt(event.target.value) || 1))}
              className="flex-1 text-center text-2xl font-semibold text-gray-900 border border-gray-300 rounded-lg py-2"
            />
            <button
              onClick={() => setQuantityAdded(quantityAdded + 1)}
              className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl font-semibold text-gray-700 active:bg-gray-200"
            >
              +
            </button>
          </div>
        </div>

        {/* New Quantity Preview */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-700 mb-3">New quantity preview</div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current quantity:</span>
              <span className="font-medium text-gray-900">
                {product.currentQuantity} {product.unitLabel}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Quantity added:</span>
              <span className="font-medium text-gray-900">
                {quantityAdded} {product.unitLabel}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between">
              <span className="font-semibold text-gray-900">New quantity:</span>
              <span className="text-xl font-bold text-gray-900">
                {newQuantity} {product.unitLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Vendor/Source Note */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vendor/source note
          </label>
          <input
            type="text"
            value={vendorNote}
            onChange={(event) => setVendorNote(event.target.value)}
            placeholder="Vendor, delivery, or source..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        {/* Notes */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Add restock note..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900"
          />
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 max-w-md mx-auto">
        <button
          onClick={handleReview}
          className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold active:bg-gray-800"
        >
          Review Stock Update
        </button>

        {/* Role-based Field Annotation */}
        <div className="mt-3 p-3 bg-gray-50 border border-gray-300 rounded text-xs text-gray-600 leading-relaxed">
          <strong>Role-based field:</strong><br />
          Cost per unit is visible only to Admin and Manager users. It is hidden for Operators and View Only users.
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

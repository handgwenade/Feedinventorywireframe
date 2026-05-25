import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BottomNav from './shared/BottomNav';

interface Product {
  id: string;
  name: string;
  available: number;
  price: number;
}

export default function AdjustCount() {
  const navigate = useNavigate();
  const location = useLocation();
  const { product } = location.state || { product: { name: 'Garlic Salt Blocks', available: 247, price: 17.15 } };

  const [physicalCount, setPhysicalCount] = useState('');
  const [reasonNote, setReasonNote] = useState('');

  const difference = physicalCount ? parseInt(physicalCount) - product.available : 0;
  const differenceText = difference > 0 ? `+${difference}` : difference.toString();

  const handleSave = () => {
    // Navigate back to product detail with success message
    navigate('/product-detail', { state: { product } });
  };

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
        {/* Product */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Product</div>
          <div className="font-semibold text-gray-900 text-lg">{product.name}</div>
        </div>

        {/* Current App Quantity */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Current app quantity</div>
          <div className="text-2xl font-bold text-gray-900">{product.available}</div>
        </div>

        {/* Physical Count */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Physical count
          </label>
          <input
            type="number"
            value={physicalCount}
            onChange={(e) => setPhysicalCount(e.target.value)}
            placeholder="Enter actual count..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        {/* Difference Preview */}
        {physicalCount && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700 mb-3">Difference preview</div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Current app quantity:</span>
                <span className="font-medium text-gray-900">{product.available}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Physical count:</span>
                <span className="font-medium text-gray-900">{physicalCount}</span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between">
                <span className="font-semibold text-gray-900">Difference:</span>
                <span className={`text-xl font-bold ${difference > 0 ? 'text-gray-900' : 'text-gray-900'}`}>
                  {differenceText}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Reason/Note */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason/note
          </label>
          <textarea
            value={reasonNote}
            onChange={(e) => setReasonNote(e.target.value)}
            placeholder="Explain the count adjustment..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900"
          />
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 max-w-md mx-auto">
        <button
          onClick={handleSave}
          className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold active:bg-gray-800"
        >
          Save Count Adjustment
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

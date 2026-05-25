import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BottomNav from './shared/BottomNav';

export default function AddStockReview() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    product = { name: 'Garlic Salt Blocks', available: 247 },
    quantityAdded = 40,
    newQuantity = 287,
    vendorNote = '',
    notes = ''
  } = location.state || {};

  const handleAddStock = () => {
    navigate('/add-stock-success', {
      state: {
        product,
        quantityAdded,
        newQuantity
      }
    });
  };

  const handleEdit = () => {
    navigate('/add-stock-quantity', {
      state: {
        product
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/add-stock-quantity')}
          className="text-gray-600 active:text-gray-900"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Review Stock Update</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Product */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Product</div>
          <div className="font-semibold text-gray-900 text-lg">{product.name}</div>
        </div>

        {/* Stock Change Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-700">Current quantity</span>
            <span className="font-medium text-gray-900">{product.available}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Quantity added</span>
            <span className="font-medium text-gray-900">+{quantityAdded}</span>
          </div>
          <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
            <span className="font-semibold text-gray-900 text-lg">New quantity</span>
            <span className="font-bold text-gray-900 text-2xl">{newQuantity}</span>
          </div>
        </div>

        {/* Vendor/Source Note */}
        {vendorNote && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Vendor/source</div>
            <div className="text-gray-900">{vendorNote}</div>
          </div>
        )}

        {/* Notes */}
        {notes && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Notes</div>
            <div className="text-gray-900">{notes}</div>
          </div>
        )}

        {/* Updated By */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Updated by</div>
          <div className="font-medium text-gray-900">Operator</div>
        </div>
      </div>

      {/* Fixed Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 max-w-md mx-auto space-y-2">
        <button
          onClick={handleEdit}
          className="w-full bg-white border border-gray-300 text-gray-900 py-3 rounded-lg font-semibold active:bg-gray-50"
        >
          Edit
        </button>
        <button
          onClick={handleAddStock}
          className="w-full bg-gray-900 text-white py-4 rounded-lg font-semibold active:bg-gray-800"
        >
          Add Stock
        </button>

        {/* Workflow Annotation */}
        <div className="mt-3 p-3 bg-gray-50 border border-gray-300 rounded text-xs text-gray-600 leading-relaxed">
          <strong>Add Stock Workflow:</strong><br />
          Add Stock increases product quantity and creates a restock transaction in Activity History. No invoice is created.
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

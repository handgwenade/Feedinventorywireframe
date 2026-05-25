import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';

export default function NotEnoughInventoryError() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Take Feed</h1>
        <UserIcon />
      </div>

      {/* Error Modal Overlay */}
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full border-2 border-gray-900">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-900">
              <XCircle size={32} className="text-gray-900" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-3 text-center">Not Enough Inventory</h2>

          <p className="text-gray-700 text-center mb-6">
            Only 4 available. Adjust quantity or ask a Manager to override.
          </p>

          <div className="space-y-2">
            <button
              onClick={() => navigate(-1)}
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold active:bg-gray-800"
            >
              Adjust Quantity
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full bg-white border border-gray-300 text-gray-900 py-3 rounded-lg font-semibold active:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

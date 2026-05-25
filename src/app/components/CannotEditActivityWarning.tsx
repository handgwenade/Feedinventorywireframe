import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';

export default function CannotEditActivityWarning() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Activity History</h1>
        <UserIcon />
      </div>

      {/* Warning Modal Overlay */}
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full border-2 border-gray-900">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-900">
              <AlertTriangle size={32} className="text-gray-900" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-3 text-center">Cannot Edit Activity</h2>

          <p className="text-gray-700 text-center mb-6">
            Activity history cannot be edited directly. Create a correction instead.
          </p>

          <div className="space-y-2">
            <button
              onClick={() => navigate('/adjust-count')}
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold active:bg-gray-800"
            >
              Create Correction
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

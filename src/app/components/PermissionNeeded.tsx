import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';

export default function PermissionNeeded() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-gray-900">Permission Needed</h1>
        </div>
        <UserIcon />
      </div>

      {/* Permission State */}
      <div className="flex flex-col items-center justify-center p-8 mt-16">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 border-2 border-gray-300">
          <Lock size={48} className="text-gray-600" />
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">Permission Needed</h2>

        <p className="text-gray-700 text-center mb-6 max-w-sm">
          Your role does not allow this action.
        </p>

        <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-8 max-w-sm">
          <div className="text-sm font-medium text-gray-900 mb-2">Example:</div>
          <div className="text-sm text-gray-600">
            Operators cannot see cost per unit or manage users.
          </div>
        </div>

        <div className="w-full max-w-sm">
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-gray-900 text-white py-4 rounded-lg font-semibold active:bg-gray-800"
          >
            Back
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

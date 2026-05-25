import { useNavigate } from 'react-router-dom';
import { Users, Plus } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';

export default function EmptyAccounts() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Accounts</h1>
        <UserIcon />
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center p-8 mt-16">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 border-2 border-gray-300">
          <Users size={48} className="text-gray-400" />
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">No accounts or people yet.</h2>

        <p className="text-gray-600 text-center mb-8 max-w-sm">
          Add customers or family/person records to track who takes feed.
        </p>

        <div className="w-full max-w-sm">
          <button
            onClick={() => navigate('/add-account-person')}
            className="w-full bg-gray-900 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 active:bg-gray-800"
          >
            <Plus size={20} />
            Add Account / Person
          </button>
        </div>

        {/* Annotation */}
        <div className="mt-8 p-3 bg-gray-50 border border-gray-300 rounded text-xs text-gray-600 leading-relaxed max-w-sm">
          <strong>Permission-based:</strong> Add Account / Person may be visible only to Admin/Manager depending on permissions.
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

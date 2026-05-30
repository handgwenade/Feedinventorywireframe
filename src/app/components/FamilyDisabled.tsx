import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BottomNav from './shared/BottomNav';

export default function FamilyDisabled() {
  const navigate = useNavigate();

  useEffect(() => {
    // no-op; component exists for safe routing only
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-600 active:text-gray-900">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Family Workflow Removed</h1>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
          The "Family" take-feed workflow has been removed from the active app. If a family member
          helped with K2, record their feed under the K2 workflow instead.
        </div>

        <div className="space-y-2">
          <button
            onClick={() => navigate('/k2-add-products')}
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold active:bg-gray-800"
          >
            Go to K2 Take Feed
          </button>

          <button
            onClick={() => navigate('/choose-customer')}
            className="w-full bg-white border border-gray-300 text-gray-900 py-3 rounded-lg font-semibold active:bg-gray-50"
          >
            Record a Customer Sale
          </button>

          <button
            onClick={() => navigate('/accounts')}
            className="w-full text-gray-600 py-3 text-center active:text-gray-900"
          >
            Manage People / Contacts
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

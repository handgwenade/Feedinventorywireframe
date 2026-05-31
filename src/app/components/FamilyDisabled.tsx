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
    <div className="min-h-screen bg-[#f7f4ed] pb-24">
      <div className="bg-white border-b border-[#e8dfd1] p-4 flex items-center gap-3 shadow-[0_1px_4px_rgba(61,47,31,0.06)]">
        <button onClick={() => navigate(-1)} className="text-[#8b7a6f] active:text-[#3d2f1f]">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-[#3d2f1f]">Family Workflow Removed</h1>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 text-sm text-[#8b7a6f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          The "Family" take-feed workflow has been removed from the active app. If a family member
          helped with K2, record their feed under the K2 workflow instead.
        </div>

        <div className="space-y-2">
          <button
            onClick={() => navigate('/k2-add-products')}
            className="w-full bg-[#5a7a4d] text-white py-3 rounded-2xl font-semibold active:bg-[#4a6a3d] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
          >
            Go to K2 Take Feed
          </button>

          <button
            onClick={() => navigate('/choose-customer')}
            className="w-full bg-white border border-[#ded2c0] text-[#3d2f1f] py-3 rounded-2xl font-semibold active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
          >
            Record a Customer Sale
          </button>

          <button
            onClick={() => navigate('/accounts')}
            className="w-full text-[#8b7a6f] py-3 text-center font-semibold active:text-[#3d2f1f]"
          >
            Manage People / Contacts
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

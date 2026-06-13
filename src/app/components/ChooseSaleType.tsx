import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, FileText, ArrowRight } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';

export default function ChooseSaleType() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f7f4ed] pb-24">
      {/* Header */}
      <div className="app-header-safe">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="app-header-action rounded-2xl text-[#8b7a6f] active:bg-[#faf8f5] active:text-[#3d2f1f]"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-[#3d2f1f]">Who is this for?</h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        {/* Customer */}
        <SaleTypeCard
          icon={<ShoppingCart size={32} />}
          title="Customer"
          helperText="Sell feed or products to an outside customer."
          badge="Customer"
          nextStep="Choose Customer"
          onClick={() => navigate('/choose-customer')}
        />

        {/* K2 */}
        <SaleTypeCard
          icon={<FileText size={32} />}
          title="K2"
          helperText="Record feed or products used by K2. Helpers working on K2 should use K2. The logged-in user is recorded automatically."
          badge="K2"
          nextStep="Add Products"
          note="K2 is preselected, so this skips customer selection."
          onClick={() => navigate('/k2-add-products')}
        />

      </div>

      {/* Workflow Annotation */}
      <div className="p-4">
        <div className="p-3 bg-white border border-[#ded2c0] rounded-2xl text-xs text-[#8b7a6f] leading-relaxed shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <strong>Workflow Branches:</strong><br />
          All sale/use activity starts from Take Feed. The user first chooses whether the feed is for a Customer or K2.<br /><br />
          • Customer → Choose Customer → Add Products → Review Invoice → Invoice Created<br />
          • K2 → Add Products → Review K2 Statement → K2 Statement Created
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function SaleTypeCard({
  icon,
  title,
  helperText,
  badge,
  nextStep,
  note,
  onClick
}: {
  icon: React.ReactNode;
  title: string;
  helperText: string;
  badge: string;
  nextStep: string;
  note?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white border border-[#ded2c0] rounded-2xl p-5 active:bg-[#faf8f5] active:border-[#5a7a4d] text-left shadow-[0_2px_8px_rgba(61,47,31,0.08)] transition-colors"
    >
      <div className="flex items-start gap-4 mb-3">
        <div className="text-[#5a7a4d] flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[#3d2f1f] mb-2">{title}</h3>
          <p className="text-sm text-[#8b7a6f] mb-3">{helperText}</p>
          <div className="mb-3">
            <span className="inline-block px-3 py-1 bg-[#e9f0e5] text-[#5a7a4d] text-xs font-semibold rounded-full border border-[#cbd8c4]">
              {badge}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#8b7a6f]">
            <span>Next step:</span>
            <span className="font-semibold text-[#3d2f1f]">{nextStep}</span>
            <ArrowRight size={16} className="text-[#8b7a6f]" />
          </div>
          {note && (
            <p className="text-xs text-[#8b7a6f] mt-2 italic">{note}</p>
          )}
        </div>
      </div>
    </button>
  );
}

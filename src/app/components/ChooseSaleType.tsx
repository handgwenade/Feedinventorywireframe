import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, FileText, ArrowRight } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';

export default function ChooseSaleType() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 active:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Who is this for?</h1>
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
        <div className="p-3 bg-gray-50 border border-gray-300 rounded text-xs text-gray-600 leading-relaxed">
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
      className="w-full bg-white border-2 border-gray-200 rounded-lg p-5 active:bg-gray-50 active:border-gray-900 text-left"
    >
      <div className="flex items-start gap-4 mb-3">
        <div className="text-gray-700 flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-3">{helperText}</p>
          <div className="mb-3">
            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded border border-gray-300">
              {badge}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Next step:</span>
            <span className="font-medium text-gray-900">{nextStep}</span>
            <ArrowRight size={16} className="text-gray-400" />
          </div>
          {note && (
            <p className="text-xs text-gray-500 mt-2 italic">{note}</p>
          )}
        </div>
      </div>
    </button>
  );
}

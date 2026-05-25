import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Download, Printer, Send, DollarSign, Home, Users } from 'lucide-react';
import BottomNav from './shared/BottomNav';

export default function FamilyInvoiceCreated() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    personName = 'Bill Johnson',
    total = 0,
    status = 'unpaid'
  } = location.state || {};

  const invoiceNumber = 'FAM-1003';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Success Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 border-2 border-gray-900">
            <CheckCircle2 size={32} className="text-gray-900" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Family Use Recorded!</h1>
          <p className="text-gray-600">Family use successfully recorded</p>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {/* Invoice Details */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <div>
            <div className="text-sm text-gray-600 mb-1">Invoice Number</div>
            <div className="text-xl font-bold text-gray-900">{invoiceNumber}</div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">Taken by</div>
            <div className="font-semibold text-gray-900">{personName}</div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-2">Badge</div>
            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded border border-gray-300">
              Family
            </span>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">Total</div>
            <div className="text-2xl font-bold text-gray-900">
              ${total.toFixed(2)}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">Status</div>
            <div className="font-semibold text-gray-900 capitalize">
              {status === 'written-off' ? 'Written Off' : status}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <ActionButton
            icon={<Download size={20} />}
            label="Download PDF"
            onClick={() => {}}
          />
          <ActionButton
            icon={<Printer size={20} />}
            label="Print"
            onClick={() => {}}
          />
          <ActionButton
            icon={<Send size={20} />}
            label="Send"
            onClick={() => {}}
          />
          <ActionButton
            icon={<DollarSign size={20} />}
            label="Record Payment"
            onClick={() => {}}
          />
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 space-y-2">
        <button
          onClick={() => navigate('/choose-family-account')}
          className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 active:bg-gray-800"
        >
          <Users size={20} />
          New Family Use
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full bg-white border border-gray-300 text-gray-900 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 active:bg-gray-50"
        >
          <Home size={20} />
          Back to Dashboard
        </button>
      </div>

      <BottomNav />
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full p-3 rounded-lg flex items-center gap-3 font-medium bg-white border border-gray-300 text-gray-900 active:bg-gray-50"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

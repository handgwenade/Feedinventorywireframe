import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Download, Printer, Send, DollarSign, Home, ShoppingCart } from 'lucide-react';
import BottomNav from './shared/BottomNav';

export default function InvoiceCreated() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    customerName = 'Anderson Cattle Co.',
    total = 9.79,
    balanceDue = 9.79
  } = location.state || {};

  const invoiceNumber = 'INV-1001';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Success Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 border-2 border-gray-900">
            <CheckCircle2 size={32} className="text-gray-900" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invoice Created!</h1>
          <p className="text-gray-600">Sale successfully recorded</p>
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
            <div className="text-sm text-gray-600 mb-1">Customer</div>
            <div className="font-semibold text-gray-900">{customerName}</div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">Total</div>
            <div className="text-2xl font-bold text-gray-900">
              ${total.toFixed(2)}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">Balance Due</div>
            <div className="text-xl font-semibold text-gray-900">
              ${balanceDue.toFixed(2)}
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
          onClick={() => navigate('/choose-customer')}
          className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 active:bg-gray-800"
        >
          <ShoppingCart size={20} />
          New Sale
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

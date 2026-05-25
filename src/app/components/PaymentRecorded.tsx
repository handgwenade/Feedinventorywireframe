import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, FileText, DollarSign, List, Home } from 'lucide-react';
import BottomNav from './shared/BottomNav';

export default function PaymentRecorded() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    invoice = { number: 'INV-1001', account: 'Anderson Cattle Co.', balance: 171.50, total: 171.50 },
    amountPaid = 171.50,
    paymentMethod = 'check',
    checkNumber = '1042',
  } = location.state || {};

  const newBalance = invoice.balance - amountPaid;
  const status = newBalance === 0 ? 'Paid' : 'Partial';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Success Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 border-2 border-gray-900">
            <CheckCircle2 size={32} className="text-gray-900" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Recorded!</h1>
          <p className="text-gray-600">Payment successfully recorded.</p>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {/* Payment Details */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <div>
            <div className="text-sm text-gray-600 mb-1">Invoice</div>
            <div className="font-semibold text-gray-900">{invoice.number}</div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">Customer</div>
            <div className="font-semibold text-gray-900">{invoice.account}</div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">Payment amount</div>
            <div className="text-2xl font-bold text-gray-900">${amountPaid.toFixed(2)}</div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">Payment method</div>
            <div className="font-semibold text-gray-900 capitalize">{paymentMethod}</div>
          </div>

          {paymentMethod === 'check' && checkNumber && (
            <div className="border-t border-gray-200 pt-3">
              <div className="text-sm text-gray-600 mb-1">Check number</div>
              <div className="font-semibold text-gray-900">{checkNumber}</div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">New balance due</div>
            <div className="text-xl font-bold text-gray-900">${newBalance.toFixed(2)}</div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">Status</div>
            <div className="font-semibold text-gray-900">{status}</div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 space-y-2">
        <button
          onClick={() => navigate('/invoice-detail', { state: { invoice: { ...invoice, balance: newBalance } } })}
          className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 active:bg-gray-800"
        >
          <FileText size={20} />
          View Invoice
        </button>
        <button
          onClick={() => navigate('/invoices')}
          className="w-full bg-white border border-gray-300 text-gray-900 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 active:bg-gray-50"
        >
          <DollarSign size={20} />
          Record Another Payment
        </button>
        <button
          onClick={() => navigate('/invoices')}
          className="w-full bg-white border border-gray-300 text-gray-900 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 active:bg-gray-50"
        >
          <List size={20} />
          Back to Invoices
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

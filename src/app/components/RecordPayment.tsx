import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface Invoice {
  number: string;
  account: string;
  balance: number;
  total: number;
}

type PaymentMethod = 'cash' | 'check' | 'other';

export default function RecordPayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { invoice } = location.state || {
    invoice: {
      number: 'INV-1001',
      account: 'Anderson Cattle Co.',
      balance: 171.50,
      total: 171.50,
    }
  };

  const [amountPaid, setAmountPaid] = useState(invoice.balance.toString());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [checkNumber, setCheckNumber] = useState('');
  const [paymentNote, setPaymentNote] = useState('');

  const handleSavePayment = () => {
    navigate('/payment-recorded', {
      state: {
        invoice,
        amountPaid: parseFloat(amountPaid),
        paymentMethod,
        checkNumber,
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/invoice-detail', { state: { invoice } })}
          className="text-gray-600 active:text-gray-900"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Record Payment</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Invoice Info */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
          <div>
            <div className="text-sm text-gray-600 mb-1">Invoice</div>
            <div className="font-semibold text-gray-900">{invoice.number}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Customer</div>
            <div className="font-semibold text-gray-900">{invoice.account}</div>
          </div>
          <div className="pt-2 border-t border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Balance due</div>
            <div className="text-2xl font-bold text-gray-900">${invoice.balance.toFixed(2)}</div>
          </div>
        </div>

        {/* Amount Paid */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount paid
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-xl">$</span>
            <input
              type="number"
              step="0.01"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg text-xl font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Payment method
          </label>
          <div className="space-y-2">
            <PaymentMethodOption
              value="cash"
              label="Cash"
              selected={paymentMethod === 'cash'}
              onSelect={() => setPaymentMethod('cash')}
            />
            <PaymentMethodOption
              value="check"
              label="Check"
              selected={paymentMethod === 'check'}
              onSelect={() => setPaymentMethod('check')}
            />
            <PaymentMethodOption
              value="other"
              label="Other"
              selected={paymentMethod === 'other'}
              onSelect={() => setPaymentMethod('other')}
            />
          </div>
        </div>

        {/* Check Number (conditional) */}
        {paymentMethod === 'check' && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check number
            </label>
            <input
              type="text"
              value={checkNumber}
              onChange={(e) => setCheckNumber(e.target.value)}
              placeholder="Enter check number..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        )}

        {/* Payment Note */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment note
          </label>
          <textarea
            value={paymentNote}
            onChange={(e) => setPaymentNote(e.target.value)}
            placeholder="Add payment note..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900"
          />
        </div>

        {/* Received By */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Received by</div>
          <div className="font-medium text-gray-900">Operator</div>
        </div>
      </div>

      {/* Fixed Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 max-w-md mx-auto space-y-2">
        <button
          onClick={handleSavePayment}
          className="w-full bg-gray-900 text-white py-4 rounded-lg font-semibold active:bg-gray-800"
        >
          Save Payment
        </button>
        <button
          onClick={() => navigate('/invoice-detail', { state: { invoice } })}
          className="w-full bg-white border border-gray-300 text-gray-900 py-3 rounded-lg font-semibold active:bg-gray-50"
        >
          Cancel
        </button>

        {/* Workflow Annotations */}
        <div className="mt-3 p-3 bg-gray-50 border border-gray-300 rounded text-xs text-gray-600 leading-relaxed">
          <strong>Payment Workflow:</strong><br />
          Recording a payment updates invoice status and balance due. It does not change inventory.<br /><br />
          <strong>Role-based access:</strong><br />
          Admin, Manager, and optionally Operator can record payments. View Only cannot record payments. Admin/Manager can void invoices.
        </div>
      </div>
    </div>
  );
}

function PaymentMethodOption({
  value,
  label,
  selected,
  onSelect
}: {
  value: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full p-3 border rounded-lg flex items-center gap-3 active:bg-gray-50 ${
        selected ? 'border-gray-900 bg-gray-50' : 'border-gray-300 bg-white'
      }`}
    >
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
        selected ? 'border-gray-900' : 'border-gray-300'
      }`}>
        {selected && <div className="w-3 h-3 rounded-full bg-gray-900" />}
      </div>
      <span className="font-medium text-gray-900">{label}</span>
    </button>
  );
}

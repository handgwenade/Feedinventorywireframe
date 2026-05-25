import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

type PaymentMethod = 'cash' | 'check' | 'other';

export default function PaymentDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { customerName = 'Anderson Cattle Co.', cart, total = 9.79, paymentStatus } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountPaid, setAmountPaid] = useState(paymentStatus === 'paid' ? total.toString() : '');
  const [checkNumber, setCheckNumber] = useState('');
  const [paymentNote, setPaymentNote] = useState('');

  const handleSavePayment = () => {
    const balanceDue = total - parseFloat(amountPaid || '0');
    navigate('/invoice-created', {
      state: {
        customerName,
        cart,
        total,
        balanceDue,
        paymentMethod,
        amountPaid: parseFloat(amountPaid || '0'),
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/review-invoice')}
          className="text-gray-600 active:text-gray-900"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Payment Details</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Total Amount */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Invoice Total</div>
          <div className="text-3xl font-bold text-gray-900">
            ${total.toFixed(2)}
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Payment Method
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

        {/* Amount Paid */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount Paid
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-xl">
              $
            </span>
            <input
              type="number"
              step="0.01"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg text-xl font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {amountPaid && parseFloat(amountPaid) < total && (
            <div className="mt-2 text-sm text-gray-600">
              Balance Due: ${(total - parseFloat(amountPaid)).toFixed(2)}
            </div>
          )}
        </div>

        {/* Check Number (conditional) */}
        {paymentMethod === 'check' && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check Number
            </label>
            <input
              type="text"
              value={checkNumber}
              onChange={(e) => setCheckNumber(e.target.value)}
              placeholder="Enter check number..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Payment Note */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Note (optional)
          </label>
          <textarea
            value={paymentNote}
            onChange={(e) => setPaymentNote(e.target.value)}
            placeholder="Add any notes about this payment..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 max-w-md mx-auto">
        <button
          onClick={handleSavePayment}
          className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold active:bg-gray-800"
        >
          Save Payment
        </button>
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
        selected
          ? 'border-gray-900 bg-gray-50'
          : 'border-gray-300 bg-white'
      }`}
    >
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
        selected ? 'border-gray-900' : 'border-gray-300'
      }`}>
        {selected && (
          <div className="w-3 h-3 rounded-full bg-gray-900" />
        )}
      </div>
      <span className="font-medium text-gray-900">
        {label}
      </span>
    </button>
  );
}

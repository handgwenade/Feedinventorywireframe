import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import { calculateBalanceDue, formatCurrency } from '../utils/calculations';
import type { PaymentMethod } from '../types';

export default function PaymentDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    customerName = 'Anderson Cattle Co.',
    customerId,
    accountId,
    cart = [],
    subtotal,
    tax,
    total = 9.79,
    paymentStatus,
    notes
  } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountPaid, setAmountPaid] = useState(paymentStatus === 'paid' ? total.toString() : '');
  const [checkNumber, setCheckNumber] = useState('');
  const [paymentNote, setPaymentNote] = useState('');

  const handleSavePayment = () => {
    const paidAmount = parseFloat(amountPaid || '0');
    const balanceDue = calculateBalanceDue(total, paidAmount);
    navigate('/invoice-created', {
      state: {
        customerName,
        customerId,
        accountId,
        cart,
        subtotal,
        tax,
        total,
        balanceDue,
        paymentMethod,
        amountPaid: paidAmount,
        checkNumber,
        paymentNote,
        notes,
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#f7f4ed] pb-24">
      {/* Header */}
      <div className="app-header-safe app-header-safe-start">
        <button
          onClick={() => navigate('/review-invoice', {
            state: { customerName, customerId, accountId, cart, subtotal, tax, total, paymentStatus, notes }
          })}
          className="app-header-action rounded-2xl text-[#8b7a6f] active:bg-[#faf8f5] active:text-[#3d2f1f]"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-[#3d2f1f]">Payment Details</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Total Amount */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div className="text-sm text-[#8b7a6f] mb-1">Invoice Total</div>
          <div className="text-3xl font-bold text-[#3d2f1f]">
            {formatCurrency(total)}
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <label className="block text-sm font-medium text-[#8b7a6f] mb-3">
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
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <label className="block text-sm font-medium text-[#8b7a6f] mb-2">
            Amount Paid
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b7a6f] text-xl">
              $
            </span>
            <input
              type="number"
              step="0.01"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-3 bg-white border border-[#ded2c0] rounded-2xl text-xl font-bold text-[#3d2f1f] placeholder:text-[#8b7a6f] focus:outline-none focus:ring-2 focus:ring-[#5a7a4d]"
            />
          </div>
          {amountPaid && parseFloat(amountPaid) < total && (
            <div className="mt-2 text-sm text-[#8b7a6f]">
              Balance Due: {formatCurrency(calculateBalanceDue(total, parseFloat(amountPaid)))}
            </div>
          )}
        </div>

        {/* Check Number (conditional) */}
        {paymentMethod === 'check' && (
          <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <label className="block text-sm font-medium text-[#8b7a6f] mb-2">
              Check Number
            </label>
            <input
              type="text"
              value={checkNumber}
              onChange={(e) => setCheckNumber(e.target.value)}
              placeholder="Enter check number..."
              className="w-full px-4 py-3 bg-white border border-[#ded2c0] rounded-2xl text-[#3d2f1f] placeholder:text-[#8b7a6f] focus:outline-none focus:ring-2 focus:ring-[#5a7a4d]"
            />
          </div>
        )}

        {/* Payment Note */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <label className="block text-sm font-medium text-[#8b7a6f] mb-2">
            Payment Note (optional)
          </label>
          <textarea
            value={paymentNote}
            onChange={(e) => setPaymentNote(e.target.value)}
            placeholder="Add any notes about this payment..."
            rows={3}
            className="w-full bg-white border border-[#ded2c0] rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-[#5a7a4d] text-[#3d2f1f] placeholder:text-[#8b7a6f]"
          />
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e8dfd1] p-4 max-w-md mx-auto shadow-[0_-4px_18px_rgba(61,47,31,0.14)]">
        <button
          onClick={handleSavePayment}
          className="w-full bg-[#5a7a4d] text-white py-3 rounded-2xl font-semibold active:bg-[#4a6a3d] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
        >
          Save Payment
        </button>
      </div>

      <BottomNav />
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
      className={`w-full p-3 border rounded-2xl flex items-center gap-3 active:bg-[#faf8f5] transition-colors ${
        selected
          ? 'border-[#5a7a4d] bg-[#e9f0e5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]'
          : 'border-[#ded2c0] bg-white'
      }`}
    >
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
        selected ? 'border-[#5a7a4d]' : 'border-[#ded2c0]'
      }`}>
        {selected && (
          <div className="w-3 h-3 rounded-full bg-[#5a7a4d]" />
        )}
      </div>
      <span className="font-semibold text-[#3d2f1f]">
        {label}
      </span>
    </button>
  );
}

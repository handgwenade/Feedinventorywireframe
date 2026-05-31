import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import { paymentsService } from '../services/paymentsService';
import { formatCurrency } from '../utils/calculations';
import type { InvoicePaymentMethod } from '../services/paymentsService';
import type { InvoiceDetailRecord, InvoiceListItem } from '../services/invoicesService';

type RoutedInvoice = Partial<InvoiceDetailRecord | InvoiceListItem> & {
  number?: string;
  account?: string;
  balance?: number;
};

function getRoutedInvoice(locationState: unknown): RoutedInvoice | null {
  return ((locationState as { invoice?: RoutedInvoice } | null)?.invoice ?? null);
}

export default function RecordPayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const invoice = getRoutedInvoice(location.state);
  const displayNumber = invoice?.displayNumber ?? invoice?.number ?? 'Invoice';
  const accountName = invoice?.accountName ?? invoice?.account ?? 'Unknown Account';
  const balanceDue = Number(invoice?.balanceDue ?? invoice?.balance ?? 0);
  const [amountPaid, setAmountPaid] = useState(balanceDue > 0 ? balanceDue.toString() : '');
  const [paymentMethod, setPaymentMethod] = useState<InvoicePaymentMethod>('cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSavePayment() {
    if (!invoice?.id || isSaving) return;

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const result = await paymentsService.recordInvoicePayment({
        invoiceRecordId: invoice.id,
        amount: Number(amountPaid),
        method: paymentMethod,
        referenceNumber,
        notes: paymentNote,
      });

      const updatedInvoice = {
        ...invoice,
        displayNumber: result.displayNumber,
        number: result.displayNumber,
        account: accountName,
        accountName,
        balance: result.newBalanceDue,
        balanceDue: result.newBalanceDue,
        amountPaid: Math.max(Number(invoice.total ?? 0) - result.newBalanceDue, 0),
        status: result.status,
      };

      navigate('/payment-recorded', {
        state: {
          payment: result,
          invoice: updatedInvoice,
          amountPaid: result.amount,
          paymentMethod: result.method,
          checkNumber: paymentMethod === 'check' ? referenceNumber : '',
        },
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to record payment.');
    } finally {
      setIsSaving(false);
    }
  }

  if (!invoice?.id) {
    return (
      <div className="min-h-screen bg-[#f7f4ed] pb-24">
        <div className="bg-white border-b border-[#e8dfd1] p-4 flex items-center gap-3 shadow-[0_1px_4px_rgba(61,47,31,0.06)]">
          <button
            onClick={() => navigate('/invoices')}
            className="text-[#8b7a6f] active:text-[#3d2f1f]"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-[#3d2f1f]">Record Payment</h1>
        </div>

        <div className="p-4">
          <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 space-y-3 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <div className="text-sm text-[#8b7a6f]">Select an invoice before recording a payment.</div>
            <button
              onClick={() => navigate('/invoices')}
              className="w-full bg-white border border-[#ded2c0] text-[#3d2f1f] py-3 rounded-2xl font-semibold active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
            >
              Back to Invoices
            </button>
          </div>
        </div>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4ed] pb-32">
      {/* Header */}
      <div className="bg-white border-b border-[#e8dfd1] p-4 flex items-center gap-3 shadow-[0_1px_4px_rgba(61,47,31,0.06)]">
        <button
          onClick={() => navigate('/invoice-detail', { state: { invoice } })}
          className="text-[#8b7a6f] active:text-[#3d2f1f]"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-[#3d2f1f]">Record Payment</h1>
      </div>

      <div className="p-4 space-y-4">
        {errorMessage && (
          <div className="bg-white border border-[#b7791f] rounded-2xl p-4 text-sm text-[#3d2f1f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            {errorMessage}
          </div>
        )}

        {/* Invoice Info */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 space-y-2 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div>
            <div className="text-sm text-[#8b7a6f] mb-1">Invoice</div>
            <div className="font-semibold text-[#3d2f1f]">{displayNumber}</div>
          </div>
          <div>
            <div className="text-sm text-[#8b7a6f] mb-1">Customer</div>
            <div className="font-semibold text-[#3d2f1f]">{accountName}</div>
          </div>
          <div className="pt-2 border-t border-[#e8dfd1]">
            <div className="text-sm text-[#8b7a6f] mb-1">Balance due</div>
            <div className="text-2xl font-bold text-[#3d2f1f]">{formatCurrency(balanceDue)}</div>
          </div>
        </div>

        {/* Amount Paid */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <label className="block text-sm font-medium text-[#8b7a6f] mb-2">
            Amount paid
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b7a6f] text-xl">$</span>
            <input
              type="number"
              step="0.01"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-3 bg-white border border-[#ded2c0] rounded-2xl text-xl font-bold text-[#3d2f1f] placeholder:text-[#8b7a6f] focus:outline-none focus:ring-2 focus:ring-[#5a7a4d]"
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <label className="block text-sm font-medium text-[#8b7a6f] mb-3">
            Payment method
          </label>
          <div className="space-y-2">
            <PaymentMethodOption
              label="Cash"
              selected={paymentMethod === 'cash'}
              onSelect={() => setPaymentMethod('cash')}
            />
            <PaymentMethodOption
              label="Check"
              selected={paymentMethod === 'check'}
              onSelect={() => setPaymentMethod('check')}
            />
            <PaymentMethodOption
              label="Other"
              selected={paymentMethod === 'other'}
              onSelect={() => setPaymentMethod('other')}
            />
          </div>
        </div>

        {/* Check Number (conditional) */}
        {paymentMethod === 'check' && (
          <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <label className="block text-sm font-medium text-[#8b7a6f] mb-2">
              Check number
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="Enter check number..."
              className="w-full px-4 py-3 bg-white border border-[#ded2c0] rounded-2xl text-[#3d2f1f] placeholder:text-[#8b7a6f] focus:outline-none focus:ring-2 focus:ring-[#5a7a4d]"
            />
          </div>
        )}

        {/* Payment Note */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <label className="block text-sm font-medium text-[#8b7a6f] mb-2">
            Payment note
          </label>
          <textarea
            value={paymentNote}
            onChange={(e) => setPaymentNote(e.target.value)}
            placeholder="Add payment note..."
            rows={3}
            className="w-full bg-white border border-[#ded2c0] rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-[#5a7a4d] text-[#3d2f1f] placeholder:text-[#8b7a6f]"
          />
        </div>

        {/* Received By */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div className="text-sm text-[#8b7a6f] mb-1">Received by</div>
          <div className="font-medium text-[#3d2f1f]">Current user</div>
        </div>
      </div>

      {/* Fixed Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e8dfd1] p-4 max-w-md mx-auto space-y-2 shadow-[0_-4px_18px_rgba(61,47,31,0.14)]">
        <button
          onClick={handleSavePayment}
          disabled={isSaving}
          className="w-full bg-[#5a7a4d] text-white py-4 rounded-2xl font-semibold active:bg-[#4a6a3d] disabled:bg-[#c7bdb0] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
        >
          {isSaving ? 'Saving Payment...' : 'Save Payment'}
        </button>
        <button
          onClick={() => navigate('/invoice-detail', { state: { invoice } })}
          disabled={isSaving}
          className="w-full bg-white border border-[#ded2c0] text-[#3d2f1f] py-3 rounded-2xl font-semibold active:bg-[#faf8f5] disabled:text-[#c7bdb0] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
        >
          Cancel
        </button>

        {/* Workflow Annotations */}
        <div className="mt-3 p-3 bg-[#f7f4ed] border border-[#ded2c0] rounded-2xl text-xs text-[#8b7a6f] leading-relaxed">
          <strong>Payment Workflow:</strong><br />
          Recording a payment updates invoice status and balance due. It does not change inventory.<br /><br />
          <strong>Role-based access:</strong><br />
          Admin, Manager, and optionally Operator can record payments. View Only cannot record payments. Admin/Manager can void invoices.
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function PaymentMethodOption({
  label,
  selected,
  onSelect
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full p-3 border rounded-2xl flex items-center gap-3 active:bg-[#faf8f5] transition-colors ${
        selected ? 'border-[#5a7a4d] bg-[#e9f0e5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]' : 'border-[#ded2c0] bg-white'
      }`}
    >
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
        selected ? 'border-[#5a7a4d]' : 'border-[#ded2c0]'
      }`}>
        {selected && <div className="w-3 h-3 rounded-full bg-[#5a7a4d]" />}
      </div>
      <span className="font-semibold text-[#3d2f1f]">{label}</span>
    </button>
  );
}

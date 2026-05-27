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
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/invoices')}
            className="text-gray-600 active:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Record Payment</h1>
        </div>

        <div className="p-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="text-sm text-gray-700">Select an invoice before recording a payment.</div>
            <button
              onClick={() => navigate('/invoices')}
              className="w-full bg-white border border-gray-300 text-gray-900 py-3 rounded-lg font-semibold active:bg-gray-50"
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
        {errorMessage && (
          <div className="bg-white border border-gray-300 rounded-lg p-4 text-sm text-gray-900">
            {errorMessage}
          </div>
        )}

        {/* Invoice Info */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
          <div>
            <div className="text-sm text-gray-600 mb-1">Invoice</div>
            <div className="font-semibold text-gray-900">{displayNumber}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Customer</div>
            <div className="font-semibold text-gray-900">{accountName}</div>
          </div>
          <div className="pt-2 border-t border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Balance due</div>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(balanceDue)}</div>
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
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check number
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
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
          <div className="font-medium text-gray-900">Current user</div>
        </div>
      </div>

      {/* Fixed Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 max-w-md mx-auto space-y-2">
        <button
          onClick={handleSavePayment}
          disabled={isSaving}
          className="w-full bg-gray-900 text-white py-4 rounded-lg font-semibold active:bg-gray-800 disabled:bg-gray-500"
        >
          {isSaving ? 'Saving Payment...' : 'Save Payment'}
        </button>
        <button
          onClick={() => navigate('/invoice-detail', { state: { invoice } })}
          disabled={isSaving}
          className="w-full bg-white border border-gray-300 text-gray-900 py-3 rounded-lg font-semibold active:bg-gray-50 disabled:text-gray-400"
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

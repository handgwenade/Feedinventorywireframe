import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, FileText, DollarSign, List, Home } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import { formatCurrency } from '../utils/calculations';
import type { RecordInvoicePaymentResult } from '../services/paymentsService';
import type { InvoiceDetailRecord, InvoiceListItem } from '../services/invoicesService';

type RoutedInvoice = Partial<InvoiceDetailRecord | InvoiceListItem> & {
  number?: string;
  account?: string;
  balance?: number;
};

export default function PaymentRecorded() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as {
    payment?: RecordInvoicePaymentResult;
    invoice?: RoutedInvoice;
    amountPaid?: number;
    paymentMethod?: string;
    checkNumber?: string;
  };

  const payment = state.payment;
  const invoice = state.invoice;

  if (!payment && !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">Payment Recorded</h1>
        </div>

        <div className="flex-1 p-4">
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

  const displayNumber = payment?.displayNumber ?? invoice?.displayNumber ?? invoice?.number ?? 'Invoice';
  const accountName = invoice?.accountName ?? invoice?.account ?? 'Unknown Account';
  const amountPaid = payment?.amount ?? state.amountPaid ?? 0;
  const paymentMethod = payment?.method ?? state.paymentMethod ?? 'cash';
  const checkNumber = state.checkNumber ?? '';
  const newBalance = payment?.newBalanceDue ?? invoice?.balanceDue ?? invoice?.balance ?? 0;
  const status = payment?.status ?? invoice?.status ?? (newBalance === 0 ? 'paid' : 'partial');
  const updatedInvoice = invoice
    ? {
        ...invoice,
        displayNumber,
        number: displayNumber,
        account: accountName,
        accountName,
        balance: newBalance,
        balanceDue: newBalance,
        status,
      }
    : null;

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
            <div className="font-semibold text-gray-900">{displayNumber}</div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">Customer</div>
            <div className="font-semibold text-gray-900">{accountName}</div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">Payment amount</div>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(amountPaid)}</div>
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
            <div className="text-xl font-bold text-gray-900">{formatCurrency(newBalance)}</div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">Status</div>
            <div className="font-semibold text-gray-900 capitalize">{status}</div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 space-y-2">
        <button
          onClick={() => navigate('/invoice-detail', { state: { invoice: updatedInvoice } })}
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

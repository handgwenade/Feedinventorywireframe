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
      <div className="min-h-screen bg-[#f7f4ed] flex flex-col">
        <div className="bg-white border-b border-[#e8dfd1] p-6 shadow-[0_1px_4px_rgba(61,47,31,0.06)]">
          <h1 className="text-2xl font-bold text-[#3d2f1f]">Payment Recorded</h1>
        </div>

        <div className="flex-1 p-4">
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
    <div className="min-h-screen bg-[#f7f4ed] flex flex-col">
      {/* Success Header */}
      <div className="bg-white border-b border-[#e8dfd1] p-6 shadow-[0_1px_4px_rgba(61,47,31,0.06)]">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-[#e9f0e5] rounded-full flex items-center justify-center mb-4 border-2 border-[#5a7a4d] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <CheckCircle2 size={32} className="text-[#5a7a4d]" />
          </div>
          <h1 className="text-2xl font-bold text-[#3d2f1f] mb-2">Payment Recorded!</h1>
          <p className="text-[#8b7a6f]">Payment successfully recorded.</p>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {/* Payment Details */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 space-y-3 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div>
            <div className="text-sm text-[#8b7a6f] mb-1">Invoice</div>
            <div className="font-semibold text-[#3d2f1f]">{displayNumber}</div>
          </div>

          <div className="border-t border-[#e8dfd1] pt-3">
            <div className="text-sm text-[#8b7a6f] mb-1">Customer</div>
            <div className="font-semibold text-[#3d2f1f]">{accountName}</div>
          </div>

          <div className="border-t border-[#e8dfd1] pt-3">
            <div className="text-sm text-[#8b7a6f] mb-1">Payment amount</div>
            <div className="text-2xl font-bold text-[#3d2f1f]">{formatCurrency(amountPaid)}</div>
          </div>

          <div className="border-t border-[#e8dfd1] pt-3">
            <div className="text-sm text-[#8b7a6f] mb-1">Payment method</div>
            <div className="font-semibold text-[#3d2f1f] capitalize">{paymentMethod}</div>
          </div>

          {paymentMethod === 'check' && checkNumber && (
            <div className="border-t border-[#e8dfd1] pt-3">
              <div className="text-sm text-[#8b7a6f] mb-1">Check number</div>
              <div className="font-semibold text-[#3d2f1f]">{checkNumber}</div>
            </div>
          )}

          <div className="border-t border-[#e8dfd1] pt-3">
            <div className="text-sm text-[#8b7a6f] mb-1">New balance due</div>
            <div className="text-xl font-bold text-[#3d2f1f]">{formatCurrency(newBalance)}</div>
          </div>

          <div className="border-t border-[#e8dfd1] pt-3">
            <div className="text-sm text-[#8b7a6f] mb-1">Status</div>
            <div className="font-semibold text-[#3d2f1f] capitalize">{status}</div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 space-y-2">
        <button
          onClick={() => navigate('/invoice-detail', { state: { invoice: updatedInvoice } })}
          className="w-full bg-[#5a7a4d] text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 active:bg-[#4a6a3d] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
        >
          <FileText size={20} />
          View Invoice
        </button>
        <button
          onClick={() => navigate('/invoices')}
          className="w-full bg-white border border-[#ded2c0] text-[#3d2f1f] py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
        >
          <DollarSign size={20} />
          Record Another Payment
        </button>
        <button
          onClick={() => navigate('/invoices')}
          className="w-full bg-white border border-[#ded2c0] text-[#3d2f1f] py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
        >
          <List size={20} />
          Back to Invoices
        </button>
        <button
          onClick={() => navigate('/')}
          className="w-full bg-white border border-[#ded2c0] text-[#3d2f1f] py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
        >
          <Home size={20} />
          Back to Dashboard
        </button>
      </div>

      <BottomNav />
    </div>
  );
}

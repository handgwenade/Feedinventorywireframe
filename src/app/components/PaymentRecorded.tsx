import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, FileText, DollarSign, List, Home } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import { accounts, invoiceRecords, payments, people } from '../data/mockData';
import { calculateBalanceDue, formatCurrency } from '../utils/calculations';
import type { InvoiceRecord, PaymentMethod } from '../types';

type RoutedInvoice = Partial<InvoiceRecord> & {
  number?: string;
  account?: string;
  type?: 'customer' | 'k2' | 'family';
  balance?: number;
};

function getAccountName(invoice: InvoiceRecord): string {
  if (invoice.accountId) {
    return accounts.find((account) => account.id === invoice.accountId)?.name ?? 'Unknown Account';
  }

  if (invoice.personId) {
    return people.find((person) => person.id === invoice.personId)?.officialDisplayName ?? 'Unknown Person';
  }

  return 'Unknown';
}

function getInvoiceType(invoice: InvoiceRecord): 'customer' | 'k2' | 'family' {
  if (invoice.recordType === 'k2_statement') return 'k2';
  if (invoice.recordType === 'family_use') return 'family';
  return 'customer';
}

export default function PaymentRecorded() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as {
    invoice?: RoutedInvoice;
    amountPaid?: number;
    paymentMethod?: PaymentMethod;
    checkNumber?: string;
  };
  const fallbackPayment = payments[0];
  const fallbackInvoice = invoiceRecords.find((record) => record.id === fallbackPayment?.invoiceRecordId) ?? invoiceRecords[0];
  const routedInvoice = state.invoice ?? fallbackInvoice;
  const invoiceRecord = routedInvoice.id
    ? invoiceRecords.find((record) => record.id === routedInvoice.id) ?? fallbackInvoice
    : fallbackInvoice;
  const invoice = {
    ...invoiceRecord,
    number: routedInvoice.number ?? routedInvoice.displayNumber ?? invoiceRecord.displayNumber,
    account: routedInvoice.account ?? getAccountName(invoiceRecord),
    type: routedInvoice.type ?? getInvoiceType(invoiceRecord),
    balance: routedInvoice.balance ?? routedInvoice.balanceDue ?? invoiceRecord.balanceDue,
    total: routedInvoice.total ?? invoiceRecord.total,
  };
  const amountPaid = state.amountPaid ?? fallbackPayment?.amount ?? invoice.amountPaid;
  const paymentMethod = state.paymentMethod ?? fallbackPayment?.paymentMethod ?? 'cash';
  const checkNumber = state.checkNumber ?? fallbackPayment?.checkNumber ?? '';

  const newBalance = calculateBalanceDue(invoice.balance, amountPaid);
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

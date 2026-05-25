import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Download, Printer, Send, DollarSign, XCircle, Trash2 } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';
import { accounts, invoiceLineItems, invoiceRecords, people, products } from '../data/mockData';
import { formatCurrency } from '../utils/calculations';
import type { InvoiceRecord } from '../types';

type InvoiceDetailState = Partial<InvoiceRecord> & {
  number?: string;
  account?: string;
  type?: 'customer' | 'k2' | 'family';
  balance?: number;
};

function getInvoiceType(invoice: InvoiceRecord): 'customer' | 'k2' | 'family' {
  if (invoice.recordType === 'k2_statement') return 'k2';
  if (invoice.recordType === 'family_use') return 'family';
  return 'customer';
}

function getAccountName(invoice: InvoiceRecord): string {
  if (invoice.accountId) {
    return accounts.find((account) => account.id === invoice.accountId)?.name ?? 'Unknown Account';
  }

  if (invoice.personId) {
    return people.find((person) => person.id === invoice.personId)?.officialDisplayName ?? 'Unknown Person';
  }

  return 'Unknown';
}

export default function InvoiceDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const fallbackInvoice = invoiceRecords.find((record) => record.balanceDue > 0) ?? invoiceRecords[0];
  const routedInvoice = ((location.state as { invoice?: InvoiceDetailState } | null)?.invoice ?? fallbackInvoice);
  const invoice = routedInvoice.id
    ? invoiceRecords.find((record) => record.id === routedInvoice.id) ?? fallbackInvoice
    : fallbackInvoice;
  const invoiceType = routedInvoice.type ?? getInvoiceType(invoice);
  const accountName = routedInvoice.account ?? getAccountName(invoice);
  const displayNumber = routedInvoice.number ?? routedInvoice.displayNumber ?? invoice.displayNumber;
  const balanceDue = routedInvoice.balance ?? routedInvoice.balanceDue ?? invoice.balanceDue;
  const lineItems = invoiceLineItems.filter((item) => item.invoiceRecordId === invoice.id);
  const paymentInvoice = {
    ...invoice,
    number: displayNumber,
    account: accountName,
    type: invoiceType,
    balance: balanceDue,
  };

  const invoiceDate = new Date(invoice.issueDate).toLocaleDateString();
  const dueDate = invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'Due on receipt';
  const amountPaid = invoice.amountPaid;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/invoices')}
            className="text-gray-600 active:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Invoice Detail</h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        {/* Invoice Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="text-sm text-gray-600 mb-1">Invoice Number</div>
              <div className="text-xl font-bold text-gray-900">{displayNumber}</div>
            </div>
            <div className="flex gap-1">
              <TypeBadge type={invoiceType} />
              <StatusBadge status={invoice.status} />
            </div>
          </div>
          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">Customer/Account</div>
            <div className="font-semibold text-gray-900">{accountName}</div>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-700">Invoice date</span>
            <span className="font-medium text-gray-900">{invoiceDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Due date</span>
            <span className="font-medium text-gray-900">{dueDate}</span>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">Line Items</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {lineItems.map((item) => {
              const product = products.find((candidate) => candidate.id === item.productId);

              return (
                <div key={item.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">{item.description}</div>
                      <div className="text-sm text-gray-600">
                        Quantity: {item.quantity} {product?.unitLabel ?? 'units'}
                      </div>
                      <div className="text-sm text-gray-600">
                        Unit price: {formatCurrency(item.unitPrice)}
                      </div>
                    </div>
                    <div className="font-semibold text-gray-900 text-lg">
                      {formatCurrency(item.lineTotal)}
                    </div>
                  </div>
                </div>
              );
            })}
            {lineItems.length === 0 && (
              <div className="p-4">
                <div className="text-sm text-gray-600">No line items recorded.</div>
              </div>
            )}
          </div>
        </div>

        {/* Totals */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-700">Subtotal</span>
            <span className="font-medium text-gray-900">{formatCurrency(invoice.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Tax</span>
            <span className="font-medium text-gray-900">
              {invoice.taxAmount > 0 ? formatCurrency(invoice.taxAmount) : 'Off'}
            </span>
          </div>
          <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
            <span className="font-semibold text-gray-900 text-lg">Total</span>
            <span className="font-bold text-gray-900 text-2xl">{formatCurrency(invoice.total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Amount paid</span>
            <span className="font-medium text-gray-900">{formatCurrency(amountPaid)}</span>
          </div>
        </div>

        {/* Balance Due - Prominent */}
        <div className="bg-gray-900 text-white rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-lg">Balance due</span>
            <span className="text-3xl font-bold">{formatCurrency(balanceDue)}</span>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Notes</div>
          <div className="text-gray-900">{invoice.notes ?? '—'}</div>
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
          {balanceDue > 0 && (
            <ActionButton
              icon={<DollarSign size={20} />}
              label="Record Payment"
              onClick={() => navigate('/record-payment', { state: { invoice: paymentInvoice } })}
              primary
            />
          )}
          <ActionButton
            icon={<XCircle size={20} />}
            label="Mark Written Off"
            onClick={() => {}}
          />
          <ActionButton
            icon={<Trash2 size={20} />}
            label="Void Invoice"
            onClick={() => {}}
          />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function TypeBadge({ type }: { type: 'customer' | 'k2' | 'family' }) {
  const labels = { customer: 'Customer', k2: 'K2', family: 'Family' };
  return (
    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded border border-gray-300">
      {labels[type]}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded border border-gray-300 capitalize">
      {status.replace('-', ' ')}
    </span>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  primary = false
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-3 rounded-lg flex items-center gap-3 font-medium ${
        primary
          ? 'bg-gray-900 text-white active:bg-gray-800'
          : 'bg-white border border-gray-300 text-gray-900 active:bg-gray-50'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

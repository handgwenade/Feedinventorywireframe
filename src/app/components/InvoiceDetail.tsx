import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Download, Printer, Send, DollarSign, XCircle, Trash2 } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';

interface Invoice {
  number: string;
  account: string;
  type: 'customer' | 'k2' | 'family';
  status: string;
  date: string;
  total: number;
  balance: number;
}

export default function InvoiceDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { invoice } = location.state || {
    invoice: {
      number: 'INV-1001',
      account: 'Anderson Cattle Co.',
      type: 'customer',
      status: 'unpaid',
      date: '2026-05-20',
      total: 171.50,
      balance: 171.50,
    }
  };

  const invoiceDate = '5/19/2026';
  const dueDate = 'Due on receipt';
  const amountPaid = invoice.total - invoice.balance;

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
              <div className="text-xl font-bold text-gray-900">{invoice.number}</div>
            </div>
            <div className="flex gap-1">
              <TypeBadge type={invoice.type} />
              <StatusBadge status={invoice.status} />
            </div>
          </div>
          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">Customer/Account</div>
            <div className="font-semibold text-gray-900">{invoice.account}</div>
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
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="font-medium text-gray-900 mb-1">Garlic Salt Blocks</div>
                <div className="text-sm text-gray-600">Quantity: 10</div>
                <div className="text-sm text-gray-600">Unit price: $17.15</div>
              </div>
              <div className="font-semibold text-gray-900 text-lg">
                $171.50
              </div>
            </div>
          </div>
        </div>

        {/* Totals */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-700">Subtotal</span>
            <span className="font-medium text-gray-900">$171.50</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Tax</span>
            <span className="font-medium text-gray-900">Off</span>
          </div>
          <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
            <span className="font-semibold text-gray-900 text-lg">Total</span>
            <span className="font-bold text-gray-900 text-2xl">${invoice.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Amount paid</span>
            <span className="font-medium text-gray-900">${amountPaid.toFixed(2)}</span>
          </div>
        </div>

        {/* Balance Due - Prominent */}
        <div className="bg-gray-900 text-white rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-lg">Balance due</span>
            <span className="text-3xl font-bold">${invoice.balance.toFixed(2)}</span>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Notes</div>
          <div className="text-gray-900">—</div>
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
          {invoice.balance > 0 && (
            <ActionButton
              icon={<DollarSign size={20} />}
              label="Record Payment"
              onClick={() => navigate('/record-payment', { state: { invoice } })}
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

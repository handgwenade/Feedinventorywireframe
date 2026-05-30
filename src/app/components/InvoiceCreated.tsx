import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Download, Printer, Send, DollarSign, Home, ShoppingCart, FileText } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import { calculateLineTotal, formatCurrency } from '../utils/calculations';

interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  unitLabel?: string;
}

interface InvoiceCreatedState {
  invoiceId?: string;
  displayNumber?: string;
  customerName?: string;
  customerId?: string;
  accountId?: string;
  cart?: CartItem[];
  subtotal?: number;
  tax?: number;
  total?: number;
  balanceDue?: number;
}

export default function InvoiceCreated() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? null) as InvoiceCreatedState | null;
  const hasCreatedInvoice = Boolean(state?.invoiceId && state?.displayNumber);

  if (!hasCreatedInvoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">Invoice Confirmation</h1>
        </div>

        <div className="flex-1 p-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="text-sm text-gray-700">Create an invoice before viewing this confirmation.</div>
            <button
              onClick={() => navigate('/choose-customer')}
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold active:bg-gray-800"
            >
              Back to Take Feed
            </button>
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

  const invoiceId = state?.invoiceId ?? '';
  const invoiceNumber = state?.displayNumber ?? '—';
  const customerName = state?.customerName ?? 'Unknown Customer';
  const total = Number(state?.total ?? 0);
  const balanceDue = Number(state?.balanceDue ?? total);
  const cart = state?.cart ?? [];
  const paymentInvoice = {
    id: invoiceId,
    displayNumber: invoiceNumber,
    number: invoiceNumber,
    recordType: 'customer_invoice',
    type: 'customer',
    accountId: state?.accountId ?? state?.customerId,
    accountName: customerName,
    account: customerName,
    total,
    balanceDue,
    balance: balanceDue,
    amountPaid: Math.max(total - balanceDue, 0),
    status: balanceDue > 0 ? 'unpaid' : 'paid',
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Success Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 border-2 border-gray-900">
            <CheckCircle2 size={32} className="text-gray-900" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invoice Created!</h1>
          <p className="text-gray-600">Sale successfully recorded</p>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {/* Invoice Details */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <div>
            <div className="text-sm text-gray-600 mb-1">Invoice Number</div>
            <div className="text-xl font-bold text-gray-900">{invoiceNumber}</div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">Customer</div>
            <div className="font-semibold text-gray-900">{customerName}</div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">Total</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(total)}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">Balance Due</div>
            <div className="text-xl font-semibold text-gray-900">
              {formatCurrency(balanceDue)}
            </div>
          </div>
        </div>

        {cart.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-semibold text-gray-900">Line Items</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {cart.map((item) => (
                <div key={item.productId} className="p-4 flex justify-between gap-3 text-sm">
                  <div>
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-gray-600">{item.quantity} {item.unitLabel ?? 'units'} @ {formatCurrency(item.price)}</div>
                  </div>
                  <div className="font-semibold text-gray-900">{formatCurrency(calculateLineTotal(item.quantity, item.price))}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <ActionButton icon={<Download size={20} />} label="Download PDF (Not Ready)" onClick={() => {}} disabled />
          <ActionButton icon={<Printer size={20} />} label="Print (Not Ready)" onClick={() => {}} disabled />
          <ActionButton icon={<Send size={20} />} label="Send (Not Ready)" onClick={() => {}} disabled />
          <ActionButton
            icon={<FileText size={20} />}
            label="View Invoice"
            onClick={() => navigate('/invoice-detail', { state: { invoice: paymentInvoice } })}
          />
          {balanceDue > 0 && (
            <ActionButton
              icon={<DollarSign size={20} />}
              label="Record Payment"
              onClick={() => navigate('/record-payment', { state: { invoice: paymentInvoice } })}
            />
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 space-y-2">
        <button
          onClick={() => navigate('/choose-customer')}
          className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 active:bg-gray-800"
        >
          <ShoppingCart size={20} />
          New Sale
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

function ActionButton({
  icon,
  label,
  onClick,
  disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`w-full p-3 rounded-lg flex items-center gap-3 font-medium bg-white border border-gray-300 text-gray-900 active:bg-gray-50 ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

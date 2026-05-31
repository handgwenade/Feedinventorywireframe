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
      <div className="min-h-screen bg-[#f7f4ed] flex flex-col">
        <div className="bg-white border-b border-[#e8dfd1] p-6 shadow-[0_1px_4px_rgba(61,47,31,0.06)]">
          <h1 className="text-2xl font-bold text-[#3d2f1f]">Invoice Confirmation</h1>
        </div>

        <div className="flex-1 p-4">
          <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 space-y-3 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <div className="text-sm text-[#8b7a6f]">Create an invoice before viewing this confirmation.</div>
            <button
              onClick={() => navigate('/choose-customer')}
              className="w-full bg-[#5a7a4d] text-white py-3 rounded-2xl font-semibold active:bg-[#4a6a3d] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
            >
              Back to Take Feed
            </button>
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
    <div className="min-h-screen bg-[#f7f4ed] flex flex-col">
      {/* Success Header */}
      <div className="bg-white border-b border-[#e8dfd1] p-6 shadow-[0_1px_4px_rgba(61,47,31,0.06)]">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-[#e9f0e5] rounded-full flex items-center justify-center mb-4 border-2 border-[#5a7a4d] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <CheckCircle2 size={32} className="text-[#5a7a4d]" />
          </div>
          <h1 className="text-2xl font-bold text-[#3d2f1f] mb-2">Invoice Created!</h1>
          <p className="text-[#8b7a6f]">Sale successfully recorded</p>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {/* Invoice Details */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 space-y-3 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div>
            <div className="text-sm text-[#8b7a6f] mb-1">Invoice Number</div>
            <div className="text-xl font-bold text-[#3d2f1f]">{invoiceNumber}</div>
          </div>

          <div className="border-t border-[#e8dfd1] pt-3">
            <div className="text-sm text-[#8b7a6f] mb-1">Customer</div>
            <div className="font-semibold text-[#3d2f1f]">{customerName}</div>
          </div>

          <div className="border-t border-[#e8dfd1] pt-3">
            <div className="text-sm text-[#8b7a6f] mb-1">Total</div>
            <div className="text-2xl font-bold text-[#3d2f1f]">
              {formatCurrency(total)}
            </div>
          </div>

          <div className="border-t border-[#e8dfd1] pt-3">
            <div className="text-sm text-[#8b7a6f] mb-1">Balance Due</div>
            <div className="text-xl font-semibold text-[#3d2f1f]">
              {formatCurrency(balanceDue)}
            </div>
          </div>
        </div>

        {cart.length > 0 && (
          <div className="bg-white border border-[#ded2c0] rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <div className="p-4 border-b border-[#e8dfd1] bg-[#f7f4ed]">
              <h2 className="font-semibold text-[#3d2f1f]">Line Items</h2>
            </div>
            <div className="divide-y divide-[#e8dfd1]">
              {cart.map((item) => (
                <div key={item.productId} className="p-4 flex justify-between gap-3 text-sm">
                  <div>
                    <div className="font-medium text-[#3d2f1f]">{item.name}</div>
                    <div className="text-[#8b7a6f]">{item.quantity} {item.unitLabel ?? 'units'} @ {formatCurrency(item.price)}</div>
                  </div>
                  <div className="font-semibold text-[#3d2f1f]">{formatCurrency(calculateLineTotal(item.quantity, item.price))}</div>
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
          className="w-full bg-[#5a7a4d] text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 active:bg-[#4a6a3d] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
        >
          <ShoppingCart size={20} />
          New Sale
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
      className={`w-full p-3 rounded-2xl flex items-center gap-3 font-semibold bg-white border border-[#ded2c0] text-[#3d2f1f] active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)] transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

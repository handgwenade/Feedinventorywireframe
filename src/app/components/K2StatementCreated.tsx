import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Download, Printer, Send, DollarSign, Home, FileText } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import { calculateLineTotal, formatCurrency } from '../utils/calculations';

interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  unitLabel?: string;
}

interface K2StatementCreatedState {
  statementId?: string;
  displayNumber?: string;
  cart?: CartItem[];
  subtotal?: number;
  total?: number;
  accountId?: string;
  accountName?: string;
  status?: string;
}

function getStatusLabel(status?: string): string {
  if (status === 'internal') return 'Internal Transfer';
  return status ? status.replaceAll('-', ' ') : '—';
}

export default function K2StatementCreated() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? null) as K2StatementCreatedState | null;

  if (!state) {
    return (
      <div className="min-h-screen bg-[#f7f4ed] flex flex-col">
        <div className="bg-white border-b border-[#e8dfd1] p-6 shadow-[0_1px_4px_rgba(61,47,31,0.06)]">
          <h1 className="text-2xl font-bold text-[#3d2f1f]">K2 Statement Confirmation</h1>
        </div>

        <div className="flex-1 p-4">
          <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 space-y-3 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <div className="text-sm text-[#8b7a6f]">Create a K2 statement before viewing this confirmation.</div>
            <button
              onClick={() => navigate('/k2-add-products')}
              className="w-full bg-[#5a7a4d] text-white py-3 rounded-2xl font-semibold active:bg-[#4a6a3d] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
            >
              Back to K2 Use
            </button>
          </div>
        </div>

        <BottomNav />
      </div>
    );
  }

  const total = Number(state.total ?? 0);
  const subtotal = Number(state.subtotal ?? total);
  const status = state.status ?? 'internal';
  const statementNumber = state.displayNumber ?? 'Not assigned';
  const accountName = state.accountName ?? 'K2';
  const cart = state.cart ?? [];

  return (
    <div className="min-h-screen bg-[#f7f4ed] flex flex-col">
      {/* Success Header */}
      <div className="bg-white border-b border-[#e8dfd1] p-6 shadow-[0_1px_4px_rgba(61,47,31,0.06)]">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-[#e9f0e5] rounded-full flex items-center justify-center mb-4 border-2 border-[#5a7a4d] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <CheckCircle2 size={32} className="text-[#5a7a4d]" />
          </div>
          <h1 className="text-2xl font-bold text-[#3d2f1f] mb-2">K2 Statement Created!</h1>
          <p className="text-[#8b7a6f]">K2 use recorded and inventory adjusted</p>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {/* Statement Details */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 space-y-3 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div>
            <div className="text-sm text-[#8b7a6f] mb-1">Statement Number</div>
            <div className="text-xl font-bold text-[#3d2f1f]">{statementNumber}</div>
          </div>

          <div className="border-t border-[#e8dfd1] pt-3">
            <div className="text-sm text-[#8b7a6f] mb-1">Account</div>
            <div className="font-semibold text-[#3d2f1f]">{accountName}</div>
          </div>

          <div className="border-t border-[#e8dfd1] pt-3">
            <div className="text-sm text-[#8b7a6f] mb-2">Badge</div>
            <span className="inline-block px-3 py-1 bg-[#e9f0e5] text-[#5a7a4d] text-xs font-semibold rounded-full border border-[#cbd8c4]">
              K2 Account
            </span>
          </div>

          <div className="border-t border-[#e8dfd1] pt-3">
            <div className="text-sm text-[#8b7a6f] mb-1">Subtotal</div>
            <div className="font-semibold text-[#3d2f1f]">
              {formatCurrency(subtotal)}
            </div>
          </div>

          <div className="border-t border-[#e8dfd1] pt-3">
            <div className="text-sm text-[#8b7a6f] mb-1">Total</div>
            <div className="text-2xl font-bold text-[#3d2f1f]">
              {formatCurrency(total)}
            </div>
          </div>

          <div className="border-t border-[#e8dfd1] pt-3">
            <div className="text-sm text-[#8b7a6f] mb-1">Status</div>
            <div className="font-semibold text-[#3d2f1f] capitalize">{getStatusLabel(status)}</div>
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
          <ActionButton icon={<Download size={20} />} label="Download PDF" onClick={() => {}} />
          <ActionButton icon={<Printer size={20} />} label="Print" onClick={() => {}} />
          <ActionButton icon={<Send size={20} />} label="Send" onClick={() => {}} />
          <DisabledActionButton icon={<DollarSign size={20} />} label="Record Payment" />
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 space-y-2">
        <button
          onClick={() => navigate('/k2-add-products')}
          className="w-full bg-[#5a7a4d] text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 active:bg-[#4a6a3d] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
        >
          <FileText size={20} />
          New K2 Use
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
  onClick
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full p-3 rounded-2xl flex items-center gap-3 font-semibold bg-white border border-[#ded2c0] text-[#3d2f1f] active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)] transition-colors"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function DisabledActionButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      disabled
      className="w-full p-3 rounded-2xl flex items-center gap-3 font-semibold bg-[#f7f4ed] border border-[#ded2c0] text-[#8b7a6f]"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

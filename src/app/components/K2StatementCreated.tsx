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
  displayNumber?: string;
  cart?: CartItem[];
  total?: number;
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
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">K2 Statement Confirmation</h1>
        </div>

        <div className="flex-1 p-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="text-sm text-gray-700">Create a K2 statement before viewing this confirmation.</div>
            <button
              onClick={() => navigate('/k2-add-products')}
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold active:bg-gray-800"
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
  const status = state.status ?? 'internal';
  const statementNumber = state.displayNumber ?? 'Not assigned';
  const cart = state.cart ?? [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Success Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 border-2 border-gray-900">
            <CheckCircle2 size={32} className="text-gray-900" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">K2 Statement Created!</h1>
          <p className="text-gray-600">K2 use confirmation is route-state only</p>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {/* Statement Details */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <div>
            <div className="text-sm text-gray-600 mb-1">Statement Number</div>
            <div className="text-xl font-bold text-gray-900">{statementNumber}</div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">Account</div>
            <div className="font-semibold text-gray-900">K2</div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-2">Badge</div>
            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded border border-gray-300">
              K2 Account
            </span>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">Total</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(total)}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">Status</div>
            <div className="font-semibold text-gray-900 capitalize">{getStatusLabel(status)}</div>
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
          className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 active:bg-gray-800"
        >
          <FileText size={20} />
          New K2 Use
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
  onClick
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full p-3 rounded-lg flex items-center gap-3 font-medium bg-white border border-gray-300 text-gray-900 active:bg-gray-50"
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
      className="w-full p-3 rounded-lg flex items-center gap-3 font-medium bg-gray-100 border border-gray-300 text-gray-500"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

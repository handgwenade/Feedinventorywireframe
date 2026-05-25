import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Plus } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import { calculateLineTotal, formatCurrency } from '../utils/calculations';

interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  unitLabel?: string;
}

type PaymentStatus = 'unpaid' | 'paid' | 'partial';

export default function ReviewInvoice() {
  const navigate = useNavigate();
  const location = useLocation();
  const { customerName = 'Anderson Cattle Co.', customerId, accountId, cart: initialCart = [] } = location.state || {};

  const [cart, setCart] = useState<CartItem[]>(initialCart);
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [notes, setNotes] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid');

  const invoiceNumber = 'INV-1001';

  const subtotal = cart.reduce((sum: number, item: CartItem) => sum + calculateLineTotal(item.quantity, item.price), 0);
  const taxRate = 0.08;
  const tax = taxEnabled ? subtotal * taxRate : 0;
  const total = subtotal + tax;

  const handleRemoveItem = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleEditItem = (index: number) => {
    navigate('/add-products', {
      state: { customerName, customerId, accountId, cart, editingIndex: index }
    });
  };

  const handleAddProduct = () => {
    navigate('/add-products', {
      state: { customerName, customerId, accountId, cart }
    });
  };

  const handleCreateInvoice = () => {
    if (paymentStatus === 'unpaid') {
      navigate('/invoice-created', {
        state: { customerName, customerId, accountId, cart, subtotal, tax, total, balanceDue: total, notes }
      });
    } else {
      navigate('/payment-details', {
        state: { customerName, customerId, accountId, cart, subtotal, tax, total, paymentStatus, notes }
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-48">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/add-products')}
          className="text-gray-600 active:text-gray-900"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Review Invoice</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Customer Info & Invoice Number */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-sm text-gray-600 mb-1">Customer</div>
              <div className="font-semibold text-gray-900">{customerName}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Invoice #</div>
              <div className="font-semibold text-gray-900">{invoiceNumber}</div>
            </div>
          </div>
          <div>
            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded border border-gray-300">
              Customer
            </span>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">Line Items</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {cart.map((item: CartItem, index: number) => (
              <div key={index} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1">{item.name}</div>
                    <div className="text-sm text-gray-600">
                      Quantity: {item.quantity} {item.unitLabel ?? 'units'}
                    </div>
                    <div className="text-sm text-gray-600">
                      Unit price: {formatCurrency(item.price)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 text-lg mb-2">
                      {formatCurrency(calculateLineTotal(item.quantity, item.price))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleEditItem(index)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg active:bg-gray-200"
                  >
                    <Edit2 size={16} />
                    <span className="text-sm font-medium">Edit</span>
                  </button>
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg active:bg-red-100"
                  >
                    <Trash2 size={16} />
                    <span className="text-sm font-medium">Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Another Product */}
        <button
          onClick={handleAddProduct}
          className="w-full bg-white border-2 border-dashed border-gray-300 p-4 rounded-lg flex items-center justify-center gap-2 text-gray-600 active:bg-gray-50"
        >
          <Plus size={20} />
          <span className="font-medium">Add Another Product</span>
        </button>

        {/* Totals */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex justify-between text-gray-700">
            <span>Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>

          {/* Tax Toggle */}
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Tax (8%)</span>
            <div className="flex items-center gap-3">
              {taxEnabled && (
                <span className="font-medium text-gray-900">
                  {formatCurrency(tax)}
                </span>
              )}
              <button
                onClick={() => setTaxEnabled(!taxEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  taxEnabled ? 'bg-gray-900' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    taxEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
            <span className="font-semibold text-gray-900 text-lg">Total</span>
            <span className="font-bold text-gray-900 text-2xl">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Add note, pickup details, check info..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>

        {/* Payment Status */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Payment Status
          </label>
          <div className="space-y-2">
            <PaymentOption
              value="unpaid"
              label="Unpaid"
              selected={paymentStatus === 'unpaid'}
              onSelect={() => setPaymentStatus('unpaid')}
            />
            <PaymentOption
              value="paid"
              label="Paid Now"
              selected={paymentStatus === 'paid'}
              onSelect={() => setPaymentStatus('paid')}
            />
            <PaymentOption
              value="partial"
              label="Partial Payment"
              selected={paymentStatus === 'partial'}
              onSelect={() => setPaymentStatus('partial')}
            />
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-900 p-4 max-w-md mx-auto">
        <button
          onClick={handleCreateInvoice}
          className="w-full bg-gray-900 text-white py-4 rounded-lg font-semibold active:bg-gray-800"
        >
          Create Invoice
        </button>
        {/* Payment Flow Annotation */}
        <div className="mt-3 p-3 bg-gray-50 border border-gray-300 rounded text-xs text-gray-600 leading-relaxed">
          <strong>Payment Flow:</strong><br />
          If <em>Unpaid</em> is selected, Create Invoice goes directly to Invoice Created.<br />
          If <em>Paid Now</em> or <em>Partial Payment</em> is selected, the user goes to Payment Details before Invoice Created.
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function PaymentOption({
  value,
  label,
  selected,
  onSelect,
}: {
  value: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full p-3 border rounded-lg flex items-center gap-3 active:bg-gray-50 ${
        selected
          ? 'border-gray-900 bg-gray-50'
          : 'border-gray-300 bg-white'
      }`}
    >
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
        selected ? 'border-gray-900' : 'border-gray-300'
      }`}>
        {selected && (
          <div className="w-3 h-3 rounded-full bg-gray-900" />
        )}
      </div>
      <span className="font-medium text-gray-900">
        {label}
      </span>
    </button>
  );
}

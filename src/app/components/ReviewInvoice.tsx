import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Plus } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import { takeFeedService } from '../services/takeFeedService';
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
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const handleCreateInvoice = async () => {
    setErrorMessage(null);

    if (paymentStatus === 'unpaid') {
      const selectedCustomerId = accountId ?? customerId;

      if (!selectedCustomerId || selectedCustomerId === 'unassigned') {
        setErrorMessage('Select a customer before creating an unpaid invoice.');
        return;
      }

      try {
        setIsCreating(true);
        const createdInvoice = await takeFeedService.createCustomerUnpaidInvoice({
          customerId: selectedCustomerId,
          cart,
          notes,
          tax,
        });

        navigate('/invoice-created', {
          state: {
            customerName,
            customerId,
            accountId: selectedCustomerId,
            cart,
            invoiceId: createdInvoice.invoiceId,
            displayNumber: createdInvoice.displayNumber,
            subtotal: createdInvoice.subtotal,
            tax: createdInvoice.tax,
            total: createdInvoice.total,
            balanceDue: createdInvoice.balanceDue,
            notes,
          }
        });
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Unable to create invoice.');
      } finally {
        setIsCreating(false);
      }
    } else {
      navigate('/payment-details', {
        state: { customerName, customerId, accountId, cart, subtotal, tax, total, paymentStatus, notes }
      });
    }
  };

return (
    <div className="min-h-screen bg-[#f7f4ed] pb-48">
      {/* Header */}
      <div className="app-header-safe app-header-safe-start">
        <button
          type="button"
          onClick={() => navigate('/add-products', { state: { customerName, customerId, accountId, cart } })}
          className="app-header-action rounded-2xl text-[#8b7a6f] active:bg-[#faf8f5] active:text-[#3d2f1f]"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-[#3d2f1f]">Review Invoice</h1>
      </div>

      <div className="p-4 space-y-4">
        {errorMessage && (
          <div className="bg-white border border-[#b7791f] rounded-2xl p-4 text-sm text-[#3d2f1f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            {errorMessage}
          </div>
        )}

        {/* Customer Info & Invoice Number */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-sm text-[#8b7a6f] mb-1">Customer</div>
              <div className="font-semibold text-[#3d2f1f]">{customerName}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-[#8b7a6f] mb-1">Invoice #</div>
              <div className="font-semibold text-[#3d2f1f]">{invoiceNumber}</div>
            </div>
          </div>
          <div>
            <span className="inline-block px-3 py-1 bg-[#e9f0e5] text-[#5a7a4d] text-xs font-semibold rounded-full border border-[#cbd8c4]">
              Customer
            </span>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div className="p-4 border-b border-[#e8dfd1] bg-[#f7f4ed]">
            <h2 className="font-semibold text-[#3d2f1f]">Line Items</h2>
          </div>
          <div className="divide-y divide-[#e8dfd1]">
            {cart.map((item: CartItem, index: number) => (
              <div key={index} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="font-medium text-[#3d2f1f] mb-1">{item.name}</div>
                    <div className="text-sm text-[#8b7a6f]">
                      Quantity: {item.quantity} {item.unitLabel ?? 'units'}
                    </div>
                    <div className="text-sm text-[#8b7a6f]">
                      Unit price: {formatCurrency(item.price)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-[#3d2f1f] text-lg mb-2">
                      {formatCurrency(calculateLineTotal(item.quantity, item.price))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleEditItem(index)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-[#ded2c0] text-[#3d2f1f] rounded-2xl active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
                  >
                    <Edit2 size={16} />
                    <span className="text-sm font-medium">Edit</span>
                  </button>
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#fff4f0] border border-[#d8a59a] text-[#8b3f2f] rounded-2xl active:bg-[#fbe8e1] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
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
          className="w-full bg-white border-2 border-dashed border-[#d4a574] p-4 rounded-2xl flex items-center justify-center gap-2 text-[#5a7a4d] active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)] transition-colors"
        >
          <Plus size={20} />
          <span className="font-semibold">Add Another Product</span>
        </button>

        {/* Totals */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 space-y-3 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div className="flex justify-between text-[#8b7a6f]">
            <span>Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>

          {/* Tax Toggle */}
          <div className="flex justify-between items-center">
            <span className="text-[#8b7a6f]">Tax (8%)</span>
            <div className="flex items-center gap-3">
              {taxEnabled && (
                <span className="font-medium text-[#3d2f1f]">
                  {formatCurrency(tax)}
                </span>
              )}
              <button
                onClick={() => setTaxEnabled(!taxEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  taxEnabled ? 'bg-[#5a7a4d]' : 'bg-[#ded2c0]'
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

          <div className="pt-3 border-t border-[#e8dfd1] flex justify-between items-center">
            <span className="font-semibold text-[#3d2f1f] text-lg">Total</span>
            <span className="font-bold text-[#3d2f1f] text-2xl">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <label className="block text-sm font-semibold text-[#3d2f1f] mb-2">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Add note, pickup details, check info..."
            rows={3}
            className="w-full bg-white border border-[#ded2c0] rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-[#5a7a4d] text-[#3d2f1f] placeholder:text-[#8b7a6f]"
          />
        </div>

        {/* Payment Status */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <label className="block text-sm font-semibold text-[#3d2f1f] mb-3">
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
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e8dfd1] p-4 max-w-md mx-auto shadow-[0_-4px_18px_rgba(61,47,31,0.14)]">
        <button
          onClick={handleCreateInvoice}
          disabled={isCreating}
          className="w-full bg-[#5a7a4d] text-white py-4 rounded-2xl font-semibold active:bg-[#4a6a3d] disabled:bg-[#c7bdb0] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
        >
          {isCreating ? 'Creating Invoice...' : 'Create Invoice'}
        </button>
        {/* Payment Flow Annotation */}
        <div className="mt-3 p-3 bg-[#f7f4ed] border border-[#ded2c0] rounded-2xl text-xs text-[#8b7a6f] leading-relaxed">
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
      className={`w-full p-3 border rounded-2xl flex items-center gap-3 active:bg-[#faf8f5] transition-colors ${
        selected
          ? 'border-[#5a7a4d] bg-[#e9f0e5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]'
          : 'border-[#ded2c0] bg-white'
      }`}
    >
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
        selected ? 'border-[#5a7a4d]' : 'border-[#ded2c0]'
      }`}>
        {selected && (
          <div className="w-3 h-3 rounded-full bg-[#5a7a4d]" />
        )}
      </div>
      <span className="font-semibold text-[#3d2f1f]">
        {label}
      </span>
    </button>
  );
}

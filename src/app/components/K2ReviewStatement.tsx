import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Plus } from 'lucide-react';

interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

type K2Status = 'unpaid' | 'paid' | 'internal';

export default function K2ReviewStatement() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart: initialCart = [] } = location.state || {};

  const [cart, setCart] = useState<CartItem[]>(initialCart);
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<K2Status>('unpaid');

  const statementNumber = 'INV-1002';

  const subtotal = cart.reduce((sum: number, item: CartItem) => sum + (item.quantity * item.price), 0);
  const taxRate = 0.08;
  const tax = taxEnabled ? subtotal * taxRate : 0;
  const total = subtotal + tax;

  const handleRemoveItem = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleEditItem = (index: number) => {
    navigate('/k2-add-products', {
      state: { cart, editingIndex: index }
    });
  };

  const handleAddProduct = () => {
    navigate('/k2-add-products', {
      state: { cart }
    });
  };

  const handleCreateStatement = () => {
    navigate('/k2-statement-created', {
      state: { cart, total, status }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-64">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/k2-add-products')}
          className="text-gray-600 active:text-gray-900"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Review K2 Statement</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Account Info & Statement Number */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-sm text-gray-600 mb-1">Account</div>
              <div className="font-semibold text-gray-900">K2</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Statement #</div>
              <div className="font-semibold text-gray-900">{statementNumber}</div>
            </div>
          </div>
          <div>
            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded border border-gray-300">
              K2 Account
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
                      Quantity: {item.quantity}
                    </div>
                    <div className="text-sm text-gray-600">
                      Unit price: ${item.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 text-lg mb-2">
                      ${(item.quantity * item.price).toFixed(2)}
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
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg active:bg-gray-200"
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

        {/* Notes */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add note, pasture, cattle group, pickup details..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-gray-900 text-gray-900"
          />
        </div>

        {/* Status Options */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Status
          </label>
          <div className="space-y-2">
            <StatusOption
              value="unpaid"
              label="Unpaid"
              selected={status === 'unpaid'}
              onSelect={() => setStatus('unpaid')}
            />
            <StatusOption
              value="paid"
              label="Paid"
              selected={status === 'paid'}
              onSelect={() => setStatus('paid')}
            />
            <StatusOption
              value="internal"
              label="Internal Transfer"
              selected={status === 'internal'}
              onSelect={() => setStatus('internal')}
            />
          </div>
        </div>

        {/* Totals */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex justify-between text-gray-700">
            <span>Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>

          {/* Tax Toggle */}
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Tax (8%)</span>
            <div className="flex items-center gap-3">
              {taxEnabled && (
                <span className="font-medium text-gray-900">
                  ${tax.toFixed(2)}
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
              ${total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-900 p-4 max-w-md mx-auto">
        <button
          onClick={handleCreateStatement}
          className="w-full bg-gray-900 text-white py-4 rounded-lg font-semibold active:bg-gray-800"
        >
          Create K2 Statement
        </button>
        {/* Workflow Annotations */}
        <div className="mt-3 p-3 bg-gray-50 border border-gray-300 rounded text-xs text-gray-600 leading-relaxed">
          <strong>K2 Account Workflow:</strong><br />
          • K2 is preselected, no customer selection step<br />
          • Creating a K2 statement reduces C&C inventory<br />
          • K2 statements excluded from standard customer sales reports<br />
          • K2 activity appears in K2 Account Use report<br />
          • Inventory transaction reason/type: K2 Account
        </div>
      </div>
    </div>
  );
}

function StatusOption({
  value,
  label,
  selected,
  onSelect
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

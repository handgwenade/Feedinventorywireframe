import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

export default function K2ReviewStatement() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart: initialCart = [] } = location.state || {};

  const [cart, setCart] = useState<CartItem[]>(initialCart);
  const [notes, setNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const statementNumber = 'Assigned on create';

  const subtotal = cart.reduce((sum: number, item: CartItem) => sum + calculateLineTotal(item.quantity, item.price), 0);
  const total = subtotal;

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

  const handleCreateStatement = async () => {
    setErrorMessage(null);

    if (cart.length === 0) {
      setErrorMessage('Add at least one product before creating a K2 statement.');
      return;
    }

    try {
      setIsCreating(true);
      const createdStatement = await takeFeedService.createK2Statement({
        cart,
        notes,
      });

      navigate('/k2-statement-created', {
        state: {
          cart,
          statementId: createdStatement.statementId,
          displayNumber: createdStatement.displayNumber,
          subtotal: createdStatement.subtotal,
          total: createdStatement.total,
          accountId: createdStatement.accountId,
          accountName: createdStatement.accountName,
          status: 'internal',
          notes,
        }
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to create K2 statement.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f4ed] pb-64">
      {/* Header */}
      <div className="bg-white border-b border-[#e8dfd1] p-4 flex items-center gap-3 shadow-[0_1px_4px_rgba(61,47,31,0.06)]">
        <button
          onClick={() => navigate('/k2-add-products', { state: { cart } })}
          className="text-[#8b7a6f] active:text-[#3d2f1f]"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-[#3d2f1f]">Review K2 Statement</h1>
      </div>

      <div className="p-4 space-y-4">
        {errorMessage && (
          <div className="bg-white border border-[#b7791f] rounded-2xl p-4 text-sm text-[#3d2f1f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            {errorMessage}
          </div>
        )}

        {/* Account Info & Statement Number */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-sm text-[#8b7a6f] mb-1">Account</div>
              <div className="font-semibold text-[#3d2f1f]">K2</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-[#8b7a6f] mb-1">Statement #</div>
              <div className="font-semibold text-[#3d2f1f]">{statementNumber}</div>
            </div>
          </div>
          <div>
            <span className="inline-block px-3 py-1 bg-[#e9f0e5] text-[#5a7a4d] text-xs font-semibold rounded-full border border-[#cbd8c4]">
              K2 Account
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

        {/* Notes */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <label className="block text-sm font-semibold text-[#3d2f1f] mb-2">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add note, pasture, cattle group, pickup details..."
            rows={3}
            className="w-full bg-white border border-[#ded2c0] rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-[#5a7a4d] text-[#3d2f1f] placeholder:text-[#8b7a6f]"
          />
        </div>

        {/* Status */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div className="text-sm text-[#8b7a6f] mb-1">Status</div>
          <div className="font-semibold text-[#3d2f1f]">Internal Transfer</div>
          <div className="text-sm text-[#8b7a6f] mt-2">
            K2 statements reduce inventory and are recorded with no balance due.
          </div>
        </div>

        {/* Totals */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 space-y-3 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div className="flex justify-between text-[#8b7a6f]">
            <span>Subtotal</span>
            <span className="font-medium text-[#3d2f1f]">{formatCurrency(subtotal)}</span>
          </div>

          <div className="pt-3 border-t border-[#e8dfd1] flex justify-between items-center">
            <span className="font-semibold text-[#3d2f1f] text-lg">Total</span>
            <span className="font-bold text-[#3d2f1f] text-2xl">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e8dfd1] p-4 max-w-md mx-auto shadow-[0_-4px_18px_rgba(61,47,31,0.14)]">
        <button
          onClick={handleCreateStatement}
          disabled={isCreating}
          className="w-full bg-[#5a7a4d] text-white py-4 rounded-2xl font-semibold active:bg-[#4a6a3d] disabled:bg-[#c7bdb0] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
        >
          {isCreating ? 'Creating K2 Statement...' : 'Create K2 Statement'}
        </button>
        {/* Workflow Annotations */}
        <div className="mt-3 p-3 bg-[#f7f4ed] border border-[#ded2c0] rounded-2xl text-xs text-[#8b7a6f] leading-relaxed">
          <strong>K2 Account Workflow:</strong><br />
          • K2 is preselected, no customer selection step<br />
          • Creating a K2 statement reduces C&C inventory<br />
          • K2 statements excluded from standard customer sales reports<br />
          • K2 activity appears in K2 Account Use report<br />
          • Inventory transaction reason/type: K2 Account
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

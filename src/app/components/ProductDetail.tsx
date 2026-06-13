import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Archive, ArrowLeft, ShoppingCart, PlusCircle, Edit3, Clock, Package } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';
import { inventoryTransactionsService, type InventoryTransactionItem } from '../services/inventoryTransactionsService';
import { productsService } from '../services/productsService';
import { calculateInventoryValue, formatCurrency, isLowStock } from '../utils/calculations';
import type { Product } from '../types';

function getSelectedProduct(locationState: unknown): Product | null {
  const state = locationState as { product?: Product } | null;
  return state?.product ?? null;
}

function getTransactionTypeLabel(transactionType: string): string {
  const labels: Record<string, string> = {
    take_feed: 'Take Feed',
    add_stock: 'Add Stock',
    adjust_count: 'Adjust Count',
    correction: 'Correction',
  };

  return labels[transactionType] ?? transactionType.replaceAll('_', ' ');
}

function formatMovementDate(value: string): string {
  const date = new Date(value);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })}`;
}

export default function ProductDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const product = getSelectedProduct(location.state);
  const [transactions, setTransactions] = useState<InventoryTransactionItem[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [showArchivePanel, setShowArchivePanel] = useState(false);
  const [archiveReason, setArchiveReason] = useState('');
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  useEffect(() => {
    if (!product?.id) return;

    let isMounted = true;

    async function loadTransactions() {
      try {
        setIsLoadingTransactions(true);
        setTransactionError(null);
        const productTransactions = await inventoryTransactionsService.listForProduct(product.id);

        if (isMounted) {
          setTransactions(productTransactions.slice(0, 5));
        }
      } catch (error) {
        if (isMounted) {
          setTransactionError(error instanceof Error ? error.message : 'Unable to load product movements.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingTransactions(false);
        }
      }
    }

    loadTransactions();

    return () => {
      isMounted = false;
    };
  }, [product?.id]);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f7f4ed] pb-24">
        <div className="app-header-safe">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/inventory')}
              className="app-header-action rounded-2xl text-[#8b7a6f] active:bg-[#faf8f5] active:text-[#3d2f1f]"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-[#3d2f1f]">Product Detail</h1>
          </div>
          <UserIcon />
        </div>

        <div className="p-4">
          <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 space-y-3 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <div className="text-sm text-[#8b7a6f]">Select a product before continuing.</div>
            <button
              onClick={() => navigate('/inventory')}
              className="w-full bg-white border border-[#ded2c0] text-[#3d2f1f] py-3 rounded-2xl font-semibold active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
            >
              Back to Inventory
            </button>
          </div>
        </div>

        <BottomNav />
      </div>
    );
  }

  const inventoryValue = calculateInventoryValue(product);
  const lowStock = isLowStock(product);
  const status = lowStock ? 'Low Stock' : 'In Stock';

  const handleArchiveProduct = async () => {
    setArchiveError(null);

    if (!archiveReason.trim()) {
      setArchiveError('Archive reason is required.');
      return;
    }

    try {
      setIsArchiving(true);
      await productsService.archiveProduct({
        productId: product.id,
        reason: archiveReason,
      });
      navigate('/inventory');
    } catch (error) {
      setArchiveError(error instanceof Error ? error.message : 'Unable to archive product.');
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f4ed] pb-24">
      <div className="app-header-safe">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/inventory')}
            className="app-header-action rounded-2xl text-[#8b7a6f] active:bg-[#faf8f5] active:text-[#3d2f1f]"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-[#3d2f1f]">Product Detail</h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div className="w-full h-48 bg-[#f7f4ed] border border-[#e8dfd1] rounded-2xl flex items-center justify-center mb-4">
            <Package size={64} className="text-[#8b7a6f]" />
          </div>
          <h2 className="text-xl font-bold text-[#3d2f1f]">{product.name}</h2>
        </div>

        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 space-y-3 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div className="flex justify-between gap-4">
            <span className="text-[#8b7a6f]">Current quantity</span>
            <span className="text-xl font-bold text-[#3d2f1f]">
              {product.currentQuantity} {product.unitLabel}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[#8b7a6f]">Minimum quantity</span>
            <span className="font-medium text-[#3d2f1f]">
              {product.minimumQuantity} {product.unitLabel}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[#8b7a6f]">Unit price</span>
            <span className="font-medium text-[#3d2f1f]">
              {formatCurrency(product.salePrice)} / {product.unitLabel}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[#8b7a6f]">Inventory value</span>
            <span className="font-semibold text-[#3d2f1f]">{formatCurrency(inventoryValue)}</span>
          </div>
          <div className="pt-3 border-t border-[#e8dfd1] flex justify-between gap-4">
            <span className="text-[#8b7a6f]">Status</span>
            <span className="font-semibold text-[#3d2f1f]">{status}</span>
          </div>
        </div>

        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div className="text-sm text-[#8b7a6f] mb-1">Vendor/source note</div>
          <div className="text-[#3d2f1f]">{product.vendor ?? '—'}</div>
        </div>

        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div className="text-sm text-[#8b7a6f] mb-1">Notes</div>
          <div className="text-[#3d2f1f]">{product.sourceNotes ?? '—'}</div>
        </div>

        <div className="space-y-2">
          <ActionButton
            icon={<ShoppingCart size={20} />}
            label="Take Feed"
            onClick={() => navigate('/choose-sale-type')}
          />
          <ActionButton
            icon={<PlusCircle size={20} />}
            label="Add Stock"
            onClick={() => navigate('/add-stock-quantity', { state: { product } })}
          />
          <ActionButton
            icon={<Edit3 size={20} />}
            label="Edit Product"
            onClick={() => navigate('/product-form', { state: { product } })}
          />
          <ActionButton
            icon={<Edit3 size={20} />}
            label="Adjust Count"
            onClick={() => navigate('/adjust-count', { state: { product } })}
          />
          <ActionButton
            icon={<Clock size={20} />}
            label="View History"
            onClick={() => navigate('/activity-history')}
          />
          <ActionButton
            icon={<Archive size={20} />}
            label="Archive Product"
            onClick={() => {
              setShowArchivePanel(true);
              setArchiveError(null);
            }}
          />
        </div>

        {showArchivePanel && (
          <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 space-y-3 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <div>
              <div className="font-semibold text-[#3d2f1f]">Archive Product</div>
              <div className="text-sm text-[#8b7a6f] mt-1">
                This hides the product from normal inventory and picker screens. Historical records stay intact.
              </div>
            </div>

            {archiveError && (
              <div className="bg-white border border-[#ded2c0] rounded-2xl p-3 text-sm text-[#3d2f1f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
                {archiveError}
              </div>
            )}

            <textarea
              value={archiveReason}
              onChange={(event) => setArchiveReason(event.target.value)}
              placeholder="Reason for archive..."
              rows={3}
              className="w-full bg-white border border-[#ded2c0] rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-[#5a7a4d] text-[#3d2f1f] placeholder:text-[#8b7a6f]"
            />

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowArchivePanel(false);
                  setArchiveError(null);
                  setArchiveReason('');
                }}
                disabled={isArchiving}
                className="flex-1 bg-white border border-[#ded2c0] text-[#3d2f1f] py-3 rounded-2xl font-semibold active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
              >
                Cancel
              </button>
              <button
                onClick={handleArchiveProduct}
                disabled={isArchiving}
                className="flex-1 bg-[#8b3f2f] text-white py-3 rounded-2xl font-semibold active:bg-[#733426] disabled:bg-[#c7bdb0] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
              >
                {isArchiving ? 'Archiving...' : 'Archive'}
              </button>
            </div>
          </div>
        )}

        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <h3 className="font-semibold text-[#3d2f1f] mb-3">Recent Activity</h3>
          <div className="space-y-3">
            {isLoadingTransactions ? (
              <p className="text-sm text-[#8b7a6f]">Loading recent movements...</p>
            ) : transactionError ? (
              <div className="bg-white border border-[#ded2c0] rounded-2xl p-3 text-sm text-[#3d2f1f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
                {transactionError}
              </div>
            ) : transactions.length > 0 ? (
              transactions.map((transaction) => (
                <ActivityItem key={transaction.id} transaction={transaction} unitLabel={product.unitLabel} />
              ))
            ) : (
              <p className="text-sm text-[#8b7a6f]">No recent inventory movements for this product.</p>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 rounded-2xl flex items-center gap-3 font-semibold bg-white border border-[#ded2c0] text-[#3d2f1f] active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)] transition-colors"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function ActivityItem({
  transaction,
  unitLabel,
}: {
  transaction: InventoryTransactionItem;
  unitLabel: string;
}) {
  const quantityChange = transaction.quantityChange > 0
    ? `+${transaction.quantityChange}`
    : transaction.quantityChange.toString();

  return (
    <div className="flex items-start gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-[#d4a574] mt-2 flex-shrink-0" />
      <div className="text-sm text-[#8b7a6f] flex-1">
        <div className="flex justify-between gap-3">
          <span className="font-medium text-[#3d2f1f]">{getTransactionTypeLabel(transaction.transactionType)}</span>
          <span className="font-semibold text-[#3d2f1f]">{quantityChange} {unitLabel}</span>
        </div>
        <div className="text-[#8b7a6f]">
          {transaction.quantityBefore} to {transaction.quantityAfter} {unitLabel}
        </div>
        <div className="text-[#8b7a6f]">{formatMovementDate(transaction.createdAt)}</div>
        {transaction.notes && (
          <div className="text-[#8b7a6f] mt-1">{transaction.notes}</div>
        )}
      </div>
    </div>
  );
}

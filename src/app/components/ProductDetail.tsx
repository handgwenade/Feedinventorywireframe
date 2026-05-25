import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, PlusCircle, Edit3, Clock, Package } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';
import { activityLogs, products } from '../data/mockData';
import { calculateInventoryValue, formatCurrency, isLowStock } from '../utils/calculations';
import type { Product } from '../types';

function getSelectedProduct(locationState: unknown): Product {
  const state = locationState as { product?: Product } | null;
  return state?.product ?? products[0];
}

export default function ProductDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const product = getSelectedProduct(location.state);

  const inventoryValue = calculateInventoryValue(product);
  const lowStock = isLowStock(product);
  const status = lowStock ? 'Low Stock' : 'In Stock';
  const productActivity = activityLogs
    .filter((activity) => activity.productId === product.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/inventory')}
            className="text-gray-600 active:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Product Detail</h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            <Package size={64} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex justify-between gap-4">
            <span className="text-gray-700">Current quantity</span>
            <span className="text-xl font-bold text-gray-900">
              {product.currentQuantity} {product.unitLabel}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-700">Minimum quantity</span>
            <span className="font-medium text-gray-900">
              {product.minimumQuantity} {product.unitLabel}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-700">Unit price</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(product.salePrice)} / {product.unitLabel}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-700">Inventory value</span>
            <span className="font-semibold text-gray-900">{formatCurrency(inventoryValue)}</span>
          </div>
          <div className="pt-3 border-t border-gray-200 flex justify-between gap-4">
            <span className="text-gray-700">Status</span>
            <span className="font-semibold text-gray-900">{status}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Vendor/source note</div>
          <div className="text-gray-900">{product.vendor ?? '—'}</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Notes</div>
          <div className="text-gray-900">{product.sourceNotes ?? '—'}</div>
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
            label="Adjust Count"
            onClick={() => navigate('/adjust-count', { state: { product } })}
          />
          <ActionButton
            icon={<Clock size={20} />}
            label="View History"
            onClick={() => navigate('/activity-history')}
          />
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Recent Activity</h3>
          <div className="space-y-3">
            {productActivity.length > 0 ? (
              productActivity.map((activity) => (
                <ActivityItem key={activity.id} text={activity.summary} />
              ))
            ) : (
              <p className="text-sm text-gray-600">No recent activity for this product.</p>
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
      className="w-full p-4 rounded-lg flex items-center gap-3 font-medium bg-white border border-gray-300 text-gray-900 active:bg-gray-50"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function ActivityItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
      <p className="text-sm text-gray-700">{text}</p>
    </div>
  );
}

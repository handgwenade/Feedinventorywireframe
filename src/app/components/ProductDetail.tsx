import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, PlusCircle, Edit3, Clock } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';

interface Product {
  id: string;
  name: string;
  available: number;
  price: number;
  lowStock?: boolean;
}

export default function ProductDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { product } = location.state || { product: { name: 'Garlic Salt Blocks', available: 247, price: 17.15 } };

  const inventoryValue = product.available * product.price;
  const minimumQuantity = 50;
  const status = product.lowStock ? 'Low Stock' : 'In Stock';

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
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
        {/* Product Image & Name */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            <Package size={64} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
        </div>

        {/* Stock Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-700">Current quantity</span>
            <span className="text-xl font-bold text-gray-900">{product.available}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Minimum quantity</span>
            <span className="font-medium text-gray-900">{minimumQuantity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Unit price</span>
            <span className="font-medium text-gray-900">${product.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Inventory value</span>
            <span className="font-semibold text-gray-900">${inventoryValue.toFixed(2)}</span>
          </div>
          <div className="pt-3 border-t border-gray-200 flex justify-between">
            <span className="text-gray-700">Status</span>
            <span className={`font-semibold ${product.lowStock ? 'text-gray-900' : 'text-gray-900'}`}>
              {status}
            </span>
          </div>
        </div>

        {/* Vendor/Source Note */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Vendor/source note</div>
          <div className="text-gray-900">—</div>
        </div>

        {/* Notes */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Notes</div>
          <div className="text-gray-900">—</div>
        </div>

        {/* Action Buttons */}
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

        {/* Recent Activity */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Recent Activity</h3>
          <div className="space-y-3">
            <ActivityItem text="Tessie sold 3 Garlic Salt Blocks" />
            <ActivityItem text="Bill added 40 Garlic Salt Blocks" />
            <ActivityItem text="Operator recorded 2 Garlic Salt Blocks to K2" />
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function Package({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16.5 9.4l-9-5.19" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
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

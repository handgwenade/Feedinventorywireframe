import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Package, Users, FileText, Plus, Edit } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';

interface Activity {
  id: string;
  type: 'take-feed' | 'add-stock' | 'payment' | 'adjustment';
  recordType?: 'customer' | 'k2' | 'family';
  date: string;
  time: string;
  recordedBy: string;
  takenBy?: string;
  account?: string;
  product?: string;
  quantity?: number;
  newQuantity?: number;
  previousQuantity?: number;
  correctedQuantity?: number;
  difference?: number;
  paymentAmount?: number;
  paymentMethod?: string;
  invoiceRecord?: string;
  reason?: string;
}

export default function ActivityDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activity } = location.state || {
    activity: {
      id: '1',
      type: 'take-feed',
      recordType: 'customer',
      date: '5/19/2026',
      time: '10:42 AM',
      recordedBy: 'Operator',
      account: 'Anderson Cattle Co.',
      product: 'Garlic Salt Blocks',
      quantity: -10,
      newQuantity: 237,
      invoiceRecord: 'Customer invoice'
    }
  };

  const renderTakeFeedDetail = () => {
    const quantityBefore = (activity.newQuantity || 0) - (activity.quantity || 0);
    const unitPrice = 17.15;
    const totalValue = Math.abs(activity.quantity || 0) * unitPrice;

    return (
      <>
        {/* Activity Info */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm text-gray-600 mb-1">Activity type</div>
              <div className="text-xl font-bold text-gray-900">Take Feed</div>
            </div>
            {activity.recordType && (
              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded border border-gray-300 capitalize">
                {activity.recordType}
              </span>
            )}
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">Date/time</div>
            <div className="font-medium text-gray-900">{activity.date} {activity.time}</div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">Recorded by</div>
            <div className="font-medium text-gray-900">{activity.recordedBy}</div>
          </div>

          {activity.takenBy && (
            <div className="border-t border-gray-200 pt-3">
              <div className="text-sm text-gray-600 mb-1">Taken by</div>
              <div className="font-medium text-gray-900">{activity.takenBy}</div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">Customer/account/person</div>
            <div className="font-medium text-gray-900">{activity.account}</div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">Product</div>
            <div className="font-medium text-gray-900">{activity.product}</div>
          </div>
        </div>

        {/* Quantity Changes */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <h2 className="font-semibold text-gray-900">Quantity Changes</h2>

          <div className="flex justify-between">
            <span className="text-gray-700">Quantity change</span>
            <span className="font-semibold text-gray-900">{activity.quantity} units</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-700">Quantity before</span>
            <span className="font-medium text-gray-900">{quantityBefore}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-700">Quantity after</span>
            <span className="font-medium text-gray-900">{activity.newQuantity}</span>
          </div>
        </div>

        {/* Value */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <h2 className="font-semibold text-gray-900">Value</h2>

          <div className="flex justify-between">
            <span className="text-gray-700">Unit price</span>
            <span className="font-medium text-gray-900">${unitPrice.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-700">Total value</span>
            <span className="font-semibold text-gray-900">${totalValue.toFixed(2)}</span>
          </div>
        </div>

        {/* Related Record */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Related invoice/record</div>
          <div className="font-medium text-gray-900">{activity.invoiceRecord}</div>
        </div>

        {/* Notes */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Notes</div>
          <div className="text-gray-900">—</div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <ActionButton icon={<Package size={20} />} label="View Product" onClick={() => navigate('/inventory')} />
          <ActionButton icon={<Users size={20} />} label="View Account" onClick={() => navigate('/accounts')} />
          <ActionButton icon={<FileText size={20} />} label="View Invoice/Record" onClick={() => navigate('/invoices')} />
        </div>
      </>
    );
  };

  const renderAddStockDetail = () => {
    const quantityBefore = (activity.newQuantity || 0) - (activity.quantity || 0);

    return (
      <>
        {/* Activity Info */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <div>
            <div className="text-sm text-gray-600 mb-1">Activity type</div>
            <div className="text-xl font-bold text-gray-900">Add Stock</div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">Date/time</div>
            <div className="font-medium text-gray-900">{activity.date} {activity.time}</div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">Recorded by</div>
            <div className="font-medium text-gray-900">{activity.recordedBy}</div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">Product</div>
            <div className="font-medium text-gray-900">{activity.product}</div>
          </div>
        </div>

        {/* Quantity Changes */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <h2 className="font-semibold text-gray-900">Quantity Changes</h2>

          <div className="flex justify-between">
            <span className="text-gray-700">Quantity change</span>
            <span className="font-semibold text-gray-900">+{activity.quantity} units</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-700">Quantity before</span>
            <span className="font-medium text-gray-900">{quantityBefore}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-700">Quantity after</span>
            <span className="font-medium text-gray-900">{activity.newQuantity}</span>
          </div>
        </div>

        {/* Vendor/Source */}
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
          <ActionButton icon={<Package size={20} />} label="View Product" onClick={() => navigate('/inventory')} />
          <ActionButton icon={<Plus size={20} />} label="Add More Stock" onClick={() => navigate('/add-stock-select')} />
        </div>
      </>
    );
  };

  const renderAdjustmentDetail = () => {
    return (
      <>
        {/* Activity Info */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <div>
            <div className="text-sm text-gray-600 mb-1">Activity type</div>
            <div className="text-xl font-bold text-gray-900">Count Adjustment</div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">Date/time</div>
            <div className="font-medium text-gray-900">{activity.date} {activity.time}</div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">Recorded by</div>
            <div className="font-medium text-gray-900">{activity.recordedBy}</div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="text-sm text-gray-600 mb-1">Product</div>
            <div className="font-medium text-gray-900">{activity.product}</div>
          </div>
        </div>

        {/* Adjustment Details */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <h2 className="font-semibold text-gray-900">Adjustment Details</h2>

          <div className="flex justify-between">
            <span className="text-gray-700">Previous quantity</span>
            <span className="font-medium text-gray-900">{activity.previousQuantity}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-700">Corrected quantity</span>
            <span className="font-medium text-gray-900">{activity.correctedQuantity}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-700">Difference</span>
            <span className="font-semibold text-gray-900">{activity.difference}</span>
          </div>
        </div>

        {/* Reason */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Reason</div>
          <div className="font-medium text-gray-900">{activity.reason}</div>
        </div>

        {/* Notes */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Notes</div>
          <div className="text-gray-900">—</div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <ActionButton icon={<Package size={20} />} label="View Product" onClick={() => navigate('/inventory')} />
          <ActionButton icon={<Edit size={20} />} label="Adjust Count" onClick={() => navigate('/adjust-count')} />
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/activity-history')}
            className="text-gray-600 active:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Activity Detail</h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        {activity.type === 'take-feed' && renderTakeFeedDetail()}
        {activity.type === 'add-stock' && renderAddStockDetail()}
        {activity.type === 'adjustment' && renderAdjustmentDetail()}
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

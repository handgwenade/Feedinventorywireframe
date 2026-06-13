import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Users, FileText, Plus, Edit } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';
import { formatCurrency } from '../utils/calculations';
import type { ActivityItem, ActivityRecordBadge } from '../services/activityService';

function getSelectedActivity(locationState: unknown): ActivityItem | null {
  return ((locationState as { activity?: ActivityItem } | null)?.activity ?? null);
}

function getActivityTypeLabel(activityType: string): string {
  const labels: Record<string, string> = {
    take_feed: 'Take Feed',
    add_stock: 'Add Stock',
    adjust_count: 'Count Adjustment',
    correction: 'Correction',
    invoice_created: 'Invoice Created',
    payment_recorded: 'Payment Recorded',
    account_created: 'Account Created',
    account_updated: 'Account Updated',
    account_archived: 'Account Archived',
    person_created: 'Person Created',
    person_updated: 'Person Updated',
    person_archived: 'Person Archived',
    product_created: 'Product Created',
    product_updated: 'Product Updated',
    product_archived: 'Product Archived',
    status_changed: 'Status Changed',
  };

  return labels[activityType] ?? activityType.replaceAll('_', ' ');
}

function formatActivityDateTime(value: string): string {
  return `${new Date(value).toLocaleDateString()} ${new Date(value).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })}`;
}

function formatMetadataValue(value: unknown): string {
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'string') return value;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value === null || value === undefined) return '—';
  return JSON.stringify(value);
}

export default function ActivityDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const activity = getSelectedActivity(location.state);

  if (!activity) {
    return (
      <div className="min-h-screen bg-[#f7f4ed] pb-24">
        <div className="app-header-safe">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Back to Activity History"
              title="Back to Activity History"
              onClick={() => navigate('/activity-history')}
              className="app-header-action rounded-2xl text-[#8b7a6f] active:bg-[#faf8f5] active:text-[#3d2f1f]"
            >
              <ArrowLeft size={24} aria-hidden="true" />
            </button>
            <h1 className="text-xl font-bold text-[#3d2f1f]">Activity Detail</h1>
          </div>
          <UserIcon />
        </div>

        <div className="p-4">
          <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 space-y-3 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <div className="text-sm text-[#8b7a6f]">
              Select an activity from Activity History to view details.
            </div>
            <button
              onClick={() => navigate('/activity-history')}
              className="w-full bg-white border border-[#ded2c0] text-[#3d2f1f] py-3 rounded-2xl font-semibold active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
            >
              Back to Activity History
            </button>
          </div>
        </div>

        <BottomNav />
      </div>
    );
  }

  const transaction = activity.inventoryTransaction;
  const quantityForValue = Math.abs(transaction?.quantityChange ?? 0);
  const unitPrice = transaction?.unitPrice ?? 0;
  const totalValue = quantityForValue * unitPrice;

  const renderActivityInfo = () => (
    <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 space-y-3 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
      <div className="flex justify-between items-start gap-3">
        <div>
          <div className="text-sm text-[#8b7a6f] mb-1">Activity type</div>
          <div className="text-xl font-bold text-[#3d2f1f]">{getActivityTypeLabel(activity.activityType)}</div>
        </div>
        {activity.recordBadge && <RecordTypeBadge recordBadge={activity.recordBadge} />}
      </div>

      <InfoRow label="Date/time" value={formatActivityDateTime(activity.createdAt)} />
      <InfoRow label="Recorded by" value={activity.actorUserName} />

      {activity.personName && (
        <InfoRow label="Taken by" value={activity.personName} />
      )}

      {(activity.accountName || activity.personName) && (
        <InfoRow
          label="Customer/account/person"
          value={activity.accountName ?? activity.personName}
        />
      )}

      {activity.productName && (
        <InfoRow label="Product" value={activity.productName} />
      )}
    </div>
  );

  const renderQuantityChanges = () => {
    if (!transaction) return null;

    return (
      <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 space-y-3 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
        <h2 className="font-semibold text-[#3d2f1f]">Quantity Changes</h2>

        <div className="flex justify-between gap-4">
          <span className="text-[#8b7a6f]">Quantity change</span>
          <span className="font-semibold text-[#3d2f1f]">
            {transaction.quantityChange > 0 ? '+' : ''}{transaction.quantityChange} units
          </span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-[#8b7a6f]">Quantity before</span>
          <span className="font-medium text-[#3d2f1f]">{transaction.quantityBefore}</span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-[#8b7a6f]">Quantity after</span>
          <span className="font-medium text-[#3d2f1f]">{transaction.quantityAfter}</span>
        </div>
      </div>
    );
  };

  const renderValue = () => {
    if (!unitPrice || quantityForValue === 0) return null;

    return (
      <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 space-y-3 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
        <h2 className="font-semibold text-[#3d2f1f]">Value</h2>

        <div className="flex justify-between gap-4">
          <span className="text-[#8b7a6f]">Unit price</span>
          <span className="font-medium text-[#3d2f1f]">{formatCurrency(unitPrice)}</span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-[#8b7a6f]">Total value</span>
          <span className="font-semibold text-[#3d2f1f]">{formatCurrency(totalValue)}</span>
        </div>
      </div>
    );
  };

  const renderMetadata = () => {
    const entries = Object.entries(activity.metadata ?? {});

    if (entries.length === 0) return null;

    return (
      <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 space-y-3 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
        <h2 className="font-semibold text-[#3d2f1f]">Metadata</h2>
        {entries.map(([key, value]) => (
          <InfoRow key={key} label={key} value={formatMetadataValue(value)} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f4ed] pb-24">
      <div className="app-header-safe">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Back to Activity History"
            title="Back to Activity History"
            onClick={() => navigate('/activity-history')}
            className="app-header-action rounded-2xl text-[#8b7a6f] active:bg-[#faf8f5] active:text-[#3d2f1f]"
          >
            <ArrowLeft size={24} aria-hidden="true" />
          </button>
          <h1 className="text-xl font-bold text-[#3d2f1f]">Activity Detail</h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        {renderActivityInfo()}
        {renderQuantityChanges()}
        {renderValue()}

        {activity.paymentAmount !== undefined && (
          <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <div className="text-sm text-[#8b7a6f] mb-1">Payment amount</div>
            <div className="font-medium text-[#3d2f1f]">{formatCurrency(activity.paymentAmount)}</div>
          </div>
        )}

        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div className="text-sm text-[#8b7a6f] mb-1">Related invoice/record</div>
          <div className="font-medium text-[#3d2f1f]">
            {activity.invoiceDisplayNumber ?? activity.invoiceRecordId ?? '—'}
          </div>
        </div>

        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div className="text-sm text-[#8b7a6f] mb-1">Notes</div>
          <div className="text-[#3d2f1f]">{transaction?.notes ?? activity.summary ?? '—'}</div>
        </div>

        {renderMetadata()}

        <div className="space-y-2">
          {activity.productId && (
            <ActionButton icon={<Package size={20} />} label="View Product" onClick={() => navigate('/inventory')} />
          )}
          {(activity.accountId || activity.personId) && (
            <ActionButton icon={<Users size={20} />} label="View Account" onClick={() => navigate('/accounts')} />
          )}
          {activity.invoiceRecordId && (
            <ActionButton icon={<FileText size={20} />} label="View Invoice/Record" onClick={() => navigate('/invoices')} />
          )}
          {activity.activityType === 'add_stock' && (
            <ActionButton icon={<Plus size={20} />} label="Add More Stock" onClick={() => navigate('/add-stock-select')} />
          )}
          {['adjust_count', 'correction'].includes(activity.activityType) && (
            <ActionButton icon={<Edit size={20} />} label="Adjust Count" onClick={() => navigate('/adjust-count')} />
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="border-t border-[#e8dfd1] pt-3">
      <div className="text-sm text-[#8b7a6f] mb-1">{label}</div>
      <div className="font-medium text-[#3d2f1f]">{value ?? '—'}</div>
    </div>
  );
}

function RecordTypeBadge({ recordBadge }: { recordBadge: ActivityRecordBadge }) {
  const labels: Record<ActivityRecordBadge, string> = {
    customer: 'Customer',
    k2: 'K2',
    family: 'Legacy Person Use',
  };

  return (
    <span className="inline-block px-3 py-1 bg-[#e9f0e5] text-[#5a7a4d] text-xs font-semibold rounded-full border border-[#cbd8c4]">
      {labels[recordBadge]}
    </span>
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
      className="w-full p-3 rounded-2xl flex items-center gap-3 font-semibold bg-white border border-[#ded2c0] text-[#3d2f1f] active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)] transition-colors"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

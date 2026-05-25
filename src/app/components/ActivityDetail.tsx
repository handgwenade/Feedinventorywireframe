import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Users, FileText, Plus, Edit } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';
import {
  accounts,
  activityLogs,
  inventoryTransactions,
  invoiceRecords,
  invoiceLineItems,
  people,
  products,
  users,
} from '../data/mockData';
import { calculateLineTotal, formatCurrency } from '../utils/calculations';
import type { ActivityLog, ActivityType } from '../types';

type RecordBadge = 'customer' | 'k2' | 'family';

function getSelectedActivity(locationState: unknown): ActivityLog {
  const state = locationState as { activity?: ActivityLog } | null;
  return state?.activity ?? activityLogs[0];
}

function getUserName(userId: string): string {
  return users.find((user) => user.id === userId)?.name ?? 'Unknown User';
}

function getProductName(productId?: string): string | undefined {
  if (!productId) return undefined;
  return products.find((product) => product.id === productId)?.name;
}

function getProductPrice(productId?: string): number | undefined {
  if (!productId) return undefined;
  return products.find((product) => product.id === productId)?.salePrice;
}

function getAccountName(accountId?: string): string | undefined {
  if (!accountId) return undefined;
  return accounts.find((account) => account.id === accountId)?.name;
}

function getPersonName(personId?: string): string | undefined {
  if (!personId) return undefined;
  return people.find((person) => person.id === personId)?.officialDisplayName;
}

function getInventoryTransaction(activity: ActivityLog) {
  if (!activity.inventoryTransactionId) return undefined;
  return inventoryTransactions.find((transaction) => transaction.id === activity.inventoryTransactionId);
}

function getRelatedRecordLabel(activity: ActivityLog): string {
  if (!activity.invoiceRecordId) return '—';

  const invoice = invoiceRecords.find((record) => record.id === activity.invoiceRecordId);
  return invoice?.displayNumber ?? activity.invoiceRecordId;
}

function getRecordBadge(activity: ActivityLog): RecordBadge | undefined {
  const invoice = invoiceRecords.find((record) => record.id === activity.invoiceRecordId);

  if (invoice?.recordType === 'customer_invoice') return 'customer';
  if (invoice?.recordType === 'k2_statement') return 'k2';
  if (invoice?.recordType === 'family_use') return 'family';

  const account = accounts.find((item) => item.id === activity.accountId);
  if (account?.accountType === 'customer') return 'customer';
  if (account?.accountType === 'k2') return 'k2';

  if (activity.personId) return 'family';

  return undefined;
}

function getActivityTypeLabel(activityType: ActivityType): string {
  const labels: Record<ActivityType, string> = {
    take_feed: 'Take Feed',
    add_stock: 'Add Stock',
    adjust_count: 'Count Adjustment',
    correction: 'Correction',
    invoice_created: 'Invoice Created',
    payment_recorded: 'Payment Recorded',
    account_created: 'Account Created',
    account_updated: 'Account Updated',
    person_created: 'Person Created',
    person_updated: 'Person Updated',
    status_changed: 'Status Changed',
  };

  return labels[activityType];
}

function formatActivityDateTime(value: string): string {
  return `${new Date(value).toLocaleDateString()} ${new Date(value).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })}`;
}

export default function ActivityDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const activity = getSelectedActivity(location.state);
  const transaction = getInventoryTransaction(activity);
  const recordBadge = getRecordBadge(activity);
  const productPrice = getProductPrice(activity.productId);
  const lineItem = invoiceLineItems.find((item) => item.invoiceRecordId === activity.invoiceRecordId);
  const quantityForValue = Math.abs(transaction?.quantityChange ?? lineItem?.quantity ?? 0);
  const unitPrice = lineItem?.unitPrice ?? productPrice ?? 0;
  const totalValue = calculateLineTotal(quantityForValue, unitPrice);

  const renderActivityInfo = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start gap-3">
        <div>
          <div className="text-sm text-gray-600 mb-1">Activity type</div>
          <div className="text-xl font-bold text-gray-900">{getActivityTypeLabel(activity.activityType)}</div>
        </div>
        {recordBadge && <RecordTypeBadge recordBadge={recordBadge} />}
      </div>

      <InfoRow label="Date/time" value={formatActivityDateTime(activity.createdAt)} />
      <InfoRow label="Recorded by" value={getUserName(activity.actorUserId)} />

      {getPersonName(activity.personId) && (
        <InfoRow label="Taken by" value={getPersonName(activity.personId)} />
      )}

      {(getAccountName(activity.accountId) || getPersonName(activity.personId)) && (
        <InfoRow
          label="Customer/account/person"
          value={getAccountName(activity.accountId) ?? getPersonName(activity.personId)}
        />
      )}

      {getProductName(activity.productId) && (
        <InfoRow label="Product" value={getProductName(activity.productId)} />
      )}
    </div>
  );

  const renderQuantityChanges = () => {
    if (!transaction) return null;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <h2 className="font-semibold text-gray-900">Quantity Changes</h2>

        <div className="flex justify-between gap-4">
          <span className="text-gray-700">Quantity change</span>
          <span className="font-semibold text-gray-900">
            {transaction.quantityChange > 0 ? '+' : ''}{transaction.quantityChange} units
          </span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-gray-700">Quantity before</span>
          <span className="font-medium text-gray-900">{transaction.quantityBefore}</span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-gray-700">Quantity after</span>
          <span className="font-medium text-gray-900">{transaction.quantityAfter}</span>
        </div>
      </div>
    );
  };

  const renderValue = () => {
    if (!unitPrice || quantityForValue === 0) return null;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <h2 className="font-semibold text-gray-900">Value</h2>

        <div className="flex justify-between gap-4">
          <span className="text-gray-700">Unit price</span>
          <span className="font-medium text-gray-900">{formatCurrency(unitPrice)}</span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-gray-700">Total value</span>
          <span className="font-semibold text-gray-900">{formatCurrency(totalValue)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
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
        {renderActivityInfo()}
        {renderQuantityChanges()}
        {renderValue()}

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Related invoice/record</div>
          <div className="font-medium text-gray-900">{getRelatedRecordLabel(activity)}</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Notes</div>
          <div className="text-gray-900">{transaction?.notes ?? activity.summary ?? '—'}</div>
        </div>

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
    <div className="border-t border-gray-200 pt-3">
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="font-medium text-gray-900">{value ?? '—'}</div>
    </div>
  );
}

function RecordTypeBadge({ recordBadge }: { recordBadge: RecordBadge }) {
  const labels: Record<RecordBadge, string> = {
    customer: 'Customer',
    k2: 'K2',
    family: 'Family',
  };

  return (
    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded border border-gray-300">
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
      className="w-full p-3 rounded-lg flex items-center gap-3 font-medium bg-white border border-gray-300 text-gray-900 active:bg-gray-50"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

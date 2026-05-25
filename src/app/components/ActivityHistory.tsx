import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, ChevronDown } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';
import {
  accounts,
  activityLogs,
  inventoryTransactions,
  invoiceRecords,
  payments,
  people,
  products,
  users,
} from '../data/mockData';
import { formatCurrency } from '../utils/calculations';
import type { ActivityLog, ActivityType } from '../types';

type FilterType = 'all' | 'taken' | 'added' | 'adjusted' | 'payments' | 'customer' | 'k2' | 'family';
type DateFilter = 'today' | 'this-week' | 'this-month' | 'custom';
type SortOption = 'newest' | 'oldest';
type RecordBadge = 'customer' | 'k2' | 'family';

function getUserName(userId: string): string {
  return users.find((user) => user.id === userId)?.name ?? 'Unknown User';
}

function getProductName(productId?: string): string | undefined {
  if (!productId) return undefined;
  return products.find((product) => product.id === productId)?.name;
}

function getAccountName(accountId?: string): string | undefined {
  if (!accountId) return undefined;
  return accounts.find((account) => account.id === accountId)?.name;
}

function getPersonName(personId?: string): string | undefined {
  if (!personId) return undefined;
  return people.find((person) => person.id === personId)?.officialDisplayName;
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

function getPaymentAmount(paymentId?: string): number | undefined {
  if (!paymentId) return undefined;
  return payments.find((payment) => payment.id === paymentId)?.amount;
}

function getInventoryTransaction(activity: ActivityLog) {
  if (!activity.inventoryTransactionId) return undefined;
  return inventoryTransactions.find((transaction) => transaction.id === activity.inventoryTransactionId);
}

function formatActivityDate(value: string): string {
  return new Date(value).toLocaleDateString();
}

function formatActivityTime(value: string): string {
  return new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function ActivityHistory() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('this-week');
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  const filteredActivities = activityLogs
    .filter((activity) => {
      const searchTarget = [
        activity.summary,
        getUserName(activity.actorUserId),
        getProductName(activity.productId),
        getAccountName(activity.accountId),
        getPersonName(activity.personId),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = searchTarget.includes(searchQuery.toLowerCase());
      const recordBadge = getRecordBadge(activity);

      if (activeFilter === 'all') return matchesSearch;
      if (activeFilter === 'taken') return matchesSearch && activity.activityType === 'take_feed';
      if (activeFilter === 'added') return matchesSearch && activity.activityType === 'add_stock';
      if (activeFilter === 'adjusted') {
        return matchesSearch && ['adjust_count', 'correction'].includes(activity.activityType);
      }
      if (activeFilter === 'payments') return matchesSearch && activity.activityType === 'payment_recorded';
      if (activeFilter === 'customer') return matchesSearch && recordBadge === 'customer';
      if (activeFilter === 'k2') return matchesSearch && recordBadge === 'k2';
      if (activeFilter === 'family') return matchesSearch && recordBadge === 'family';

      return matchesSearch;
    })
    .sort((a, b) => {
      const aDate = new Date(a.createdAt).getTime();
      const bDate = new Date(b.createdAt).getTime();
      return sortOption === 'newest' ? bDate - aDate : aDate - bDate;
    });

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 active:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Activity History</h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        <p className="text-sm text-gray-600">
          See who changed inventory, invoices, payments, and accounts.
        </p>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products, people, accounts..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        <div>
          <div className="text-xs font-medium text-gray-600 mb-2">Activity Type</div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <FilterChip label="All" active={activeFilter === 'all'} onClick={() => setActiveFilter('all')} />
            <FilterChip label="Taken" active={activeFilter === 'taken'} onClick={() => setActiveFilter('taken')} />
            <FilterChip label="Added" active={activeFilter === 'added'} onClick={() => setActiveFilter('added')} />
            <FilterChip label="Adjusted" active={activeFilter === 'adjusted'} onClick={() => setActiveFilter('adjusted')} />
            <FilterChip label="Payments" active={activeFilter === 'payments'} onClick={() => setActiveFilter('payments')} />
            <FilterChip label="Customer" active={activeFilter === 'customer'} onClick={() => setActiveFilter('customer')} />
            <FilterChip label="K2" active={activeFilter === 'k2'} onClick={() => setActiveFilter('k2')} />
            <FilterChip label="Family" active={activeFilter === 'family'} onClick={() => setActiveFilter('family')} />
          </div>
        </div>

        <div>
          <div className="text-xs font-medium text-gray-600 mb-2">Date Range</div>
          <div className="flex gap-2">
            <DateFilterChip label="Today" active={dateFilter === 'today'} onClick={() => setDateFilter('today')} />
            <DateFilterChip label="This Week" active={dateFilter === 'this-week'} onClick={() => setDateFilter('this-week')} />
            <DateFilterChip label="This Month" active={dateFilter === 'this-month'} onClick={() => setDateFilter('this-month')} />
            <DateFilterChip label="Custom" active={dateFilter === 'custom'} onClick={() => setDateFilter('custom')} />
          </div>
        </div>

        <button
          onClick={() => setSortOption(sortOption === 'newest' ? 'oldest' : 'newest')}
          className="w-full bg-white border border-gray-300 rounded-lg p-3 flex items-center justify-between text-gray-900 active:bg-gray-50"
        >
          <span className="font-medium">Sort: {sortOption === 'newest' ? 'Newest First' : 'Oldest First'}</span>
          <ChevronDown size={20} className="text-gray-500" />
        </button>

        <div className="space-y-3">
          {filteredActivities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onClick={() => navigate('/activity-detail', { state: { activity } })}
            />
          ))}
        </div>

        <div className="mt-6 space-y-3">
          <div className="p-3 bg-gray-50 border border-gray-300 rounded text-xs text-gray-600 leading-relaxed">
            <strong>Audit Trail:</strong> Activity History shows who recorded the action, what changed, when it changed, and the resulting quantity or balance.
          </div>
          <div className="p-3 bg-gray-50 border border-gray-300 rounded text-xs text-gray-600 leading-relaxed">
            <strong>Data Integrity:</strong> Activity records should not be casually editable. If a correction is needed, create a new correcting activity instead of rewriting history.
          </div>
          <div className="p-3 bg-gray-50 border border-gray-300 rounded text-xs text-gray-600 leading-relaxed">
            <strong>Included Activities:</strong> Take Feed, Add Stock, Count Adjustment, Payment Recorded, Invoice Created, K2 Statement, and Family Use records.
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
        active ? 'bg-gray-900 text-white' : 'bg-white border border-gray-300 text-gray-700 active:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );
}

function DateFilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
        active ? 'bg-gray-900 text-white' : 'bg-white border border-gray-300 text-gray-700 active:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );
}

function ActivityCard({ activity, onClick }: { activity: ActivityLog; onClick: () => void }) {
  const transaction = getInventoryTransaction(activity);
  const paymentAmount = getPaymentAmount(activity.paymentId);
  const recordBadge = getRecordBadge(activity);

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-4 active:bg-gray-50 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-semibold text-gray-900 mb-1">
            {getActivityTypeLabel(activity.activityType)}
            {recordBadge && <RecordTypeBadge recordBadge={recordBadge} />}
          </div>
          <div className="text-sm text-gray-600">
            {formatActivityDate(activity.createdAt)} {formatActivityTime(activity.createdAt)}
          </div>
        </div>
      </div>

      <div className="space-y-1 text-sm">
        <div className="text-gray-700">
          <span className="text-gray-600">Recorded by:</span> {getUserName(activity.actorUserId)}
        </div>

        {getPersonName(activity.personId) && (
          <div className="text-gray-700">
            <span className="text-gray-600">Taken by:</span> {getPersonName(activity.personId)}
          </div>
        )}

        {getAccountName(activity.accountId) && (
          <div className="text-gray-700">
            <span className="text-gray-600">Account:</span> {getAccountName(activity.accountId)}
          </div>
        )}

        {getProductName(activity.productId) && (
          <div className="text-gray-700">
            <span className="text-gray-600">Product:</span> {getProductName(activity.productId)}
          </div>
        )}

        {transaction && (
          <>
            <div className="text-gray-700">
              <span className="text-gray-600">Quantity:</span> {transaction.quantityChange > 0 ? '+' : ''}{transaction.quantityChange} units
            </div>
            <div className="text-gray-700">
              <span className="text-gray-600">New quantity:</span> {transaction.quantityAfter}
            </div>
          </>
        )}

        {paymentAmount !== undefined && (
          <div className="text-gray-700">
            <span className="text-gray-600">Payment amount:</span> {formatCurrency(paymentAmount)}
          </div>
        )}

        {activity.invoiceRecordId && (
          <div className="text-gray-700">
            <span className="text-gray-600">Related record:</span> {activity.invoiceRecordId}
          </div>
        )}
      </div>

      <button className="mt-3 w-full bg-white border border-gray-300 text-gray-900 py-2 rounded-lg font-medium text-sm active:bg-gray-50">
        View Detail
      </button>
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
    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded border border-gray-300 ml-2">
      {labels[recordBadge]}
    </span>
  );
}

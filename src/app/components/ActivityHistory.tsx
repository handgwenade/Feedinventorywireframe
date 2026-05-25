import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, ChevronDown } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';

type FilterType = 'all' | 'taken' | 'added' | 'adjusted' | 'payments' | 'customer' | 'k2' | 'family';
type DateFilter = 'today' | 'this-week' | 'this-month' | 'custom';
type SortOption = 'newest' | 'oldest';

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

const activities: Activity[] = [
  {
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
  },
  {
    id: '2',
    type: 'take-feed',
    recordType: 'k2',
    date: '5/18/2026',
    time: '2:15 PM',
    recordedBy: 'Bill Johnson',
    account: 'K2',
    product: 'Garlic Salt Blocks',
    quantity: -2,
    newQuantity: 247,
    invoiceRecord: 'K2 Statement'
  },
  {
    id: '3',
    type: 'take-feed',
    recordType: 'family',
    date: '5/17/2026',
    time: '8:30 AM',
    recordedBy: 'Tessie Geringer',
    takenBy: 'Bill Johnson',
    product: 'Garlic Salt Blocks',
    quantity: -3,
    newQuantity: 249,
    invoiceRecord: 'Family Use'
  },
  {
    id: '4',
    type: 'add-stock',
    date: '5/16/2026',
    time: '4:10 PM',
    recordedBy: 'Operator',
    product: 'Redmond Mineral Salt',
    quantity: 40,
    newQuantity: 200
  },
  {
    id: '5',
    type: 'payment',
    recordType: 'customer',
    date: '5/15/2026',
    time: '1:20 PM',
    recordedBy: 'Manager',
    account: 'Johnson Ranch',
    paymentMethod: 'Check',
    paymentAmount: 97.90
  },
  {
    id: '6',
    type: 'adjustment',
    date: '5/14/2026',
    time: '9:00 AM',
    recordedBy: 'Manager',
    product: 'RumenEdge Tubs',
    previousQuantity: 5,
    correctedQuantity: 4,
    difference: -1,
    reason: 'Physical count correction'
  }
];

export default function ActivityHistory() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('this-week');
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  const filteredActivities = activities.filter(activity => {
    const matchesSearch =
      activity.product?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.account?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.recordedBy?.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'taken') return matchesSearch && activity.type === 'take-feed';
    if (activeFilter === 'added') return matchesSearch && activity.type === 'add-stock';
    if (activeFilter === 'adjusted') return matchesSearch && activity.type === 'adjustment';
    if (activeFilter === 'payments') return matchesSearch && activity.type === 'payment';
    if (activeFilter === 'customer') return matchesSearch && activity.recordType === 'customer';
    if (activeFilter === 'k2') return matchesSearch && activity.recordType === 'k2';
    if (activeFilter === 'family') return matchesSearch && activity.recordType === 'family';

    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
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
        {/* Helper Text */}
        <p className="text-sm text-gray-600">
          See who changed inventory, invoices, payments, and accounts.
        </p>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products, people, accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        {/* Filter Chips */}
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

        {/* Date Filter */}
        <div>
          <div className="text-xs font-medium text-gray-600 mb-2">Date Range</div>
          <div className="flex gap-2">
            <DateFilterChip label="Today" active={dateFilter === 'today'} onClick={() => setDateFilter('today')} />
            <DateFilterChip label="This Week" active={dateFilter === 'this-week'} onClick={() => setDateFilter('this-week')} />
            <DateFilterChip label="This Month" active={dateFilter === 'this-month'} onClick={() => setDateFilter('this-month')} />
            <DateFilterChip label="Custom" active={dateFilter === 'custom'} onClick={() => setDateFilter('custom')} />
          </div>
        </div>

        {/* Sort Option */}
        <button
          className="w-full bg-white border border-gray-300 rounded-lg p-3 flex items-center justify-between text-gray-900 active:bg-gray-50"
        >
          <span className="font-medium">Sort: {sortOption === 'newest' ? 'Newest First' : 'Oldest First'}</span>
          <ChevronDown size={20} className="text-gray-500" />
        </button>

        {/* Activity List */}
        <div className="space-y-3">
          {filteredActivities.map(activity => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onClick={() => navigate('/activity-detail', { state: { activity } })}
            />
          ))}
        </div>

        {/* Annotations */}
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

function ActivityCard({ activity, onClick }: { activity: Activity; onClick: () => void }) {
  const getActivityTypeLabel = () => {
    if (activity.type === 'take-feed') return 'Take Feed';
    if (activity.type === 'add-stock') return 'Add Stock';
    if (activity.type === 'payment') return 'Payment Recorded';
    if (activity.type === 'adjustment') return 'Count Adjustment';
    return activity.type;
  };

  const getRecordTypeBadge = () => {
    if (!activity.recordType) return null;
    const labels = { customer: 'Customer', k2: 'K2', family: 'Family' };
    return (
      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded border border-gray-300 ml-2">
        {labels[activity.recordType]}
      </span>
    );
  };

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-4 active:bg-gray-50 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-semibold text-gray-900 mb-1">
            {getActivityTypeLabel()}
            {getRecordTypeBadge()}
          </div>
          <div className="text-sm text-gray-600">
            {activity.date} {activity.time}
          </div>
        </div>
      </div>

      <div className="space-y-1 text-sm">
        <div className="text-gray-700">
          <span className="text-gray-600">Recorded by:</span> {activity.recordedBy}
        </div>

        {activity.takenBy && (
          <div className="text-gray-700">
            <span className="text-gray-600">Taken by:</span> {activity.takenBy}
          </div>
        )}

        {activity.account && (
          <div className="text-gray-700">
            <span className="text-gray-600">{activity.recordType === 'customer' ? 'Customer' : 'Account'}:</span> {activity.account}
          </div>
        )}

        {activity.product && (
          <div className="text-gray-700">
            <span className="text-gray-600">Product:</span> {activity.product}
          </div>
        )}

        {activity.quantity !== undefined && (
          <div className="text-gray-700">
            <span className="text-gray-600">Quantity:</span> {activity.quantity > 0 ? '+' : ''}{activity.quantity} units
          </div>
        )}

        {activity.newQuantity !== undefined && (
          <div className="text-gray-700">
            <span className="text-gray-600">New quantity:</span> {activity.newQuantity}
          </div>
        )}

        {activity.previousQuantity !== undefined && activity.correctedQuantity !== undefined && (
          <>
            <div className="text-gray-700">
              <span className="text-gray-600">Previous:</span> {activity.previousQuantity} → <span className="text-gray-600">Corrected:</span> {activity.correctedQuantity}
            </div>
            <div className="text-gray-700">
              <span className="text-gray-600">Difference:</span> {activity.difference}
            </div>
          </>
        )}

        {activity.paymentAmount !== undefined && (
          <>
            <div className="text-gray-700">
              <span className="text-gray-600">Payment method:</span> {activity.paymentMethod}
            </div>
            <div className="text-gray-700">
              <span className="text-gray-600">Amount:</span> ${activity.paymentAmount.toFixed(2)}
            </div>
          </>
        )}

        {activity.invoiceRecord && (
          <div className="text-gray-700">
            <span className="text-gray-600">Record type:</span> {activity.invoiceRecord}
          </div>
        )}

        {activity.reason && (
          <div className="text-gray-700">
            <span className="text-gray-600">Reason:</span> {activity.reason}
          </div>
        )}
      </div>

      <button className="mt-3 w-full bg-white border border-gray-300 text-gray-900 py-2 rounded-lg font-medium text-sm active:bg-gray-50">
        View Detail
      </button>
    </div>
  );
}

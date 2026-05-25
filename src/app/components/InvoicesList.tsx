import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, DollarSign, AlertCircle, TrendingUp } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';

interface Invoice {
  id: string;
  number: string;
  account: string;
  type: 'customer' | 'k2' | 'family';
  status: 'unpaid' | 'paid' | 'partial' | 'written-off' | 'internal-transfer';
  date: string;
  total: number;
  balance: number;
}

const INVOICES: Invoice[] = [
  {
    id: '1',
    number: 'INV-1001',
    account: 'Anderson Cattle Co.',
    type: 'customer',
    status: 'unpaid',
    date: '2026-05-20',
    total: 171.50,
    balance: 171.50,
  },
  {
    id: '2',
    number: 'STMT-1002',
    account: 'K2',
    type: 'k2',
    status: 'internal-transfer',
    date: '2026-05-19',
    total: 34.30,
    balance: 0,
  },
  {
    id: '3',
    number: 'FAM-1003',
    account: 'Bill Johnson',
    type: 'family',
    status: 'unpaid',
    date: '2026-05-18',
    total: 51.45,
    balance: 51.45,
  },
  {
    id: '4',
    number: 'INV-1004',
    account: 'Johnson Ranch',
    type: 'customer',
    status: 'paid',
    date: '2026-05-17',
    total: 97.90,
    balance: 0,
  },
];

type FilterType = 'all' | 'unpaid' | 'paid' | 'customer' | 'k2' | 'family';
type SortType = 'date' | 'balance' | 'account';

export default function InvoicesList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('date');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const filteredInvoices = INVOICES.filter(invoice => {
    const matchesSearch =
      invoice.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.account.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'unpaid') return matchesSearch && (invoice.status === 'unpaid' || invoice.status === 'partial');
    if (activeFilter === 'paid') return matchesSearch && (invoice.status === 'paid' || invoice.status === 'written-off' || invoice.status === 'internal-transfer');
    return matchesSearch && invoice.type === activeFilter;
  }).sort((a, b) => {
    if (sortBy === 'date') return b.date.localeCompare(a.date);
    if (sortBy === 'balance') return b.balance - a.balance;
    if (sortBy === 'account') return a.account.localeCompare(b.account);
    return 0;
  });

  const unpaidTotal = INVOICES.filter(i => i.status === 'unpaid' || i.status === 'partial').reduce((sum, i) => sum + i.balance, 0);
  const overdue = INVOICES.filter(i => i.status === 'unpaid').length;
  const paidThisMonth = INVOICES.filter(i => i.status === 'paid').length;

  const handleViewInvoice = (invoice: Invoice) => {
    navigate('/invoice-detail', { state: { invoice } });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-semibold text-gray-900">Invoices</h1>
          <UserIcon />
        </div>
        <p className="text-sm text-gray-600">
          View invoices, statements, and payment status.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="grid grid-cols-3 gap-3">
          <SummaryCard
            icon={<DollarSign size={18} />}
            label="Unpaid Total"
            value={`$${unpaidTotal.toFixed(2)}`}
          />
          <SummaryCard
            icon={<AlertCircle size={18} />}
            label="Overdue"
            value={overdue.toString()}
          />
          <SummaryCard
            icon={<TrendingUp size={18} />}
            label="Paid This Month"
            value={paidThisMonth.toString()}
          />
        </div>
      </div>

      {/* Search */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search invoices or accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <FilterChip label="All" active={activeFilter === 'all'} onClick={() => setActiveFilter('all')} />
          <FilterChip label="Unpaid" active={activeFilter === 'unpaid'} onClick={() => setActiveFilter('unpaid')} />
          <FilterChip label="Paid" active={activeFilter === 'paid'} onClick={() => setActiveFilter('paid')} />
          <FilterChip label="Customer" active={activeFilter === 'customer'} onClick={() => setActiveFilter('customer')} />
          <FilterChip label="K2" active={activeFilter === 'k2'} onClick={() => setActiveFilter('k2')} />
          <FilterChip label="Family" active={activeFilter === 'family'} onClick={() => setActiveFilter('family')} />
        </div>
      </div>

      {/* Sort Option */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 active:bg-gray-50"
          >
            <span className="text-sm font-medium">
              Sort by: {sortBy === 'date' ? 'Date' : sortBy === 'balance' ? 'Balance' : 'Account'}
            </span>
            <ChevronDown size={16} />
          </button>

          {showSortMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-[200px]">
              <button
                onClick={() => { setSortBy('date'); setShowSortMenu(false); }}
                className="w-full text-left px-4 py-3 text-sm text-gray-900 hover:bg-gray-50 first:rounded-t-lg"
              >
                Sort by Date
              </button>
              <button
                onClick={() => { setSortBy('balance'); setShowSortMenu(false); }}
                className="w-full text-left px-4 py-3 text-sm text-gray-900 hover:bg-gray-50 border-t border-gray-200"
              >
                Sort by Balance
              </button>
              <button
                onClick={() => { setSortBy('account'); setShowSortMenu(false); }}
                className="w-full text-left px-4 py-3 text-sm text-gray-900 hover:bg-gray-50 border-t border-gray-200 last:rounded-b-lg"
              >
                Sort by Account
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Invoices */}
      <div className="p-4 space-y-3">
        {filteredInvoices.map((invoice) => (
          <button
            key={invoice.id}
            onClick={() => handleViewInvoice(invoice)}
            className="w-full bg-white border border-gray-200 rounded-lg p-4 text-left active:bg-gray-50"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-semibold text-gray-900 mb-1">{invoice.number}</div>
                <div className="text-sm text-gray-700">{invoice.account}</div>
              </div>
              <div className="flex gap-1">
                <TypeBadge type={invoice.type} />
                <StatusBadge status={invoice.status} />
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div className="text-sm text-gray-600">
                {new Date(invoice.date).toLocaleDateString()}
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Total: ${invoice.total.toFixed(2)}</div>
                {invoice.balance > 0 && (
                  <div className="text-sm font-semibold text-gray-900">Balance: ${invoice.balance.toFixed(2)}</div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
      <div className="flex items-center gap-1 mb-1 text-gray-600">
        {icon}
      </div>
      <div className="text-xs text-gray-600 mb-1">{label}</div>
      <div className="text-lg font-bold text-gray-900">{value}</div>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
        active ? 'bg-gray-900 text-white' : 'bg-white border border-gray-300 text-gray-700 active:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );
}

function TypeBadge({ type }: { type: 'customer' | 'k2' | 'family' }) {
  const labels = { customer: 'Customer', k2: 'K2', family: 'Family' };
  return (
    <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded border border-gray-300">
      {labels[type]}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const labels = {
    'unpaid': 'Unpaid',
    'paid': 'Paid',
    'partial': 'Partial',
    'written-off': 'Written Off',
    'internal-transfer': 'Internal Transfer',
  };
  return (
    <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded border border-gray-300">
      {labels[status as keyof typeof labels]}
    </span>
  );
}

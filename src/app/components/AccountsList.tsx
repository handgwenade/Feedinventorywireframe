import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';

type AccountType = 'all' | 'customers' | 'k2' | 'family' | 'unpaid';

interface Account {
  id: string;
  name: string;
  type: 'customer' | 'k2' | 'family';
  balance?: number;
  lastActivity: string;
  phone?: string;
  email?: string;
}

const accounts: Account[] = [
  {
    id: '1',
    name: 'Anderson Cattle Co.',
    type: 'customer',
    balance: 171.50,
    lastActivity: '5/19/2026',
    phone: '(555) 123-4567',
    email: 'anderson@example.com'
  },
  {
    id: '2',
    name: 'Johnson Ranch',
    type: 'customer',
    balance: 0,
    lastActivity: '5/17/2026',
    phone: '(555) 234-5678',
  },
  {
    id: '3',
    name: 'K2',
    type: 'k2',
    lastActivity: '5/18/2026',
  },
  {
    id: '4',
    name: 'Bill Johnson',
    type: 'family',
    lastActivity: '5/16/2026',
  },
  {
    id: '5',
    name: 'Tessie Geringer',
    type: 'family',
    lastActivity: '5/15/2026',
  },
];

export default function AccountsList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<AccountType>('all');

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'customers') return matchesSearch && account.type === 'customer';
    if (activeFilter === 'k2') return matchesSearch && account.type === 'k2';
    if (activeFilter === 'family') return matchesSearch && account.type === 'family';
    if (activeFilter === 'unpaid') return matchesSearch && account.balance && account.balance > 0;

    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Accounts</h1>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        {/* Helper Text */}
        <p className="text-sm text-gray-600">
          View customers, K2, and family/person records.
        </p>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search accounts or people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <FilterChip
            label="All"
            active={activeFilter === 'all'}
            onClick={() => setActiveFilter('all')}
          />
          <FilterChip
            label="Customers"
            active={activeFilter === 'customers'}
            onClick={() => setActiveFilter('customers')}
          />
          <FilterChip
            label="K2"
            active={activeFilter === 'k2'}
            onClick={() => setActiveFilter('k2')}
          />
          <FilterChip
            label="Family"
            active={activeFilter === 'family'}
            onClick={() => setActiveFilter('family')}
          />
          <FilterChip
            label="Unpaid"
            active={activeFilter === 'unpaid'}
            onClick={() => setActiveFilter('unpaid')}
          />
        </div>

        {/* Add Account/Person Button */}
        <button
          onClick={() => navigate('/add-account-person')}
          className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 active:bg-gray-800"
        >
          <Plus size={20} />
          Add Account / Person
        </button>

        {/* Accounts List */}
        <div className="space-y-3">
          {filteredAccounts.map(account => (
            <AccountCard
              key={account.id}
              account={account}
              onClick={() => navigate('/account-detail', { state: { account } })}
            />
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
        active
          ? 'bg-gray-900 text-white'
          : 'bg-white border border-gray-300 text-gray-700 active:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );
}

function AccountCard({
  account,
  onClick
}: {
  account: Account;
  onClick: () => void;
}) {
  const getTypeLabel = (type: string) => {
    if (type === 'customer') return 'Customer';
    if (type === 'k2') return 'K2';
    if (type === 'family') return 'Family';
    return type;
  };

  const getStatusLabel = (account: Account) => {
    if (account.type === 'customer') {
      if (account.balance && account.balance > 0) return `Balance Due $${account.balance.toFixed(2)}`;
      return 'Balance Due $0.00';
    }
    if (account.type === 'k2') return 'Internal Transfer';
    if (account.type === 'family') return 'Track Only';
    return '';
  };

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-4 active:bg-gray-50 cursor-pointer"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="font-semibold text-gray-900 mb-1">{account.name}</div>
          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded border border-gray-300">
            {getTypeLabel(account.type)}
          </span>
        </div>
      </div>

      {(account.phone || account.email) && (
        <div className="text-sm text-gray-600 mb-2">
          {account.phone && <div>{account.phone}</div>}
          {account.email && <div>{account.email}</div>}
        </div>
      )}

      <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-200">
        <span className="text-gray-600">{getStatusLabel(account)}</span>
        <span className="text-gray-500">Last activity {account.lastActivity}</span>
      </div>

      <button className="mt-3 w-full bg-white border border-gray-300 text-gray-900 py-2 rounded-lg font-medium text-sm active:bg-gray-50">
        View
      </button>
    </div>
  );
}

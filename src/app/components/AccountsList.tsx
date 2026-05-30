import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';
import { accountsService } from '../services/accountsService';
import { activityService } from '../services/activityService';
import { invoicesService } from '../services/invoicesService';
import { peopleService } from '../services/peopleService';
import { formatCurrency } from '../utils/calculations';
import type { ActivityItem } from '../services/activityService';
import type { InvoiceListItem } from '../services/invoicesService';
import type { Account, Person } from '../types';

type AccountFilter = 'all' | 'customers' | 'k2' | 'family' | 'unpaid';
type AccountListType = 'customer' | 'k2' | 'family';

interface AccountListItem {
  id: string;
  name: string;
  type: AccountListType;
  balance: number;
  lastActivity: string;
  phone?: string;
  email?: string;
  source: Account | Person;
}

function getRelatedInvoices(entityId: string, type: AccountListType, invoices: InvoiceListItem[]): InvoiceListItem[] {
  if (type === 'family') {
    return invoices.filter((record) => record.personId === entityId);
  }

  return invoices.filter((record) => record.accountId === entityId);
}

function getBalance(entityId: string, type: AccountListType, invoices: InvoiceListItem[]): number {
  return getRelatedInvoices(entityId, type, invoices)
    .reduce((total, record) => total + record.balanceDue, 0);
}

function getLastActivity(entityId: string, type: AccountListType, invoices: InvoiceListItem[], activities: ActivityItem[]): string {
  const relatedInvoices = getRelatedInvoices(entityId, type, invoices);
  const relatedInvoiceIds = new Set(relatedInvoices.map((record) => record.id));
  const activity = activities.find((item) => (
    item.accountId === entityId ||
    item.personId === entityId ||
    Boolean(item.invoiceRecordId && relatedInvoiceIds.has(item.invoiceRecordId))
  ));

  if (activity) return new Date(activity.createdAt).toLocaleDateString();

  const latestInvoice = relatedInvoices[0];

  if (latestInvoice) return new Date(latestInvoice.createdAt).toLocaleDateString();

  return 'No activity yet';
}

function buildAccountListItems(
  accounts: Account[],
  people: Person[],
  invoices: InvoiceListItem[],
  activities: ActivityItem[],
): AccountListItem[] {
  const accountItems: AccountListItem[] = accounts.map((account) => ({
    id: account.id,
    name: account.name,
    type: account.accountType === 'k2' ? 'k2' : 'customer',
    balance: getBalance(account.id, account.accountType === 'k2' ? 'k2' : 'customer', invoices),
    lastActivity: getLastActivity(account.id, account.accountType === 'k2' ? 'k2' : 'customer', invoices, activities),
    phone: account.phone,
    email: account.email,
    source: account,
  }));

  const personItems: AccountListItem[] = people.map((person) => ({
    id: person.id,
    name: person.officialDisplayName,
    type: 'family',
    balance: getBalance(person.id, 'family', invoices),
    lastActivity: getLastActivity(person.id, 'family', invoices, activities),
    phone: person.phone,
    source: person,
  }));

  return [...accountItems, ...personItems];
}

export default function AccountsList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<AccountFilter>('all');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAccountsAndPeople() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const [liveAccounts, livePeople, liveInvoices, liveActivities] = await Promise.all([
          accountsService.listActive(),
          peopleService.list(),
          invoicesService.list(),
          activityService.list(),
        ]);

        if (!isMounted) return;

        setAccounts(liveAccounts);
        setPeople(livePeople);
        setInvoices(liveInvoices);
        setActivities(liveActivities);
      } catch (error) {
        if (!isMounted) return;

        setAccounts([]);
        setPeople([]);
        setInvoices([]);
        setActivities([]);
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load accounts.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadAccountsAndPeople();

    return () => {
      isMounted = false;
    };
  }, []);

  const listItems = buildAccountListItems(accounts, people, invoices, activities);

  const filteredAccounts = listItems.filter((account) => {
    const matchesSearch = account.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'customers') return matchesSearch && account.type === 'customer';
    if (activeFilter === 'k2') return matchesSearch && account.type === 'k2';
    if (activeFilter === 'family') return matchesSearch && account.type === 'family';
    if (activeFilter === 'unpaid') return matchesSearch && account.balance > 0;

    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Accounts</h1>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        <p className="text-sm text-gray-600">
          View customers, K2, and people records.
        </p>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search accounts or people..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <FilterChip label="All" active={activeFilter === 'all'} onClick={() => setActiveFilter('all')} />
          <FilterChip label="Customers" active={activeFilter === 'customers'} onClick={() => setActiveFilter('customers')} />
          <FilterChip label="K2" active={activeFilter === 'k2'} onClick={() => setActiveFilter('k2')} />
          <FilterChip label="People" active={activeFilter === 'family'} onClick={() => setActiveFilter('family')} />
          <FilterChip label="Unpaid" active={activeFilter === 'unpaid'} onClick={() => setActiveFilter('unpaid')} />
        </div>

        <button
          onClick={() => navigate('/add-account-person')}
          className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 active:bg-gray-800"
        >
          <Plus size={20} />
          Add Account / Person
        </button>

        <div className="space-y-3">
          {isLoading && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
              Loading accounts...
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="bg-white border border-gray-300 rounded-lg p-4 text-sm text-gray-900">
              {errorMessage}
            </div>
          )}

          {!isLoading && !errorMessage && filteredAccounts.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
              No accounts found.
            </div>
          )}

          {!isLoading && !errorMessage && filteredAccounts.map((account) => (
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
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
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

function AccountCard({ account, onClick }: { account: AccountListItem; onClick: () => void }) {
  const getTypeLabel = (type: AccountListType) => {
    if (type === 'customer') return 'Customer';
    if (type === 'k2') return 'K2';
    if (type === 'family') return 'Person';
    return type;
  };

  const getStatusLabel = (accountItem: AccountListItem) => {
    if (accountItem.type === 'customer') return `Balance Due ${formatCurrency(accountItem.balance)}`;
    if (accountItem.type === 'k2') return accountItem.balance > 0 ? `Balance ${formatCurrency(accountItem.balance)}` : 'Internal Transfer';
    if (accountItem.type === 'family') return accountItem.balance > 0 ? `Balance ${formatCurrency(accountItem.balance)}` : 'Track Only';
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

      <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-200 gap-3">
        <span className="text-gray-600">{getStatusLabel(account)}</span>
        <span className="text-gray-500 text-right">Last activity {account.lastActivity}</span>
      </div>

      <button className="mt-3 w-full bg-white border border-gray-300 text-gray-900 py-2 rounded-lg font-medium text-sm active:bg-gray-50">
        View
      </button>
    </div>
  );
}

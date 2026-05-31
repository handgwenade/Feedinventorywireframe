import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';
import { accountsService } from '../services/accountsService';
import { activityService } from '../services/activityService';
import { invoicesService } from '../services/invoicesService';
import { formatCurrency } from '../utils/calculations';
import type { ActivityItem } from '../services/activityService';
import type { InvoiceListItem } from '../services/invoicesService';
import type { Account } from '../types';

type AccountFilter = 'all' | 'customers' | 'k2' | 'unpaid';
type AccountListType = 'customer' | 'k2';

interface AccountListItem {
  id: string;
  name: string;
  type: AccountListType;
  balance: number;
  lastActivity: string;
  phone?: string;
  email?: string;
  source: Account;
}

function getRelatedInvoices(entityId: string, type: AccountListType, invoices: InvoiceListItem[]): InvoiceListItem[] {
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
    Boolean(item.invoiceRecordId && relatedInvoiceIds.has(item.invoiceRecordId))
  ));

  if (activity) return new Date(activity.createdAt).toLocaleDateString();

  const latestInvoice = relatedInvoices[0];

  if (latestInvoice) return new Date(latestInvoice.createdAt).toLocaleDateString();

  return 'No activity yet';
}

function buildAccountListItems(
  accounts: Account[],
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

  return accountItems;
}

export default function AccountsList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<AccountFilter>('all');
  const [accounts, setAccounts] = useState<Account[]>([]);
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
        const [liveAccounts, liveInvoices, liveActivities] = await Promise.all([
          accountsService.listActive(),
          invoicesService.list(),
          activityService.list(),
        ]);

        if (!isMounted) return;

        setAccounts(liveAccounts);
        setInvoices(liveInvoices);
        setActivities(liveActivities);
      } catch (error) {
        if (!isMounted) return;

        setAccounts([]);
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

  const listItems = buildAccountListItems(accounts, invoices, activities);

  const filteredAccounts = listItems.filter((account) => {
    const matchesSearch = account.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'customers') return matchesSearch && account.type === 'customer';
    if (activeFilter === 'k2') return matchesSearch && account.type === 'k2';
    if (activeFilter === 'unpaid') return matchesSearch && account.balance > 0;

    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#f7f4ed] pb-24">
      <div className="bg-white border-b border-[#e8dfd1] p-4 flex items-center justify-between shadow-[0_1px_4px_rgba(61,47,31,0.06)]">
        <h1 className="text-xl font-bold text-[#3d2f1f]">Accounts</h1>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        <p className="text-sm text-[#8b7a6f]">
          View customer and K2 account records.
        </p>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b7a6f]" size={20} />
          <input
            type="text"
            placeholder="Search accounts..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-[#ded2c0] rounded-2xl text-[#3d2f1f] placeholder:text-[#8b7a6f] focus:outline-none focus:ring-2 focus:ring-[#5a7a4d] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <FilterChip label="All" active={activeFilter === 'all'} onClick={() => setActiveFilter('all')} />
          <FilterChip label="Customers" active={activeFilter === 'customers'} onClick={() => setActiveFilter('customers')} />
          <FilterChip label="K2" active={activeFilter === 'k2'} onClick={() => setActiveFilter('k2')} />
          <FilterChip label="Unpaid" active={activeFilter === 'unpaid'} onClick={() => setActiveFilter('unpaid')} />
        </div>

        <button
          onClick={() => navigate('/add-account-person')}
          className="w-full bg-[#5a7a4d] text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 active:bg-[#4a6a3d] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
        >
          <Plus size={20} />
          Add Account
        </button>

        <div className="space-y-3">
          {isLoading && (
            <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 text-sm text-[#8b7a6f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
              Loading accounts...
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="bg-white border border-[#b7791f] rounded-2xl p-4 text-sm text-[#3d2f1f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
              {errorMessage}
            </div>
          )}

          {!isLoading && !errorMessage && filteredAccounts.length === 0 && (
            <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 text-sm text-[#8b7a6f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
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
      className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
        active ? 'bg-[#5a7a4d] text-white shadow-[0_2px_8px_rgba(61,47,31,0.12)]' : 'bg-white border border-[#ded2c0] text-[#3d2f1f] active:bg-[#faf8f5]'
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
    return type;
  };

  const getStatusLabel = (accountItem: AccountListItem) => {
    if (accountItem.type === 'customer') return `Balance Due ${formatCurrency(accountItem.balance)}`;
    if (accountItem.type === 'k2') return accountItem.balance > 0 ? `Balance ${formatCurrency(accountItem.balance)}` : 'Internal Transfer';
    return '';
  };

  return (
    <div
      onClick={onClick}
      className="bg-white border border-[#ded2c0] rounded-2xl p-4 active:bg-[#faf8f5] cursor-pointer shadow-[0_2px_8px_rgba(61,47,31,0.08)] transition-colors"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="font-semibold text-[#3d2f1f] mb-1">{account.name}</div>
          <span className="inline-block px-3 py-1 bg-[#e9f0e5] text-[#5a7a4d] text-xs font-semibold rounded-full border border-[#cbd8c4]">
            {getTypeLabel(account.type)}
          </span>
        </div>
      </div>

      {(account.phone || account.email) && (
        <div className="text-sm text-[#8b7a6f] mb-2">
          {account.phone && <div>{account.phone}</div>}
          {account.email && <div>{account.email}</div>}
        </div>
      )}

      <div className="flex justify-between items-center text-sm pt-2 border-t border-[#e8dfd1] gap-3">
        <span className="text-[#8b7a6f]">{getStatusLabel(account)}</span>
        <span className="text-[#8b7a6f] text-right">Last activity {account.lastActivity}</span>
      </div>

      <button className="mt-3 w-full bg-white border border-[#ded2c0] text-[#3d2f1f] py-2 rounded-2xl font-semibold text-sm active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
        View
      </button>
    </div>
  );
}

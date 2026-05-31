import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, DollarSign, AlertCircle, TrendingUp } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';
import useRefreshOnFocus from '../hooks/useRefreshOnFocus';
import { invoicesService } from '../services/invoicesService';
import { formatCurrency } from '../utils/calculations';
import type { InvoiceListItem, InvoiceListType } from '../services/invoicesService';

type FilterType = 'all' | 'unpaid' | 'paid' | 'customer' | 'k2';
type SortType = 'date' | 'balance' | 'account';

export default function InvoicesList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('date');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadInvoices() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const liveInvoices = await invoicesService.list();
      setInvoices(liveInvoices);
    } catch (error) {
      setInvoices([]);
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load invoices.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInvoicesOnMount() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const liveInvoices = await invoicesService.list();

        if (!isMounted) return;

        setInvoices(liveInvoices);
      } catch (error) {
        if (!isMounted) return;

        setInvoices([]);
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load invoices.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInvoicesOnMount();

    return () => {
      isMounted = false;
    };
  }, []);

  useRefreshOnFocus(loadInvoices, isLoading);

  const filteredInvoices = invoices
    .filter((invoice) => {
      const matchesSearch =
        invoice.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.displayNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.productsSummary.toLowerCase().includes(searchQuery.toLowerCase());

      if (activeFilter === 'all') return matchesSearch;
      if (activeFilter === 'unpaid') {
        return matchesSearch && invoice.balanceDue > 0 && invoice.status !== 'paid';
      }
      if (activeFilter === 'paid') return matchesSearch && invoice.status === 'paid';
      return matchesSearch && invoice.type === activeFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
      if (sortBy === 'balance') return b.balanceDue - a.balanceDue;
      if (sortBy === 'account') return a.accountName.localeCompare(b.accountName);
      return 0;
  });

  const unpaidTotal = invoices.reduce((sum, invoice) => sum + invoice.balanceDue, 0);
  const overdue = invoices.filter((invoice) => invoice.status === 'overdue').length;
  const paidThisMonth = invoices.filter((invoice) => invoice.status === 'paid').length;

  const handleViewInvoice = (invoice: InvoiceListItem) => {
    navigate('/invoice-detail', { state: { invoice } });
  };

  return (
    <div className="min-h-screen bg-[#f7f4ed] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-[#e8dfd1] p-4 shadow-[0_1px_4px_rgba(61,47,31,0.06)]">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-[#3d2f1f]">Invoices</h1>
          <UserIcon />
        </div>
        <p className="text-sm text-[#8b7a6f]">
          View invoices, statements, and payment status.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="p-4 bg-[#f7f4ed]">
        <div className="grid grid-cols-3 gap-3">
          <SummaryCard
            icon={<DollarSign size={18} />}
            label="Unpaid Total"
            value={formatCurrency(unpaidTotal)}
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
      <div className="px-4 pb-3 bg-[#f7f4ed]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b7a6f]" size={20} />
          <input
            type="text"
            placeholder="Search invoices or accounts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-[#ded2c0] rounded-2xl text-[#3d2f1f] placeholder:text-[#8b7a6f] focus:outline-none focus:ring-2 focus:ring-[#5a7a4d] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="px-4 pb-3 bg-[#f7f4ed]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <FilterChip label="All" active={activeFilter === 'all'} onClick={() => setActiveFilter('all')} />
            <FilterChip label="Unpaid" active={activeFilter === 'unpaid'} onClick={() => setActiveFilter('unpaid')} />
            <FilterChip label="Paid" active={activeFilter === 'paid'} onClick={() => setActiveFilter('paid')} />
            <FilterChip label="Customer" active={activeFilter === 'customer'} onClick={() => setActiveFilter('customer')} />
            <FilterChip label="K2" active={activeFilter === 'k2'} onClick={() => setActiveFilter('k2')} />
          </div>
          <button
            onClick={loadInvoices}
            disabled={isLoading}
            className="self-start px-4 py-2 bg-white border border-[#ded2c0] text-[#3d2f1f] rounded-2xl text-sm font-semibold active:bg-[#faf8f5] disabled:opacity-50 shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Sort Option */}
      <div className="px-4 pb-4 bg-[#f7f4ed]">
        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#ded2c0] rounded-2xl text-[#3d2f1f] active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
          >
            <span className="text-sm font-medium">
              Sort by: {sortBy === 'date' ? 'Date' : sortBy === 'balance' ? 'Balance' : 'Account'}
            </span>
            <ChevronDown size={16} />
          </button>

          {showSortMenu && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-[#ded2c0] rounded-2xl shadow-[0_4px_14px_rgba(61,47,31,0.16)] z-10 min-w-[200px] overflow-hidden">
              <button
                onClick={() => { setSortBy('date'); setShowSortMenu(false); }}
                className="w-full text-left px-4 py-3 text-sm text-[#3d2f1f] hover:bg-[#faf8f5] first:rounded-t-lg"
              >
                Sort by Date
              </button>
              <button
                onClick={() => { setSortBy('balance'); setShowSortMenu(false); }}
                className="w-full text-left px-4 py-3 text-sm text-[#3d2f1f] hover:bg-[#faf8f5] border-t border-[#e8dfd1]"
              >
                Sort by Balance
              </button>
              <button
                onClick={() => { setSortBy('account'); setShowSortMenu(false); }}
                className="w-full text-left px-4 py-3 text-sm text-[#3d2f1f] hover:bg-[#faf8f5] border-t border-[#e8dfd1] last:rounded-b-lg"
              >
                Sort by Account
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Invoices */}
      <div className="p-4 space-y-3">
        {isLoading && (
          <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 text-sm text-[#8b7a6f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            Loading invoices...
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="bg-white border border-[#b7791f] rounded-2xl p-4 text-sm text-[#3d2f1f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && filteredInvoices.length === 0 && (
          <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 text-sm text-[#8b7a6f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            No invoices found.
          </div>
        )}

        {!isLoading && !errorMessage && filteredInvoices.map((invoice) => (
          <button
            key={invoice.id}
            onClick={() => handleViewInvoice(invoice)}
            className="w-full bg-white border border-[#ded2c0] rounded-2xl p-4 text-left active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)] transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-semibold text-[#3d2f1f] mb-1">{invoice.displayNumber}</div>
                <div className="text-sm text-[#3d2f1f]">{invoice.accountName}</div>
                <div className="text-xs text-[#8b7a6f] mt-1">{invoice.productsSummary}</div>
              </div>
              <div className="flex gap-1 flex-wrap justify-end">
                <TypeBadge type={invoice.type} />
                <StatusBadge status={invoice.status} />
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div className="text-sm text-[#8b7a6f]">
                {new Date(invoice.issueDate).toLocaleDateString()}
              </div>
              <div className="text-right">
                <div className="text-sm text-[#8b7a6f]">Total: {formatCurrency(invoice.total)}</div>
                {invoice.balanceDue > 0 && (
                  <div className="text-sm font-bold text-[#3d2f1f]">
                    Balance: {formatCurrency(invoice.balanceDue)}
                  </div>
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
    <div className="bg-white border border-[#ded2c0] p-3 rounded-2xl shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
      <div className="flex items-center gap-1 mb-1 text-[#8b7a6f]">
        {icon}
      </div>
      <div className="text-xs text-[#8b7a6f] mb-1">{label}</div>
      <div className="text-lg font-bold text-[#3d2f1f]">{value}</div>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
        active ? 'bg-[#5a7a4d] text-white shadow-[0_2px_8px_rgba(61,47,31,0.12)]' : 'bg-white border border-[#ded2c0] text-[#3d2f1f] active:bg-[#faf8f5]'
      }`}
    >
      {label}
    </button>
  );
}

function TypeBadge({ type }: { type: InvoiceListType }) {
  const labels = { customer: 'Customer', k2: 'K2', family: 'Legacy Person Use' };
  return (
    <span className="inline-block px-3 py-1 bg-[#e9f0e5] text-[#5a7a4d] text-xs font-semibold rounded-full border border-[#cbd8c4]">
      {labels[type]}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    unpaid: 'Unpaid',
    paid: 'Paid',
    partial: 'Partial',
    overdue: 'Overdue',
    void: 'Void',
    written_off: 'Written Off',
    internal_transfer: 'Internal Transfer',
    internal: 'Internal',
    track_only: 'Track Only',
    needs_payment: 'Needs Payment',
  };

  return (
    <span className="inline-block px-3 py-1 bg-[#fff4d8] text-[#8b5a1f] text-xs font-semibold rounded-full border border-[#d4a574]">
      {labels[status] ?? status}
    </span>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, FileText, DollarSign } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';
import { invoicesService } from '../services/invoicesService';
import { formatCurrency } from '../utils/calculations';
import type { InvoiceListItem } from '../services/invoicesService';

type FilterType = 'customers' | 'k2' | 'family' | 'all';
type UnpaidType = 'customer' | 'k2' | 'family';

function getRecordType(record: InvoiceListItem): UnpaidType {
  if (record.recordType === 'customer_invoice') return 'customer';
  if (record.recordType === 'k2_statement') return 'k2';
  return 'family';
}

function getStatusLabel(status: string): string {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function ReportUnpaidInvoices() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadInvoices() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const liveInvoices = await invoicesService.list();

        if (isMounted) {
          setInvoices(liveInvoices);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Unable to load unpaid invoices.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInvoices();

    return () => {
      isMounted = false;
    };
  }, []);

  const unpaidData = invoices.filter((record) => record.balanceDue > 0);
  const totalUnpaid = unpaidData.reduce((sum, record) => sum + record.balanceDue, 0);
  const overdue = unpaidData.filter((record) => record.status === 'overdue').length;
  const openRecords = unpaidData.length;

  const filteredData = unpaidData.filter((record) => {
    const recordType = getRecordType(record);

    if (activeFilter === 'all') return true;
    if (activeFilter === 'customers') return recordType === 'customer';
    if (activeFilter === 'k2') return recordType === 'k2';
    if (activeFilter === 'family') return recordType === 'family';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f7f4ed] pb-24">
      <div className="app-header-safe">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/reports')}
            className="app-header-action rounded-2xl text-[#8b7a6f] active:bg-[#faf8f5] active:text-[#3d2f1f]"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-[#3d2f1f]">Unpaid Invoices</h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <SummaryCard label="Total Unpaid" value={formatCurrency(totalUnpaid)} />
          <SummaryCard label="Overdue" value={overdue.toString()} />
          <SummaryCard label="Open Records" value={openRecords.toString()} />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <FilterChip label="All" active={activeFilter === 'all'} onClick={() => setActiveFilter('all')} />
          <FilterChip label="Customers" active={activeFilter === 'customers'} onClick={() => setActiveFilter('customers')} />
          <FilterChip label="K2" active={activeFilter === 'k2'} onClick={() => setActiveFilter('k2')} />
          <FilterChip label="People" active={activeFilter === 'family'} onClick={() => setActiveFilter('family')} />
        </div>

        <div className="space-y-3">
          {isLoading && (
            <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 text-sm text-[#8b7a6f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
              Loading unpaid invoices...
            </div>
          )}

          {errorMessage && (
            <div className="bg-white border border-[#b7791f] rounded-2xl p-4 text-sm text-[#3d2f1f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
              {errorMessage}
            </div>
          )}

          {!isLoading && !errorMessage && filteredData.length === 0 && (
            <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 text-sm text-[#8b7a6f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
              No unpaid invoices found.
            </div>
          )}

          {filteredData.map((record) => (
            <UnpaidRecordRow key={record.id} record={record} navigate={navigate} />
          ))}
        </div>

        <div className="space-y-2">
          <ActionButton icon={<Download size={20} />} label="Export (Not Ready)" onClick={() => {}} disabled />
          <ActionButton icon={<Printer size={20} />} label="Print (Not Ready)" onClick={() => {}} disabled />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-[#ded2c0] rounded-2xl p-3 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
      <div className="text-xs text-[#8b7a6f] mb-1">{label}</div>
      <div className="font-bold text-[#3d2f1f] text-sm">{value}</div>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
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

function UnpaidRecordRow({
  record,
  navigate,
}: {
  record: InvoiceListItem;
  navigate: (route: string, options?: { state?: unknown }) => void;
}) {
  const recordType = getRecordType(record);
  const amountPaid = record.amountPaid;

  const getTypeLabel = () => {
    if (recordType === 'customer') return 'Customer';
    if (recordType === 'k2') return 'K2';
    if (recordType === 'family') return 'Legacy Person Use';
    return recordType;
  };

  return (
    <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
      <div className="flex justify-between items-start mb-2 gap-3">
        <div>
          <div className="font-semibold text-[#3d2f1f] mb-1">{record.accountName}</div>
          <div className="text-sm text-[#8b7a6f]">{new Date(record.issueDate).toLocaleDateString()}</div>
        </div>
        <span className="text-xs px-3 py-1 rounded-full border bg-[#e9f0e5] border-[#cbd8c4] text-[#5a7a4d] font-semibold">
          {getTypeLabel()}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <div>
          <div className="text-[#8b7a6f] text-xs">Total</div>
          <div className="font-medium text-[#3d2f1f]">{formatCurrency(record.total)}</div>
        </div>
        <div>
          <div className="text-[#8b7a6f] text-xs">Amount Paid</div>
          <div className="font-medium text-[#3d2f1f]">{formatCurrency(amountPaid)}</div>
        </div>
      </div>
      <div className="mb-3 p-3 bg-[#fff4d8] border border-[#d4a574] text-[#3d2f1f] rounded-2xl flex justify-between items-center">
        <span className="text-sm font-medium">Balance Due</span>
        <span className="font-bold">{formatCurrency(record.balanceDue)}</span>
      </div>
      <div className="text-xs text-[#8b7a6f] mb-3">Status: {getStatusLabel(record.status)}</div>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => navigate('/invoice-detail', { state: { invoice: record } })}
          className="bg-white border border-[#ded2c0] text-[#3d2f1f] py-2 rounded-2xl font-semibold text-sm flex items-center justify-center gap-1 active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
        >
          <FileText size={16} />
          View
        </button>
        {record.recordType === 'customer_invoice' ? (
          <button
            onClick={() => navigate('/record-payment', { state: { invoice: record } })}
            className="bg-[#5a7a4d] text-white py-2 rounded-2xl font-semibold text-sm flex items-center justify-center gap-1 active:bg-[#4a6a3d] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
          >
            <DollarSign size={16} />
            Record Payment
          </button>
        ) : (
          <button
            disabled
            className="bg-[#f7f4ed] border border-[#ded2c0] text-[#8b7a6f] py-2 rounded-2xl font-semibold text-sm flex items-center justify-center gap-1 shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
          >
            <DollarSign size={16} />
            Not Ready
          </button>
        )}
      </div>
    </div>
  );
}

function ActionButton({ icon, label, onClick, disabled = false }: { icon: React.ReactNode; label: string; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`w-full p-3 rounded-2xl flex items-center gap-3 font-semibold bg-white border border-[#ded2c0] text-[#3d2f1f] active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)] transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

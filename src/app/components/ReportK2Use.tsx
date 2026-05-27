import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, FileText } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';
import { invoicesService } from '../services/invoicesService';
import { formatCurrency } from '../utils/calculations';
import type { InvoiceListItem } from '../services/invoicesService';

type DateFilter = 'this-month' | 'last-month' | 'custom';

function getStatusLabel(status: string): string {
  return status
    .split(/[_-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function ReportK2Use() {
  const navigate = useNavigate();
  const [dateFilter, setDateFilter] = useState<DateFilter>('this-month');
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

        if (!isMounted) return;

        setInvoices(liveInvoices);
      } catch (error) {
        if (!isMounted) return;

        setErrorMessage(error instanceof Error ? error.message : 'Unable to load K2 account use.');
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

  const k2Data = invoices.filter((record) => record.recordType === 'k2_statement');
  const totalValue = k2Data.reduce((sum, record) => sum + record.total, 0);
  const totalUnits = k2Data.reduce((sum, record) => sum + record.totalQuantity, 0);
  const lastStatement = k2Data[0]?.issueDate
    ? new Date(k2Data[0].issueDate).toLocaleDateString()
    : '—';

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/reports')}
            className="text-gray-600 active:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">K2 Account Use</h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        {/* Helper Text */}
        <p className="text-sm text-gray-600">
          Feed/products recorded to K2, separate from customer sales.
        </p>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <SummaryCard label="Total Value Used" value={formatCurrency(totalValue)} />
          <SummaryCard label="Total Units" value={totalUnits.toString()} />
          <SummaryCard label="Last Statement" value={lastStatement} />
        </div>

        {/* Date Filter */}
        <div>
          <div className="text-xs font-medium text-gray-600 mb-2">Date Range</div>
          <div className="flex gap-2">
            <DateFilterChip label="This Month" active={dateFilter === 'this-month'} onClick={() => setDateFilter('this-month')} />
            <DateFilterChip label="Last Month" active={dateFilter === 'last-month'} onClick={() => setDateFilter('last-month')} />
            <DateFilterChip label="Custom" active={dateFilter === 'custom'} onClick={() => setDateFilter('custom')} />
          </div>
        </div>

        {/* K2 Records List */}
        <div className="space-y-3">
          {isLoading && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
              Loading K2 account use...
            </div>
          )}

          {errorMessage && (
            <div className="bg-white border border-gray-300 rounded-lg p-4 text-sm text-gray-900">
              {errorMessage}
            </div>
          )}

          {!isLoading && !errorMessage && k2Data.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
              No K2 statements found.
            </div>
          )}

          {!isLoading && !errorMessage && k2Data.map((record) => (
            <K2RecordRow key={record.id} record={record} navigate={navigate} />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <ActionButton icon={<Download size={20} />} label="Export" onClick={() => {}} />
          <ActionButton icon={<Printer size={20} />} label="Print" onClick={() => {}} />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3">
      <div className="text-xs text-gray-600 mb-1">{label}</div>
      <div className="font-semibold text-gray-900 text-sm">{value}</div>
    </div>
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

function K2RecordRow({
  record,
  navigate,
}: {
  record: InvoiceListItem;
  navigate: (route: string, options?: { state?: unknown }) => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-2 gap-3">
        <div className="text-sm text-gray-600">{new Date(record.issueDate).toLocaleDateString()}</div>
        <span className="text-xs px-2 py-1 rounded border bg-gray-100 border-gray-300 text-gray-700">
          {getStatusLabel(record.status)}
        </span>
      </div>
      <div className="font-semibold text-gray-900 mb-2">{record.productsSummary}</div>
      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <div>
          <div className="text-gray-600 text-xs">Quantity</div>
          <div className="font-medium text-gray-900">{record.totalQuantity} units</div>
        </div>
        <div>
          <div className="text-gray-600 text-xs">Value</div>
          <div className="font-medium text-gray-900">{formatCurrency(record.total)}</div>
        </div>
      </div>
      <button
        onClick={() => navigate('/invoice-detail', { state: { invoice: record } })}
        className="w-full bg-white border border-gray-300 text-gray-900 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 active:bg-gray-50"
      >
        <FileText size={16} />
        View Statement
      </button>
    </div>
  );
}

function ActionButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
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

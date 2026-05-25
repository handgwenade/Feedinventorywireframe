import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, FileText } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';

type DateFilter = 'this-month' | 'last-month' | 'custom';

interface K2Record {
  id: string;
  date: string;
  product: string;
  quantity: number;
  value: number;
  status: string;
}

const k2Data: K2Record[] = [
  {
    id: '1',
    date: '5/18/2026',
    product: 'Garlic Salt Blocks',
    quantity: 2,
    value: 34.30,
    status: 'Internal Transfer'
  }
];

export default function ReportK2Use() {
  const navigate = useNavigate();
  const [dateFilter, setDateFilter] = useState<DateFilter>('this-month');

  const totalValue = k2Data.reduce((sum, record) => sum + record.value, 0);
  const totalUnits = k2Data.reduce((sum, record) => sum + record.quantity, 0);
  const lastStatement = '5/18/2026';

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
          <SummaryCard label="Total Value Used" value={`$${totalValue.toFixed(2)}`} />
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
          {k2Data.map(record => (
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

function K2RecordRow({ record, navigate }: { record: K2Record; navigate: any }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <div className="text-sm text-gray-600">{record.date}</div>
        <span className="text-xs px-2 py-1 rounded border bg-gray-100 border-gray-300 text-gray-700">
          {record.status}
        </span>
      </div>
      <div className="font-semibold text-gray-900 mb-2">{record.product}</div>
      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <div>
          <div className="text-gray-600 text-xs">Quantity</div>
          <div className="font-medium text-gray-900">{record.quantity} units</div>
        </div>
        <div>
          <div className="text-gray-600 text-xs">Value</div>
          <div className="font-medium text-gray-900">${record.value.toFixed(2)}</div>
        </div>
      </div>
      <button
        onClick={() => navigate('/invoices')}
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

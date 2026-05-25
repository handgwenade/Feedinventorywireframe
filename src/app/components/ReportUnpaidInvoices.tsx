import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, FileText, DollarSign } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';

type FilterType = 'customers' | 'k2' | 'family' | 'all';

interface UnpaidRecord {
  id: string;
  account: string;
  type: 'customer' | 'k2' | 'family';
  date: string;
  total: number;
  amountPaid: number;
  balanceDue: number;
  status: string;
}

const unpaidData: UnpaidRecord[] = [
  {
    id: '1',
    account: 'Anderson Cattle Co.',
    type: 'customer',
    date: '5/19/2026',
    total: 171.50,
    amountPaid: 0,
    balanceDue: 171.50,
    status: 'Unpaid'
  },
  {
    id: '2',
    account: 'Bill Johnson',
    type: 'family',
    date: '5/17/2026',
    total: 51.45,
    amountPaid: 0,
    balanceDue: 51.45,
    status: 'Needs Payment'
  }
];

export default function ReportUnpaidInvoices() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const totalUnpaid = unpaidData.reduce((sum, record) => sum + record.balanceDue, 0);
  const overdue = 1;
  const openRecords = unpaidData.length;

  const filteredData = unpaidData.filter(record => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'customers') return record.type === 'customer';
    if (activeFilter === 'k2') return record.type === 'k2';
    if (activeFilter === 'family') return record.type === 'family';
    return true;
  });

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
          <h1 className="text-xl font-semibold text-gray-900">Unpaid Invoices</h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <SummaryCard label="Total Unpaid" value={`$${totalUnpaid.toFixed(2)}`} />
          <SummaryCard label="Overdue" value={overdue.toString()} />
          <SummaryCard label="Open Records" value={openRecords.toString()} />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <FilterChip label="All" active={activeFilter === 'all'} onClick={() => setActiveFilter('all')} />
          <FilterChip label="Customers" active={activeFilter === 'customers'} onClick={() => setActiveFilter('customers')} />
          <FilterChip label="K2" active={activeFilter === 'k2'} onClick={() => setActiveFilter('k2')} />
          <FilterChip label="Family" active={activeFilter === 'family'} onClick={() => setActiveFilter('family')} />
        </div>

        {/* Unpaid Records List */}
        <div className="space-y-3">
          {filteredData.map(record => (
            <UnpaidRecordRow key={record.id} record={record} navigate={navigate} />
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

function UnpaidRecordRow({ record, navigate }: { record: UnpaidRecord; navigate: any }) {
  const getTypeLabel = () => {
    if (record.type === 'customer') return 'Customer';
    if (record.type === 'k2') return 'K2';
    if (record.type === 'family') return 'Family';
    return record.type;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-semibold text-gray-900 mb-1">{record.account}</div>
          <div className="text-sm text-gray-600">{record.date}</div>
        </div>
        <span className="text-xs px-2 py-1 rounded border bg-gray-100 border-gray-300 text-gray-700">
          {getTypeLabel()}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <div>
          <div className="text-gray-600 text-xs">Total</div>
          <div className="font-medium text-gray-900">${record.total.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-gray-600 text-xs">Amount Paid</div>
          <div className="font-medium text-gray-900">${record.amountPaid.toFixed(2)}</div>
        </div>
      </div>
      <div className="mb-3 p-2 bg-gray-900 text-white rounded flex justify-between items-center">
        <span className="text-sm font-medium">Balance Due</span>
        <span className="font-bold">${record.balanceDue.toFixed(2)}</span>
      </div>
      <div className="text-xs text-gray-600 mb-3">Status: {record.status}</div>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => navigate('/invoices')}
          className="bg-white border border-gray-300 text-gray-900 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-1 active:bg-gray-50"
        >
          <FileText size={16} />
          View
        </button>
        <button
          onClick={() => navigate('/record-payment')}
          className="bg-gray-900 text-white py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-1 active:bg-gray-800"
        >
          <DollarSign size={16} />
          Record Payment
        </button>
      </div>
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

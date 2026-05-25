import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, FileText } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';

type DateFilter = 'this-month' | 'last-month' | 'custom';

interface PaymentRecord {
  id: string;
  date: string;
  account: string;
  paymentMethod: string;
  checkNumber?: string;
  amount: number;
  receivedBy: string;
}

const paymentsData: PaymentRecord[] = [
  {
    id: '1',
    date: '5/16/2026',
    account: 'Johnson Ranch',
    paymentMethod: 'Check',
    checkNumber: '1042',
    amount: 97.90,
    receivedBy: 'Operator'
  }
];

export default function ReportPaymentsReceived() {
  const navigate = useNavigate();
  const [dateFilter, setDateFilter] = useState<DateFilter>('this-month');

  const totalReceived = paymentsData.reduce((sum, payment) => sum + payment.amount, 0);
  const cashTotal = paymentsData.filter(p => p.paymentMethod === 'Cash').reduce((sum, p) => sum + p.amount, 0);
  const checkTotal = paymentsData.filter(p => p.paymentMethod === 'Check').reduce((sum, p) => sum + p.amount, 0);
  const otherTotal = paymentsData.filter(p => p.paymentMethod === 'Other').reduce((sum, p) => sum + p.amount, 0);

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
          <h1 className="text-xl font-semibold text-gray-900">Payments Received</h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-2">
          <div className="col-span-2">
            <SummaryCard label="Total Received" value={`$${totalReceived.toFixed(2)}`} />
          </div>
          <SummaryCard label="Cash" value={`$${cashTotal.toFixed(2)}`} />
          <SummaryCard label="Check" value={`$${checkTotal.toFixed(2)}`} />
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

        {/* Payments List */}
        <div className="space-y-3">
          {paymentsData.map(payment => (
            <PaymentRecordRow key={payment.id} payment={payment} navigate={navigate} />
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

function PaymentRecordRow({ payment, navigate }: { payment: PaymentRecord; navigate: any }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-semibold text-gray-900 mb-1">{payment.account}</div>
          <div className="text-sm text-gray-600">{payment.date}</div>
        </div>
        <div className="text-xl font-bold text-gray-900">${payment.amount.toFixed(2)}</div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <div>
          <div className="text-gray-600 text-xs">Payment Method</div>
          <div className="font-medium text-gray-900">
            {payment.paymentMethod}
            {payment.checkNumber && ` #${payment.checkNumber}`}
          </div>
        </div>
        <div>
          <div className="text-gray-600 text-xs">Received By</div>
          <div className="font-medium text-gray-900">{payment.receivedBy}</div>
        </div>
      </div>
      <button
        onClick={() => navigate('/invoices')}
        className="w-full bg-white border border-gray-300 text-gray-900 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 active:bg-gray-50"
      >
        <FileText size={16} />
        View Invoice
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

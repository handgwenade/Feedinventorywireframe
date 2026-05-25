import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, FileText } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';
import { accounts, invoiceRecords, payments, users } from '../data/mockData';
import { formatCurrency } from '../utils/calculations';
import type { Payment } from '../types';

type DateFilter = 'this-month' | 'last-month' | 'custom';

function getAccountName(payment: Payment): string {
  const invoice = invoiceRecords.find((record) => record.id === payment.invoiceRecordId);

  if (!invoice?.accountId) return 'Unknown Account';

  return accounts.find((account) => account.id === invoice.accountId)?.name ?? 'Unknown Account';
}

function getReceivedByName(userId: string): string {
  return users.find((user) => user.id === userId)?.name ?? 'Unknown User';
}

function getPaymentMethodLabel(method: string): string {
  return method
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getInvoiceForPayment(payment: Payment) {
  return invoiceRecords.find((record) => record.id === payment.invoiceRecordId);
}

export default function ReportPaymentsReceived() {
  const navigate = useNavigate();
  const [dateFilter, setDateFilter] = useState<DateFilter>('this-month');

  const totalReceived = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const cashTotal = payments
    .filter((payment) => payment.method === 'cash')
    .reduce((sum, payment) => sum + payment.amount, 0);
  const checkTotal = payments
    .filter((payment) => payment.method === 'check')
    .reduce((sum, payment) => sum + payment.amount, 0);
  const otherTotal = payments
    .filter((payment) => !['cash', 'check'].includes(payment.method))
    .reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
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
        <div className="grid grid-cols-4 gap-2">
          <div className="col-span-2">
            <SummaryCard label="Total Received" value={formatCurrency(totalReceived)} />
          </div>
          <SummaryCard label="Cash" value={formatCurrency(cashTotal)} />
          <SummaryCard label="Check" value={formatCurrency(checkTotal)} />
        </div>

        <div className="grid grid-cols-1 gap-2">
          <SummaryCard label="Other Payments" value={formatCurrency(otherTotal)} />
        </div>

        <div>
          <div className="text-xs font-medium text-gray-600 mb-2">Date Range</div>
          <div className="flex gap-2">
            <DateFilterChip label="This Month" active={dateFilter === 'this-month'} onClick={() => setDateFilter('this-month')} />
            <DateFilterChip label="Last Month" active={dateFilter === 'last-month'} onClick={() => setDateFilter('last-month')} />
            <DateFilterChip label="Custom" active={dateFilter === 'custom'} onClick={() => setDateFilter('custom')} />
          </div>
        </div>

        <div className="space-y-3">
          {payments.map((payment) => (
            <PaymentRecordRow key={payment.id} payment={payment} navigate={navigate} />
          ))}
        </div>

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

function PaymentRecordRow({
  payment,
  navigate,
}: {
  payment: Payment;
  navigate: (route: string, options?: { state?: unknown }) => void;
}) {
  const invoice = getInvoiceForPayment(payment);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start mb-2 gap-3">
        <div>
          <div className="font-semibold text-gray-900 mb-1">{getAccountName(payment)}</div>
          <div className="text-sm text-gray-600">{new Date(payment.receivedAt).toLocaleDateString()}</div>
        </div>
        <div className="text-xl font-bold text-gray-900">{formatCurrency(payment.amount)}</div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <div>
          <div className="text-gray-600 text-xs">Payment Method</div>
          <div className="font-medium text-gray-900">
            {getPaymentMethodLabel(payment.method)}
            {payment.referenceNumber && ` #${payment.referenceNumber}`}
          </div>
        </div>
        <div>
          <div className="text-gray-600 text-xs">Received By</div>
          <div className="font-medium text-gray-900">{getReceivedByName(payment.receivedByUserId)}</div>
        </div>
      </div>
      <button
        onClick={() => navigate('/invoice-detail', { state: { invoice } })}
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

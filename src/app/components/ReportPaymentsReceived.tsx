import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, FileText } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';
import { paymentsService } from '../services/paymentsService';
import { formatCurrency } from '../utils/calculations';
import type { PaymentReceivedItem } from '../services/paymentsService';

type DateFilter = 'this-month' | 'last-month' | 'custom';

function getPaymentMethodLabel(method: string): string {
  return method
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function ReportPaymentsReceived() {
  const navigate = useNavigate();
  const [dateFilter, setDateFilter] = useState<DateFilter>('this-month');
  const [payments, setPayments] = useState<PaymentReceivedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPayments() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const livePayments = await paymentsService.listReceived();

        if (isMounted) {
          setPayments(livePayments);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Unable to load payments.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPayments();

    return () => {
      isMounted = false;
    };
  }, []);

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
    <div className="min-h-screen bg-[#f7f4ed] pb-24">
      <div className="bg-white border-b border-[#e8dfd1] p-4 flex items-center justify-between shadow-[0_1px_4px_rgba(61,47,31,0.06)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/reports')}
            className="text-[#8b7a6f] active:text-[#3d2f1f]"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-[#3d2f1f]">Payments Received</h1>
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
          <div className="text-xs font-semibold text-[#8b7a6f] mb-2">Date Range</div>
          <div className="flex gap-2">
            <DateFilterChip label="This Month" active={dateFilter === 'this-month'} onClick={() => setDateFilter('this-month')} />
            <DateFilterChip label="Last Month" active={dateFilter === 'last-month'} onClick={() => setDateFilter('last-month')} />
            <DateFilterChip label="Custom" active={dateFilter === 'custom'} onClick={() => setDateFilter('custom')} />
          </div>
        </div>

        <div className="space-y-3">
          {isLoading && (
            <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 text-sm text-[#8b7a6f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
              Loading payments...
            </div>
          )}

          {errorMessage && (
            <div className="bg-white border border-[#b7791f] rounded-2xl p-4 text-sm text-[#3d2f1f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
              {errorMessage}
            </div>
          )}

          {!isLoading && !errorMessage && payments.length === 0 && (
            <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 text-sm text-[#8b7a6f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
              No payments received.
            </div>
          )}

          {payments.map((payment) => (
            <PaymentRecordRow key={payment.id} payment={payment} navigate={navigate} />
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

function DateFilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-3 py-2 rounded-2xl text-sm font-semibold transition-colors ${
        active ? 'bg-[#5a7a4d] text-white shadow-[0_2px_8px_rgba(61,47,31,0.12)]' : 'bg-white border border-[#ded2c0] text-[#3d2f1f] active:bg-[#faf8f5]'
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
  payment: PaymentReceivedItem;
  navigate: (route: string, options?: { state?: unknown }) => void;
}) {
  return (
    <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
      <div className="flex justify-between items-start mb-2 gap-3">
        <div>
          <div className="font-semibold text-[#3d2f1f] mb-1">{payment.accountName}</div>
          <div className="text-sm text-[#8b7a6f]">{new Date(payment.receivedAt).toLocaleDateString()}</div>
        </div>
        <div className="text-xl font-bold text-[#3d2f1f]">{formatCurrency(payment.amount)}</div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <div>
          <div className="text-[#8b7a6f] text-xs">Payment Method</div>
          <div className="font-medium text-[#3d2f1f]">
            {getPaymentMethodLabel(payment.method)}
            {payment.referenceNumber && ` #${payment.referenceNumber}`}
          </div>
        </div>
        <div>
          <div className="text-[#8b7a6f] text-xs">Received By</div>
          <div className="font-medium text-[#3d2f1f]">{payment.receivedByName}</div>
        </div>
      </div>
      <div className="text-xs text-[#8b7a6f] mb-3">Invoice: {payment.invoiceDisplayNumber}</div>
      <button
        onClick={() => navigate('/invoice-detail', { state: { invoice: payment.invoice } })}
        disabled={!payment.invoice}
        className="w-full bg-white border border-[#ded2c0] text-[#3d2f1f] py-2 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 active:bg-[#faf8f5] disabled:text-[#8b7a6f] disabled:bg-[#f7f4ed] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
      >
        <FileText size={16} />
        View Invoice
      </button>
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

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, AlertTriangle, Clock, Users, Truck, HomeIcon, FileText, DollarSign } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';
import { invoicesService } from '../services/invoicesService';
import { paymentsService } from '../services/paymentsService';
import { productsService } from '../services/productsService';
import { calculateInventoryValue, formatCurrency, isLowStock } from '../utils/calculations';
import type { InvoiceListItem } from '../services/invoicesService';
import type { PaymentReceivedItem } from '../services/paymentsService';
import type { Product } from '../types';
import useRefreshOnFocus from '../hooks/useRefreshOnFocus';

interface ReportCard {
  id: string;
  name: string;
  helperText: string;
  metric?: string;
  icon: React.ReactNode;
  route: string;
}

function buildReports(
  products: Product[],
  invoices: InvoiceListItem[],
  payments: PaymentReceivedItem[],
): ReportCard[] {
  const totalInventoryValue = products.reduce(
    (total, product) => total + calculateInventoryValue(product),
    0,
  );
  const lowStockCount = products.filter((product) => isLowStock(product)).length;
  const customerSalesTotal = invoices
    .filter((record) => record.recordType === 'customer_invoice')
    .reduce((total, record) => total + record.total, 0);
  const k2Total = invoices
    .filter((record) => record.recordType === 'k2_statement')
    .reduce((total, record) => total + record.total, 0);
  // Legacy family_use records remain available in the database, but are not shown in active reports.
  const unpaidTotal = invoices.reduce((total, record) => total + record.balanceDue, 0);
  const paymentsTotal = payments.reduce((total, payment) => total + payment.amount, 0);

  return [
    {
      id: '1',
      name: 'Inventory Summary',
      helperText: 'Current quantity, value, and stock status by product.',
      metric: formatCurrency(totalInventoryValue),
      icon: <Package size={24} />,
      route: '/report-inventory-summary',
    },
    {
      id: '2',
      name: 'Low Stock',
      helperText: 'Products at or below minimum quantity.',
      metric: `${lowStockCount} products`,
      icon: <AlertTriangle size={24} />,
      route: '/report-low-stock',
    },
    {
      id: '3',
      name: 'Activity History',
      helperText: 'All inventory, invoice, payment, and account changes.',
      metric: 'Audit trail',
      icon: <Clock size={24} />,
      route: '/activity-history',
    },
    {
      id: '4',
      name: 'Customer Sales',
      helperText: 'Sales to outside customers only.',
      metric: formatCurrency(customerSalesTotal),
      icon: <Users size={24} />,
      route: '/report-customer-sales',
    },
    {
      id: '5',
      name: 'K2 Account Use',
      helperText: 'Feed/products recorded to K2.',
      metric: formatCurrency(k2Total),
      icon: <Truck size={24} />,
      route: '/report-k2-use',
    },
    {
      id: '7',
      name: 'Unpaid Invoices',
      helperText: 'Open balances by customer/account.',
      metric: formatCurrency(unpaidTotal),
      icon: <FileText size={24} />,
      route: '/report-unpaid-invoices',
    },
    {
      id: '8',
      name: 'Payments Received',
      helperText: 'Cash, check, and other payments recorded.',
      metric: formatCurrency(paymentsTotal),
      icon: <DollarSign size={24} />,
      route: '/report-payments-received',
    },
  ];
}

export default function ReportsList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [payments, setPayments] = useState<PaymentReceivedItem[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [reportErrorMessage, setReportErrorMessage] = useState<string | null>(null);

  async function loadReports() {
    setIsLoadingReports(true);
    setReportErrorMessage(null);

    try {
      const [liveProducts, liveInvoices, livePayments] = await Promise.all([
        productsService.list(),
        invoicesService.list(),
        paymentsService.listReceived(),
      ]);

      setProducts(liveProducts);
      setInvoices(liveInvoices);
      setPayments(livePayments);
    } catch (error) {
      setProducts([]);
      setInvoices([]);
      setPayments([]);
      setReportErrorMessage(error instanceof Error ? error.message : 'Unable to load report data.');
    } finally {
      setIsLoadingReports(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadReportsOnMount() {
      setIsLoadingReports(true);
      setReportErrorMessage(null);

      try {
        const [liveProducts, liveInvoices, livePayments] = await Promise.all([
          productsService.list(),
          invoicesService.list(),
          paymentsService.listReceived(),
        ]);

        if (!isMounted) return;

        setProducts(liveProducts);
        setInvoices(liveInvoices);
        setPayments(livePayments);
      } catch (error) {
        if (!isMounted) return;

        setProducts([]);
        setInvoices([]);
        setPayments([]);
        setReportErrorMessage(error instanceof Error ? error.message : 'Unable to load report data.');
      } finally {
        if (isMounted) {
          setIsLoadingReports(false);
        }
      }
    }

    loadReportsOnMount();

    return () => {
      isMounted = false;
    };
  }, []);

  useRefreshOnFocus(loadReports, isLoadingReports);

  const reports = buildReports(products, invoices, payments);

return (
    <div className="min-h-screen bg-[#f7f4ed] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-[#e8dfd1] p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shadow-[0_1px_4px_rgba(61,47,31,0.06)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-[#8b7a6f] active:text-[#3d2f1f]"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-[#3d2f1f]">Reports</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadReports}
            disabled={isLoadingReports}
            className="px-4 py-2 bg-white border border-[#ded2c0] text-[#3d2f1f] rounded-2xl text-sm font-semibold active:bg-[#faf8f5] disabled:opacity-50 shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
          >
            {isLoadingReports ? 'Refreshing...' : 'Refresh'}
          </button>
          <UserIcon />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Helper Text */}
        <p className="text-sm text-[#8b7a6f]">
          Review inventory, sales, payments, and account activity.
        </p>

        {/* Report Cards */}
        <div className="space-y-3">
          {isLoadingReports && (
            <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 text-sm text-[#8b7a6f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
              Loading report data...
            </div>
          )}

          {!isLoadingReports && reportErrorMessage && (
            <div className="bg-white border border-[#b7791f] rounded-2xl p-4 text-sm text-[#3d2f1f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
              {reportErrorMessage}
            </div>
          )}

          {!isLoadingReports && !reportErrorMessage && products.length === 0 && invoices.length === 0 && payments.length === 0 && (
            <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 text-sm text-[#8b7a6f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
              No report data found yet.
            </div>
          )}

          {reports.map((report) => (
            <ReportCardComponent
              key={report.id}
              report={report}
              onClick={() => navigate(report.route)}
            />
          ))}
        </div>

        {/* Annotations */}
        <div className="mt-6 space-y-3">
          <div className="p-3 bg-white border border-[#ded2c0] rounded-2xl text-xs text-[#8b7a6f] leading-relaxed shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <strong>Separation:</strong> Reports should separate Customer and K2 activity so customer sales are not mixed with related-entity or legacy person use.
          </div>
          <div className="p-3 bg-white border border-[#ded2c0] rounded-2xl text-xs text-[#8b7a6f] leading-relaxed shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <strong>Role-based access:</strong> Admin/Manager can see full reports. Operator/View Only access can be limited.
          </div>
          <div className="p-3 bg-white border border-[#ded2c0] rounded-2xl text-xs text-[#8b7a6f] leading-relaxed shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <strong>Read-only:</strong> Reports are for viewing, exporting, and printing. Editing should happen through the source record, not inside the report.
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function ReportCardComponent({
  report,
  onClick,
}: {
  report: ReportCard;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-[#ded2c0] rounded-2xl p-4 active:bg-[#faf8f5] cursor-pointer shadow-[0_2px_8px_rgba(61,47,31,0.08)] transition-colors"
    >
      <div className="flex items-start gap-3 mb-2">
        <div className="text-[#5a7a4d] mt-1">{report.icon}</div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div className="font-semibold text-[#3d2f1f]">{report.name}</div>
            {report.metric && (
              <div className="text-sm font-bold text-[#3d2f1f] whitespace-nowrap">
                {report.metric}
              </div>
            )}
          </div>
          <div className="text-sm text-[#8b7a6f]">{report.helperText}</div>
        </div>
      </div>
      <button className="mt-3 w-full bg-white border border-[#ded2c0] text-[#3d2f1f] py-2 rounded-2xl font-semibold text-sm active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
        View
      </button>
    </div>
  );
}

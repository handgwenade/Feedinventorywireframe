import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, AlertTriangle, Clock, Users, Truck, HomeIcon, FileText, DollarSign } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';
import { invoiceRecords, payments } from '../data/mockData';
import { productsService } from '../services/productsService';
import { calculateInventoryValue, formatCurrency, isLowStock } from '../utils/calculations';
import type { Product } from '../types';

interface ReportCard {
  id: string;
  name: string;
  helperText: string;
  metric?: string;
  icon: React.ReactNode;
  route: string;
}

function buildReports(products: Product[]): ReportCard[] {
  const totalInventoryValue = products.reduce(
    (total, product) => total + calculateInventoryValue(product),
    0,
  );
  const lowStockCount = products.filter((product) => isLowStock(product)).length;

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
      metric: formatCurrency(
        invoiceRecords
          .filter((record) => record.recordType === 'customer_invoice')
          .reduce((total, record) => total + record.total, 0),
      ),
      icon: <Users size={24} />,
      route: '/report-customer-sales',
    },
    {
      id: '5',
      name: 'K2 Account Use',
      helperText: 'Feed/products recorded to K2.',
      metric: formatCurrency(
        invoiceRecords
          .filter((record) => record.recordType === 'k2_statement')
          .reduce((total, record) => total + record.total, 0),
      ),
      icon: <Truck size={24} />,
      route: '/report-k2-use',
    },
    {
      id: '6',
      name: 'Family Use',
      helperText: 'Feed/products recorded to family/person records.',
      metric: formatCurrency(
        invoiceRecords
          .filter((record) => record.recordType === 'family_use')
          .reduce((total, record) => total + record.total, 0),
      ),
      icon: <HomeIcon size={24} />,
      route: '/report-family-use',
    },
    {
      id: '7',
      name: 'Unpaid Invoices',
      helperText: 'Open balances by customer/account.',
      metric: formatCurrency(invoiceRecords.reduce((total, record) => total + record.balanceDue, 0)),
      icon: <FileText size={24} />,
      route: '/report-unpaid-invoices',
    },
    {
      id: '8',
      name: 'Payments Received',
      helperText: 'Cash, check, and other payments recorded.',
      metric: formatCurrency(payments.reduce((total, payment) => total + payment.amount, 0)),
      icon: <DollarSign size={24} />,
      route: '/report-payments-received',
    },
  ];
}

export default function ReportsList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productErrorMessage, setProductErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      setIsLoadingProducts(true);
      setProductErrorMessage(null);

      try {
        const liveProducts = await productsService.list();

        if (!isMounted) return;

        setProducts(liveProducts);
      } catch (error) {
        if (!isMounted) return;

        setProducts([]);
        setProductErrorMessage(error instanceof Error ? error.message : 'Unable to load inventory report data.');
      } finally {
        if (isMounted) {
          setIsLoadingProducts(false);
        }
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const reports = buildReports(products);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 active:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Reports</h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        {/* Helper Text */}
        <p className="text-sm text-gray-600">
          Review inventory, sales, payments, and account activity.
        </p>

        {/* Report Cards */}
        <div className="space-y-3">
          {isLoadingProducts && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
              Loading inventory report data...
            </div>
          )}

          {!isLoadingProducts && productErrorMessage && (
            <div className="bg-white border border-gray-300 rounded-lg p-4 text-sm text-gray-900">
              {productErrorMessage}
            </div>
          )}

          {!isLoadingProducts && !productErrorMessage && products.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
              No products found.
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
          <div className="p-3 bg-gray-50 border border-gray-300 rounded text-xs text-gray-600 leading-relaxed">
            <strong>Separation:</strong> Reports should separate Customer, K2, and Family activity so customer sales are not mixed with related-entity or family use.
          </div>
          <div className="p-3 bg-gray-50 border border-gray-300 rounded text-xs text-gray-600 leading-relaxed">
            <strong>Role-based access:</strong> Admin/Manager can see full reports. Operator/View Only access can be limited.
          </div>
          <div className="p-3 bg-gray-50 border border-gray-300 rounded text-xs text-gray-600 leading-relaxed">
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
      className="bg-white border border-gray-200 rounded-lg p-4 active:bg-gray-50 cursor-pointer"
    >
      <div className="flex items-start gap-3 mb-2">
        <div className="text-gray-700 mt-1">{report.icon}</div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div className="font-semibold text-gray-900">{report.name}</div>
            {report.metric && (
              <div className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                {report.metric}
              </div>
            )}
          </div>
          <div className="text-sm text-gray-600">{report.helperText}</div>
        </div>
      </div>
      <button className="mt-3 w-full bg-white border border-gray-300 text-gray-900 py-2 rounded-lg font-medium text-sm active:bg-gray-50">
        View
      </button>
    </div>
  );
}

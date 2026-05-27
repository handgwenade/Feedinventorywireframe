import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, FileText, Users, BarChart3, PlusCircle, Clock, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';
import { currentUser } from '../data/mockData';
import { activityService } from '../services/activityService';
import { invoicesService } from '../services/invoicesService';
import { productsService } from '../services/productsService';
import { calculateInventoryValue, formatCurrency, isLowStock } from '../utils/calculations';
import type { ActivityItem as ActivityItemRecord } from '../services/activityService';
import type { InvoiceListItem } from '../services/invoicesService';
import type { Product } from '../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [activities, setActivities] = useState<ActivityItemRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const [liveProducts, liveInvoices, liveActivities] = await Promise.all([
          productsService.list(),
          invoicesService.list(),
          activityService.list(),
        ]);

        if (!isMounted) return;

        setProducts(liveProducts);
        setInvoices(liveInvoices);
        setActivities(liveActivities);
      } catch (error) {
        if (!isMounted) return;

        setErrorMessage(error instanceof Error ? error.message : 'Unable to load dashboard data.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const inventoryValue = products.reduce((total, product) => total + calculateInventoryValue(product), 0);
  const lowStockCount = products.filter((product) => isLowStock(product)).length;
  const unpaidInvoices = invoices.filter((invoice) => invoice.balanceDue > 0);
  const unpaidTotal = unpaidInvoices.reduce((total, invoice) => total + invoice.balanceDue, 0);
  const recentActivities = activities.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="p-4 mb-2 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">C&C Feed Inventory</h1>
<p className="text-gray-600">Welcome back, {currentUser.name}</p>
        </div>
        <UserIcon />
      </div>

      <div className="px-4">{/* Rest of content */}

      {errorMessage && (
        <div className="bg-white border border-gray-300 rounded-lg p-4 text-sm text-gray-900 mb-4">
          {errorMessage}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <SummaryCard
          icon={<DollarSign size={20} />}
          label="Inventory Value"
          value={isLoading ? '...' : formatCurrency(inventoryValue)}
        />
        <SummaryCard
          icon={<AlertTriangle size={20} />}
          label="Low Stock"
          value={isLoading ? '...' : String(lowStockCount)}
        />
        <SummaryCard
          icon={<TrendingUp size={20} />}
          label="Unpaid Invoices"
          value={isLoading ? '...' : formatCurrency(unpaidTotal)}
          detail={isLoading ? undefined : `${unpaidInvoices.length} open`}
        />
      </div>

      {/* Primary Action */}
      <button
        onClick={() => navigate('/choose-sale-type')}
        className="w-full bg-gray-900 text-white p-5 rounded-lg shadow-sm mb-6 flex items-center justify-center gap-3 active:bg-gray-800"
      >
        <ShoppingCart size={24} />
        <span className="text-lg font-semibold">Take Feed</span>
      </button>

      {/* Main Navigation Cards */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Main Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <NavCard
            icon={<Package size={24} />}
            label="Inventory"
            onClick={() => navigate('/inventory')}
          />
          <NavCard
            icon={<FileText size={24} />}
            label="Invoices"
            onClick={() => navigate('/invoices')}
          />
          <NavCard
            icon={<Users size={24} />}
            label="Accounts"
            onClick={() => navigate('/accounts')}
          />
          <NavCard
            icon={<BarChart3 size={24} />}
            label="Reports"
            onClick={() => navigate('/reports')}
          />
          <NavCard
            icon={<PlusCircle size={24} />}
            label="Add Stock"
            onClick={() => navigate('/add-stock-select')}
          />
          <NavCard
            icon={<Clock size={24} />}
            label="Activity History"
            onClick={() => navigate('/activity-history')}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Recent Activity</h3>
        <div className="space-y-3">
          {isLoading && (
            <div className="text-sm text-gray-700">Loading recent activity...</div>
          )}

          {!isLoading && !errorMessage && recentActivities.length === 0 && (
            <div className="text-sm text-gray-700">No recent activity.</div>
          )}

          {!isLoading && recentActivities.map((activity) => (
            <ActivityItem
              key={activity.id}
              text={activity.summary}
            />
          ))}
        </div>
      </div>

      {/* Workflow Annotation */}
      <div className="mt-6 p-3 bg-gray-50 border border-gray-300 rounded text-xs text-gray-600 leading-relaxed">
        <strong>Navigation:</strong><br />
        Home is the main command center. All sale/use activity starts from Take Feed. The user first chooses whether the feed is for a Customer, K2, or Family. Inventory, Invoices, Accounts, Reports, Add Stock, and Activity History remain accessible directly from Home.<br /><br />
        Bottom navigation provides persistent access to Home, Inventory, Take Feed, Invoices, and Accounts. Reports remain accessible from Home or role-based menus.
      </div>

      {/* Utility Screens Link (for wireframe reference) */}
      <button
        onClick={() => navigate('/utility-screens')}
        className="w-full mt-4 p-3 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm active:bg-gray-50"
      >
        View Utility Screens Reference →
      </button>
      </div>

      <BottomNav />
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="bg-white border border-gray-200 p-3 rounded-lg">
      <div className="flex items-center gap-1 mb-1 text-gray-600">
        {icon}
      </div>
      <div className="text-xs text-gray-600 mb-1">{label}</div>
      <div className="text-lg font-bold text-gray-900">{value}</div>
      {detail && <div className="text-xs text-gray-600 mt-1">{detail}</div>}
    </div>
  );
}

function NavCard({
  icon,
  label,
  onClick
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm flex flex-col items-center gap-2 active:bg-gray-50"
    >
      <div className="text-gray-700">{icon}</div>
      <span className="text-sm font-medium text-gray-900 text-center">{label}</span>
    </button>
  );
}

function ActivityItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
      <p className="text-sm text-gray-700">{text}</p>
    </div>
  );
}

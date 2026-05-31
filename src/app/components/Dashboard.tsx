import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, FileText, Users, BarChart3, PlusCircle, Clock, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';
import useRefreshOnFocus from '../hooks/useRefreshOnFocus';
import { activityService } from '../services/activityService';
import { invoicesService } from '../services/invoicesService';
import { productsService } from '../services/productsService';
import { userProfileService } from '../services/userProfileService';
import { calculateInventoryValue, formatCurrency, isLowStock } from '../utils/calculations';
import type { ActivityItem as ActivityItemRecord } from '../services/activityService';
import type { InvoiceListItem } from '../services/invoicesService';
import type { CurrentUserProfile } from '../services/userProfileService';
import type { Product } from '../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [activities, setActivities] = useState<ActivityItemRecord[]>([]);
  const [profile, setProfile] = useState<CurrentUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadDashboardData() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [liveProducts, liveInvoices, liveActivities, liveProfile] = await Promise.all([
        productsService.list(),
        invoicesService.list(),
        activityService.list(),
        userProfileService.getCurrentProfile(),
      ]);

      setProducts(liveProducts);
      setInvoices(liveInvoices);
      setActivities(liveActivities);
      setProfile(liveProfile);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardDataOnMount() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const [liveProducts, liveInvoices, liveActivities, liveProfile] = await Promise.all([
          productsService.list(),
          invoicesService.list(),
          activityService.list(),
          userProfileService.getCurrentProfile(),
        ]);

        if (!isMounted) return;

        setProducts(liveProducts);
        setInvoices(liveInvoices);
        setActivities(liveActivities);
        setProfile(liveProfile);
      } catch (error) {
        if (!isMounted) return;

        setErrorMessage(error instanceof Error ? error.message : 'Unable to load dashboard data.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboardDataOnMount();

    return () => {
      isMounted = false;
    };
  }, []);

  useRefreshOnFocus(loadDashboardData, isLoading);

  const inventoryValue = products.reduce((total, product) => total + calculateInventoryValue(product), 0);
  const lowStockCount = products.filter((product) => isLowStock(product)).length;
  const unpaidInvoices = invoices.filter((invoice) => invoice.balanceDue > 0);
  const unpaidTotal = unpaidInvoices.reduce((total, invoice) => total + invoice.balanceDue, 0);
  const recentActivities = activities.slice(0, 3);
  const greetingName = profile?.displayName ?? profile?.email ?? 'there';

  return (
    <div className="min-h-screen bg-[#f7f4ed] pb-24">
      {/* Header */}
      <div className="p-4 mb-4 bg-white border-b border-[#e8dfd1] shadow-[0_1px_4px_rgba(61,47,31,0.06)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#3d2f1f] mb-1">C&C Feed Inventory</h1>
            <p className="text-[#8b7a6f]">Welcome back, {isLoading ? '...' : greetingName}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadDashboardData}
              disabled={isLoading}
              className="px-4 py-2 bg-[#d4a574] text-[#3d2f1f] rounded-lg text-sm font-medium active:bg-[#c9956f] disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
            <UserIcon />
          </div>
        </div>
      </div>

      <div className="px-4">{/* Rest of content */}

      {errorMessage && (
        <div className="card-warm border-2 border-[#d4183d] p-4 text-sm text-[#3d2f1f] mb-4">
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
        className="w-full bg-[#5a7a4d] text-white p-5 rounded-2xl shadow-[0_3px_10px_rgba(61,47,31,0.18)] mb-6 flex items-center justify-center gap-3 active:bg-[#4a6a3d] transition-colors font-semibold"
      >
        <ShoppingCart size={24} />
        <span className="text-lg">Take Feed</span>
      </button>

      {/* Main Navigation Cards */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-[#8b7a6f] mb-3">Main Actions</h2>
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
      <div className="bg-[#fffdf8] border border-[#ded2c0] rounded-2xl p-5 mb-6 shadow-[0_4px_14px_rgba(61,47,31,0.16)]">
        <h3 className="font-semibold text-[#3d2f1f] mb-3">Recent Activity</h3>
        <div className="space-y-3">
          {isLoading && (
            <div className="text-sm text-[#8b7a6f]">Loading recent activity...</div>
          )}

          {!isLoading && !errorMessage && recentActivities.length === 0 && (
            <div className="text-sm text-[#8b7a6f]">No recent activity.</div>
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
      <div className="mt-6 p-4 bg-[#fffdf8] border border-[#ded2c0] rounded-2xl text-xs text-[#8b7a6f] leading-relaxed shadow-[0_4px_14px_rgba(61,47,31,0.16)]">
        <strong className="text-[#3d2f1f] block mb-2">Navigation:</strong>
        Home is the main command center. All sale/use activity starts from Take Feed. The user first chooses whether the feed is for a Customer or K2. Inventory, Invoices, Accounts, Reports, Add Stock, and Activity History remain accessible directly from Home.<br /><br />
        Bottom navigation provides persistent access to Home, Inventory, Take Feed, Invoices, and Accounts. Reports remain accessible from Home or role-based menus.
      </div>

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
    <div className="bg-[#fffdf8] border border-[#ded2c0] rounded-2xl p-4 shadow-[0_4px_14px_rgba(61,47,31,0.16)]">
      <div className="flex items-center gap-1 mb-1 text-[#8b7a6f]">
        {icon}
      </div>
      <div className="text-xs text-[#8b7a6f] mb-1">{label}</div>
      <div className="text-lg font-bold text-[#3d2f1f]">{value}</div>
      {detail && <div className="text-xs text-[#8b7a6f] mt-1">{detail}</div>}
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
      className="bg-[#fffdf8] border border-[#ded2c0] rounded-2xl p-5 min-h-[108px] flex flex-col items-center justify-center gap-3 shadow-[0_4px_14px_rgba(61,47,31,0.16)] active:bg-[#faf8f5] transition-colors"
    >
      <div className="text-[#5a7a4d]">{icon}</div>
      <span className="text-sm font-medium text-[#3d2f1f] text-center">{label}</span>
    </button>
  );
}

function ActivityItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-[#d4a574] mt-2 flex-shrink-0" />
      <p className="text-sm text-[#3d2f1f]">{text}</p>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, FileText, Users, BarChart3, PlusCircle, Clock, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';
import { activityLogs, currentUser, inventorySummary } from '../data/mockData';
import { formatCurrency } from '../utils/calculations';

export default function Dashboard() {
  const navigate = useNavigate();

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

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <SummaryCard
          icon={<DollarSign size={20} />}
          label="Inventory Value"
          value={formatCurrency(inventorySummary.totalInventoryValue)}
        />
        <SummaryCard
          icon={<AlertTriangle size={20} />}
          label="Low Stock"
          value={String(inventorySummary.lowStockCount)}
        />
        <SummaryCard
          icon={<TrendingUp size={20} />}
          label="Unpaid Invoices"
          value={formatCurrency(inventorySummary.unpaidTotal)}
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
  {activityLogs.slice(0, 3).map((activity) => (
    <ActivityItem
      key={activity.id}
      text={activity.summary}
    />
  ))}
</div>      </div>

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
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white border border-gray-200 p-3 rounded-lg">
      <div className="flex items-center gap-1 mb-1 text-gray-600">
        {icon}
      </div>
      <div className="text-xs text-gray-600 mb-1">{label}</div>
      <div className="text-lg font-bold text-gray-900">{value}</div>
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

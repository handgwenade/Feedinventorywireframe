import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, FileText, DollarSign, Activity, Edit, List } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';

interface Account {
  id: string;
  name: string;
  type: 'customer' | 'k2' | 'family';
  balance?: number;
  lastActivity: string;
  phone?: string;
  email?: string;
}

export default function AccountDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { account } = location.state || {
    account: {
      id: '1',
      name: 'Anderson Cattle Co.',
      type: 'customer',
      balance: 171.50,
      lastActivity: '5/19/2026',
      phone: '(555) 123-4567',
      email: 'anderson@example.com'
    }
  };

  const renderCustomerDetail = () => (
    <>
      {/* Account Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-sm text-gray-600 mb-1">Account name</div>
            <div className="text-xl font-bold text-gray-900">{account.name}</div>
          </div>
          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded border border-gray-300">
            Customer
          </span>
        </div>

        <div className="border-t border-gray-200 pt-3">
          <div className="text-sm text-gray-600 mb-1">Balance due</div>
          <div className="text-2xl font-bold text-gray-900">${account.balance?.toFixed(2) || '0.00'}</div>
        </div>

        <div className="border-t border-gray-200 pt-3">
          <div className="text-sm text-gray-600 mb-1">Phone</div>
          <div className="font-medium text-gray-900">{account.phone || '—'}</div>
        </div>

        <div className="border-t border-gray-200 pt-3">
          <div className="text-sm text-gray-600 mb-1">Email</div>
          <div className="font-medium text-gray-900">{account.email || '—'}</div>
        </div>

        <div className="border-t border-gray-200 pt-3">
          <div className="text-sm text-gray-600 mb-1">Notes</div>
          <div className="text-gray-900">—</div>
        </div>

        <div className="border-t border-gray-200 pt-3">
          <div className="text-sm text-gray-600 mb-1">Last activity</div>
          <div className="font-medium text-gray-900">{account.lastActivity}</div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard label="Total purchased" value="$1,245.30" />
        <SummaryCard label="Unpaid balance" value={`$${account.balance?.toFixed(2) || '0.00'}`} />
        <SummaryCard label="Last invoice" value="5/19/2026" />
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <ActionButton
          icon={<ShoppingCart size={20} />}
          label="Take Feed"
          onClick={() => navigate('/choose-sale-type')}
        />
        <ActionButton
          icon={<FileText size={20} />}
          label="Create Invoice"
          onClick={() => {}}
        />
        <ActionButton
          icon={<DollarSign size={20} />}
          label="Record Payment"
          onClick={() => {}}
        />
        <ActionButton
          icon={<List size={20} />}
          label="View Invoices"
          onClick={() => navigate('/invoices')}
        />
        <ActionButton
          icon={<Activity size={20} />}
          label="View Activity"
          onClick={() => navigate('/activity-history')}
        />
        <ActionButton
          icon={<Edit size={20} />}
          label="Edit Account"
          onClick={() => {}}
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-4 space-y-3">
          <ActivityItem
            label="INV-1001"
            description="Garlic Salt Blocks — 10 units — $171.50"
            status="Unpaid"
            statusColor="text-red-600"
          />
          <div className="text-sm text-gray-600 border-t border-gray-200 pt-3">
            Payment reminder note
          </div>
          <div className="text-sm text-gray-600 border-t border-gray-200 pt-3">
            Last purchase date: {account.lastActivity}
          </div>
        </div>
      </div>
    </>
  );

  const renderK2Detail = () => (
    <>
      {/* Account Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-sm text-gray-600 mb-1">Account name</div>
            <div className="text-xl font-bold text-gray-900">{account.name}</div>
          </div>
          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded border border-gray-300">
            K2
          </span>
        </div>

        <div className="border-t border-gray-200 pt-3">
          <div className="text-sm text-gray-600 mb-1">Account type</div>
          <div className="font-medium text-gray-900">Separate cattle-side account</div>
        </div>

        <div className="border-t border-gray-200 pt-3">
          <div className="text-sm text-gray-600 mb-1">Status</div>
          <div className="font-medium text-gray-900">Internal Transfer</div>
        </div>

        <div className="border-t border-gray-200 pt-3">
          <div className="text-sm text-gray-600 mb-1">Last activity</div>
          <div className="font-medium text-gray-900">{account.lastActivity}</div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard label="Total value used" value="$2,380.45" />
        <SummaryCard label="Current balance" value="Internal" />
        <SummaryCard label="Last statement" value="5/18/2026" />
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <ActionButton
          icon={<ShoppingCart size={20} />}
          label="Take Feed"
          onClick={() => navigate('/choose-sale-type')}
        />
        <ActionButton
          icon={<FileText size={20} />}
          label="Create K2 Statement"
          onClick={() => {}}
        />
        <ActionButton
          icon={<List size={20} />}
          label="View Statements"
          onClick={() => {}}
        />
        <ActionButton
          icon={<Activity size={20} />}
          label="View Activity"
          onClick={() => navigate('/activity-history')}
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-4 space-y-3">
          <ActivityItem
            label="STMT-1002"
            description="Garlic Salt Blocks — 2 units — $34.30"
            status="Internal Transfer"
            statusColor="text-gray-600"
          />
        </div>
      </div>

      {/* Annotation */}
      <div className="p-3 bg-gray-50 border border-gray-300 rounded text-xs text-gray-600 leading-relaxed">
        <strong>Note:</strong> K2 is not a standard customer. K2 activity is tracked separately from outside customer sales by default.
      </div>
    </>
  );

  const renderFamilyDetail = () => (
    <>
      {/* Person Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-sm text-gray-600 mb-1">Name</div>
            <div className="text-xl font-bold text-gray-900">{account.name}</div>
          </div>
          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded border border-gray-300">
            Family
          </span>
        </div>

        <div className="border-t border-gray-200 pt-3">
          <div className="text-sm text-gray-600 mb-1">Record type</div>
          <div className="font-medium text-gray-900">Controlled person record</div>
        </div>

        <div className="border-t border-gray-200 pt-3">
          <div className="text-sm text-gray-600 mb-1">Last activity</div>
          <div className="font-medium text-gray-900">{account.lastActivity}</div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard label="Total value taken" value="$856.20" />
        <SummaryCard label="Open amount" value="$0.00" />
        <SummaryCard label="Last recorded use" value="5/15/2026" />
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <ActionButton
          icon={<ShoppingCart size={20} />}
          label="Take Feed"
          onClick={() => navigate('/choose-sale-type')}
        />
        <ActionButton
          icon={<List size={20} />}
          label="View Family Use"
          onClick={() => {}}
        />
        <ActionButton
          icon={<Activity size={20} />}
          label="View Activity"
          onClick={() => navigate('/activity-history')}
        />
        <ActionButton
          icon={<Edit size={20} />}
          label="Edit Person"
          onClick={() => {}}
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-4 space-y-3">
          <ActivityItem
            label="FAM-1003"
            description="Garlic Salt Blocks — 3 units — $51.45"
            status="Track Only"
            statusColor="text-gray-600"
          />
        </div>
      </div>

      {/* Annotation */}
      <div className="p-3 bg-gray-50 border border-gray-300 rounded text-xs text-gray-600 leading-relaxed">
        <strong>Note:</strong> Family records should use one official display name. Search may support aliases, but duplicate person records should be avoided.
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/accounts')}
            className="text-gray-600 active:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Account Detail</h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        {account.type === 'customer' && renderCustomerDetail()}
        {account.type === 'k2' && renderK2Detail()}
        {account.type === 'family' && renderFamilyDetail()}
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

function ActionButton({
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
      className="w-full p-3 rounded-lg flex items-center gap-3 font-medium bg-white border border-gray-300 text-gray-900 active:bg-gray-50"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function ActivityItem({
  label,
  description,
  status,
  statusColor
}: {
  label: string;
  description: string;
  status: string;
  statusColor: string;
}) {
  return (
    <div className="space-y-1">
      <div className="font-semibold text-gray-900">{label}</div>
      <div className="text-sm text-gray-600">{description}</div>
      <div className={`text-sm font-medium ${statusColor}`}>{status}</div>
    </div>
  );
}

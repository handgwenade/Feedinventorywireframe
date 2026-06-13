import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Archive, ArrowLeft, ShoppingCart, FileText, DollarSign, Activity, Edit, List } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';
import { accountsService } from '../services/accountsService';
import { activityService } from '../services/activityService';
import { invoicesService } from '../services/invoicesService';
import { peopleService } from '../services/peopleService';
import { formatCurrency } from '../utils/calculations';
import type { ActivityItem as LiveActivityItem } from '../services/activityService';
import type { InvoiceListItem } from '../services/invoicesService';
import type { Account, Person } from '../types';

type AccountListType = 'customer' | 'k2' | 'family';

interface AccountListItem {
  id: string;
  name: string;
  type: AccountListType;
  balance: number;
  lastActivity: string;
  phone?: string;
  email?: string;
  source: Account | Person;
}

function getSelectedAccount(locationState: unknown): AccountListItem | null {
  return ((locationState as { account?: AccountListItem } | null)?.account ?? null);
}

function getRelatedRecords(account: AccountListItem, records: InvoiceListItem[]): InvoiceListItem[] {
  if (account.type === 'family') {
    return records.filter((record) => record.personId === account.id);
  }

  return records.filter((record) => record.accountId === account.id);
}

function getRelatedActivity(account: AccountListItem, activities: LiveActivityItem[], records: InvoiceListItem[]): LiveActivityItem[] {
  const recordIds = new Set(records.map((record) => record.id));

  return activities
    .filter((activity) => (
      activity.accountId === account.id ||
      activity.personId === account.id ||
      Boolean(activity.invoiceRecordId && recordIds.has(activity.invoiceRecordId))
    ))
    .slice(0, 3);
}

function getLastActivity(activities: LiveActivityItem[]): string {
  const activity = activities[0];

  if (!activity) return 'No activity yet';

  return new Date(activity.createdAt).toLocaleDateString();
}

function getLastRecordDate(records: InvoiceListItem[]): string {
  const latest = records[0];

  if (!latest) return '—';

  return new Date(latest.issueDate).toLocaleDateString();
}

function getTotalRecordValue(records: InvoiceListItem[]): number {
  return records.reduce((total, record) => total + record.total, 0);
}

function getStatusLabel(status: string): string {
  return status
    .split(/[_-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getNotes(account: AccountListItem): string {
  return 'notes' in account.source ? account.source.notes ?? '—' : '—';
}

export default function AccountDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const account = getSelectedAccount(location.state);
  const [allRecords, setAllRecords] = useState<InvoiceListItem[]>([]);
  const [allActivity, setAllActivity] = useState<LiveActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(account));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showArchivePanel, setShowArchivePanel] = useState(false);
  const [archiveReason, setArchiveReason] = useState('');
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  useEffect(() => {
    if (!account) return;

    let isMounted = true;

    async function loadAccountDetail() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const [liveRecords, liveActivity] = await Promise.all([
          invoicesService.list(),
          activityService.list(),
        ]);

        if (!isMounted) return;

        setAllRecords(liveRecords);
        setAllActivity(liveActivity);
      } catch (error) {
        if (!isMounted) return;

        setErrorMessage(error instanceof Error ? error.message : 'Unable to load account details.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadAccountDetail();

    return () => {
      isMounted = false;
    };
  }, [account?.id]);

  if (!account) {
    return (
      <div className="min-h-screen bg-[#f7f4ed] pb-24">
        <div className="app-header-safe">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/accounts')}
              className="app-header-action rounded-2xl text-[#8b7a6f] active:bg-[#faf8f5] active:text-[#3d2f1f]"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-[#3d2f1f]">Account Detail</h1>
          </div>
          <UserIcon />
        </div>

        <div className="p-4">
          <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 space-y-3 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <div className="text-sm text-[#8b7a6f]">
              Select an account or person from Accounts to view details.
            </div>
            <button
              onClick={() => navigate('/accounts')}
              className="w-full bg-white border border-[#ded2c0] text-[#3d2f1f] py-3 rounded-2xl font-semibold active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
            >
              Back to Accounts
            </button>
          </div>
        </div>

        <BottomNav />
      </div>
    );
  }

  const records = getRelatedRecords(account, allRecords);
  const recentActivity = getRelatedActivity(account, allActivity, records);
  const totalValue = getTotalRecordValue(records);
  const balance = records.reduce((total, record) => total + record.balanceDue, 0);
  const lastActivity = isLoading ? 'Loading...' : getLastActivity(recentActivity);

  const handleArchive = async () => {
    if (!account || account.type === 'k2') return;

    setArchiveError(null);

    if (!archiveReason.trim()) {
      setArchiveError('Archive reason is required.');
      return;
    }

    try {
      setIsArchiving(true);

      if (account.type === 'customer') {
        await accountsService.archiveCustomerAccount({
          accountId: account.id,
          reason: archiveReason,
        });
      } else {
        await peopleService.archiveFamilyPerson({
          personId: account.id,
          reason: archiveReason,
        });
      }

      navigate('/accounts');
    } catch (error) {
      setArchiveError(error instanceof Error ? error.message : 'Unable to archive record.');
    } finally {
      setIsArchiving(false);
    }
  };

  const renderAccountInfo = () => (
    <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 space-y-3 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
      <div className="flex justify-between items-start gap-3">
        <div>
          <div className="text-sm text-[#8b7a6f] mb-1">{account.type === 'family' ? 'Person name' : 'Account name'}</div>
          <div className="text-xl font-bold text-[#3d2f1f]">{account.name}</div>
        </div>
        <TypeBadge type={account.type} />
      </div>

      {account.type === 'customer' && <InfoRow label="Balance due" value={formatCurrency(balance)} large />}
      {account.type === 'k2' && <InfoRow label="Account type" value="Separate cattle-side account" />}
      {account.type === 'k2' && <InfoRow label="Status" value={balance > 0 ? `Balance ${formatCurrency(balance)}` : 'Internal Transfer'} />}
      {account.type === 'family' && <InfoRow label="Record type" value="Legacy person record" />}
      {account.type === 'family' && <InfoRow label="Open amount" value={formatCurrency(balance)} />}

      <InfoRow label="Phone" value={account.phone ?? '—'} />
      <InfoRow label="Email" value={account.email ?? '—'} />
      <InfoRow label="Notes" value={getNotes(account)} />
      <InfoRow label="Last activity" value={lastActivity} />
    </div>
  );

  const renderSummaryCards = () => {
    if (account.type === 'customer') {
      return (
        <div className="grid grid-cols-3 gap-3">
          <SummaryCard label="Total purchased" value={isLoading ? '...' : formatCurrency(totalValue)} />
          <SummaryCard label="Unpaid balance" value={isLoading ? '...' : formatCurrency(balance)} />
          <SummaryCard label="Last invoice" value={isLoading ? '...' : getLastRecordDate(records)} />
        </div>
      );
    }

    if (account.type === 'k2') {
      return (
        <div className="grid grid-cols-3 gap-3">
          <SummaryCard label="Total value used" value={isLoading ? '...' : formatCurrency(totalValue)} />
          <SummaryCard label="Current balance" value={isLoading ? '...' : balance > 0 ? formatCurrency(balance) : 'Internal'} />
          <SummaryCard label="Last statement" value={isLoading ? '...' : getLastRecordDate(records)} />
        </div>
      );
    }

    return (
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard label="Total value taken" value={isLoading ? '...' : formatCurrency(totalValue)} />
        <SummaryCard label="Open amount" value={isLoading ? '...' : formatCurrency(balance)} />
        <SummaryCard label="Last recorded use" value={isLoading ? '...' : getLastRecordDate(records)} />
      </div>
    );
  };

  const renderActions = () => (
    <div className="space-y-2">
      <ActionButton icon={<ShoppingCart size={20} />} label="Take Feed" onClick={() => navigate('/choose-sale-type')} />

      {account.type === 'customer' && (
        <>
          <ActionButton icon={<FileText size={20} />} label="Start Customer Sale" onClick={() => navigate('/choose-customer')} />
          <ActionButton icon={<DollarSign size={20} />} label="Record Payment" onClick={() => navigate('/invoices')} />
          <ActionButton icon={<List size={20} />} label="View Invoices" onClick={() => navigate('/invoices', { state: { filterType: 'customer', accountName: account.name } })} />
          <ActionButton icon={<Edit size={20} />} label="Edit Account" onClick={() => navigate('/edit-account-person', { state: { account } })} />
          <ActionButton
            icon={<Archive size={20} />}
            label="Archive Account"
            onClick={() => {
              setShowArchivePanel(true);
              setArchiveError(null);
            }}
          />
        </>
      )}

      {account.type === 'k2' && (
        <>
          <ActionButton icon={<FileText size={20} />} label="Start K2 Use" onClick={() => navigate('/k2-add-products')} />
          <ActionButton icon={<List size={20} />} label="View Statements" onClick={() => navigate('/invoices', { state: { filterType: 'k2', accountName: account.name } })} />
        </>
      )}

      {account.type === 'family' && (
        <>
          <ActionButton icon={<List size={20} />} label="View Person History" onClick={() => navigate('/invoices')} />
          <ActionButton icon={<Edit size={20} />} label="Edit Person" onClick={() => navigate('/edit-account-person', { state: { account } })} />
          <ActionButton
            icon={<Archive size={20} />}
            label="Archive Person"
            onClick={() => {
              setShowArchivePanel(true);
              setArchiveError(null);
            }}
          />
        </>
      )}

      <ActionButton icon={<Activity size={20} />} label="View Activity" onClick={() => navigate('/activity-history')} />
    </div>
  );

  const renderRecentActivity = () => (
    <div className="bg-white border border-[#ded2c0] rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
      <div className="p-4 border-b border-[#e8dfd1] bg-[#f7f4ed]">
        <h2 className="font-semibold text-[#3d2f1f]">Recent Activity</h2>
      </div>
      <div className="p-4 space-y-3">
        {isLoading && (
          <div className="text-sm text-[#8b7a6f]">Loading account activity...</div>
        )}

        {!isLoading && records.slice(0, 3).map((record) => (
          <ActivityItem
            key={record.id}
            label={record.displayNumber}
            description={record.productsSummary}
            status={getStatusLabel(record.status)}
          />
        ))}

        {!isLoading && records.length === 0 && recentActivity.length === 0 && (
          <div className="text-sm text-[#8b7a6f]">No recent activity yet.</div>
        )}

        {!isLoading && recentActivity.map((activity) => (
          <div key={activity.id} className="text-sm text-[#8b7a6f] border-t border-[#e8dfd1] pt-3">
            {activity.summary}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f4ed] pb-24">
      <div className="app-header-safe">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/accounts')}
            className="app-header-action rounded-2xl text-[#8b7a6f] active:bg-[#faf8f5] active:text-[#3d2f1f]"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-[#3d2f1f]">Account Detail</h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        {errorMessage && (
          <div className="bg-white border border-[#b7791f] rounded-2xl p-4 text-sm text-[#3d2f1f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            {errorMessage}
          </div>
        )}

        {renderAccountInfo()}
        {renderSummaryCards()}
        {renderActions()}
        {showArchivePanel && account.type !== 'k2' && (
          <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 space-y-3 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <div>
              <div className="font-semibold text-[#3d2f1f]">
                {account.type === 'customer' ? 'Archive Account' : 'Archive Person'}
              </div>
              <div className="text-sm text-[#8b7a6f] mt-1">
                This hides the record from normal account and picker screens. Historical invoices, payments, and activity stay intact.
              </div>
            </div>

            {archiveError && (
              <div className="bg-white border border-[#b7791f] rounded-2xl p-3 text-sm text-[#3d2f1f]">
                {archiveError}
              </div>
            )}

            <textarea
              value={archiveReason}
              onChange={(event) => setArchiveReason(event.target.value)}
              placeholder="Reason for archive..."
              rows={3}
              className="w-full bg-white border border-[#ded2c0] rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-[#5a7a4d] text-[#3d2f1f] placeholder:text-[#8b7a6f]"
            />

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowArchivePanel(false);
                  setArchiveError(null);
                  setArchiveReason('');
                }}
                disabled={isArchiving}
                className="flex-1 bg-white border border-[#ded2c0] text-[#3d2f1f] py-3 rounded-2xl font-semibold active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
              >
                Cancel
              </button>
              <button
                onClick={handleArchive}
                disabled={isArchiving}
                className="flex-1 bg-[#8b3f2f] text-white py-3 rounded-2xl font-semibold active:bg-[#733426] disabled:bg-[#c7bdb0] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
              >
                {isArchiving ? 'Archiving...' : 'Archive'}
              </button>
            </div>
          </div>
        )}
        {renderRecentActivity()}

        {account.type === 'k2' && (
          <div className="p-3 bg-white border border-[#ded2c0] rounded-2xl text-xs text-[#8b7a6f] leading-relaxed shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <strong>Note:</strong> K2 is not a standard customer. K2 activity is tracked separately from outside customer sales by default.
          </div>
        )}

        {account.type === 'family' && (
          <div className="p-3 bg-white border border-[#ded2c0] rounded-2xl text-xs text-[#8b7a6f] leading-relaxed shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <strong>Note:</strong> Person records should use one official display name. Search may support aliases, but duplicate person records should be avoided.
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function InfoRow({ label, value, large = false }: { label: string; value: string; large?: boolean }) {
  return (
    <div className="border-t border-[#e8dfd1] pt-3">
      <div className="text-sm text-[#8b7a6f] mb-1">{label}</div>
      <div className={large ? 'text-2xl font-bold text-[#3d2f1f]' : 'font-medium text-[#3d2f1f]'}>{value}</div>
    </div>
  );
}

function TypeBadge({ type }: { type: AccountListType }) {
  const labels: Record<AccountListType, string> = {
    customer: 'Customer',
    k2: 'K2',
    family: 'Person',
  };

  return (
    <span className="inline-block px-3 py-1 bg-[#e9f0e5] text-[#5a7a4d] text-xs font-semibold rounded-full border border-[#cbd8c4]">
      {labels[type]}
    </span>
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

function ActionButton({
  icon,
  label,
  onClick,
  disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`w-full p-3 rounded-2xl flex items-center gap-3 font-semibold shadow-[0_2px_8px_rgba(61,47,31,0.08)] transition-colors ${
        disabled
          ? 'bg-[#f7f4ed] border border-[#ded2c0] text-[#8b7a6f] cursor-not-allowed opacity-75'
          : 'bg-white border border-[#ded2c0] text-[#3d2f1f] active:bg-[#faf8f5]'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function ActivityItem({ label, description, status }: { label: string; description: string; status: string }) {
  return (
    <div className="space-y-1">
      <div className="font-semibold text-[#3d2f1f]">{label}</div>
      <div className="text-sm text-[#8b7a6f]">{description}</div>
      <div className="text-sm font-semibold text-[#5a7a4d]">{status}</div>
    </div>
  );
}

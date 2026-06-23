import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Clock, Copy, History, Mail, Plus, Users } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';
import {
  userManagementService,
  type CreateInviteResult,
  type OrganizationInvitation,
  type OrganizationUser,
} from '../services/userManagementService';
import { userProfileService, type CurrentUserProfile, type UserProfileRole } from '../services/userProfileService';

function formatRoleLabel(role: UserProfileRole): string {
  if (role === 'viewer') return 'View Only';
  return role.charAt(0).toUpperCase() + role.slice(1);
}

const allInviteRoles: UserProfileRole[] = ['admin', 'manager', 'operator', 'viewer'];
const managerInviteRoles: UserProfileRole[] = ['manager', 'operator', 'viewer'];
const expirationOptions = [7, 14, 30];

function formatDate(value?: string | null): string {
  if (!value) return 'Not set';
  return new Date(value).toLocaleDateString();
}

export default function ManageUsers() {
  const navigate = useNavigate();
  const [currentProfile, setCurrentProfile] = useState<CurrentUserProfile | null>(null);
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [invitations, setInvitations] = useState<OrganizationInvitation[]>([]);
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [showInviteHistory, setShowInviteHistory] = useState(false);
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserProfileRole>('operator');
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [latestInvite, setLatestInvite] = useState<CreateInviteResult | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);

  const loadOverview = useCallback(async () => {
    setIsLoadingOverview(true);
    setOverviewError(null);

    try {
      const [organizationUsers, organizationInvitations] = await Promise.all([
        userManagementService.listOrganizationUsers(),
        userManagementService.listOrganizationInvitations(),
      ]);

      setUsers(organizationUsers);
      setInvitations(organizationInvitations);
    } catch (error) {
      setOverviewError(error instanceof Error ? error.message : 'Unable to load users and invitations.');
    } finally {
      setIsLoadingOverview(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      try {
        const [profile, organizationUsers, organizationInvitations] = await Promise.all([
          userProfileService.getCurrentProfile(),
          userManagementService.listOrganizationUsers(),
          userManagementService.listOrganizationInvitations(),
        ]);

        if (isMounted) {
          setCurrentProfile(profile);
          setUsers(organizationUsers);
          setInvitations(organizationInvitations);
          setOverviewError(null);
        }
      } catch (error) {
        if (isMounted) {
          setCurrentProfile(null);
          setOverviewError(error instanceof Error ? error.message : 'Unable to load users and invitations.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingOverview(false);
        }
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  const roleOptions = useMemo(() => {
    if (currentProfile?.role === 'manager') {
      return managerInviteRoles;
    }

    return allInviteRoles;
  }, [currentProfile?.role]);

  useEffect(() => {
    if (!roleOptions.includes(inviteRole)) {
      setInviteRole('operator');
    }
  }, [inviteRole, roleOptions]);

  const activeUsers = users.filter((user) => user.isActive);
  const inactiveUsers = users.filter((user) => !user.isActive);
  const pendingInvites = invitations.filter((invite) => invite.status === 'pending');
  const inviteHistory = invitations.filter((invite) => invite.status !== 'pending');

  const handleCreateInvite = async () => {
    setInviteError(null);
    setCopyMessage(null);

    if (!inviteEmail.trim()) {
      setInviteError('Email is required.');
      return;
    }

    setIsCreatingInvite(true);
    setLatestInvite(null);

    try {
      const createdInvite = await userManagementService.createInvite({
        email: inviteEmail,
        role: inviteRole,
        expiresInDays,
      });

      if (!createdInvite.inviteCode) {
        setInviteError('Invite was created but no code was returned. Create a new invite.');
        await loadOverview();
        return;
      }

      setLatestInvite(createdInvite);
      setInviteEmail('');
      setInviteRole('operator');
      setExpiresInDays(7);
      setShowInvitePanel(false);
      await loadOverview();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create invite.';
      setInviteError(
        message.includes('pending invitation already exists')
          ? 'A pending invitation already exists for this email.'
          : message,
      );
    } finally {
      setIsCreatingInvite(false);
    }
  };

  const handleCopyCode = async (inviteCode: string) => {
    setCopyMessage(null);

    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopyMessage('Invite code copied.');
    } catch (_error) {
      setCopyMessage('Copy failed. Press and hold the code to copy it.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f4ed] pb-24">
      {/* Header */}
      <div className="app-header-safe">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/profile-menu')}
            className="app-header-action rounded-2xl text-[#8b7a6f] active:bg-[#faf8f5] active:text-[#3d2f1f]"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-[#3d2f1f]">Manage Users</h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        <div className="p-3 bg-white border border-[#ded2c0] rounded-2xl text-xs text-[#8b7a6f] leading-relaxed shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <strong>Beta:</strong> Invites create real pending invitation records. Invited users can now accept codes from the signup screen.
        </div>

        {overviewError && (
          <div className="p-3 bg-[#fff4f0] border border-[#d8a59a] rounded-2xl text-sm text-[#8b3f2f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <div>{overviewError}</div>
            <button
              type="button"
              onClick={loadOverview}
              className="mt-2 text-sm font-bold text-[#5a7a4d]"
            >
              Try again
            </button>
          </div>
        )}

        {latestInvite && (
          <div className="bg-[#e9f0e5] border border-[#cbd8c4] rounded-2xl p-4 space-y-3 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#5a7a4d] text-white flex items-center justify-center shrink-0">
                <Check size={20} />
              </div>
              <div>
                <h2 className="font-bold text-[#3d2f1f]">Invite created</h2>
                <p className="text-sm text-[#5a7a4d] font-semibold">
                  Copy this code now. It will only be shown once.
                </p>
              </div>
            </div>

            <div className="bg-white border border-[#cbd8c4] rounded-2xl p-4">
              <div className="text-xs font-bold text-[#8b7a6f] uppercase">Invite code</div>
              <div className="mt-1 flex items-center justify-between gap-3">
                <div className="text-3xl font-bold tracking-[0.18em] text-[#3d2f1f] break-all">
                  {latestInvite.inviteCode}
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCode(latestInvite.inviteCode)}
                  className="h-12 rounded-2xl bg-[#5a7a4d] px-4 text-white flex items-center justify-center gap-2 active:bg-[#4a6a3d] shrink-0 shadow-[0_2px_8px_rgba(61,47,31,0.12)]"
                  aria-label="Copy invite code"
                >
                  <Copy size={20} />
                  <span className="text-sm font-bold">Copy</span>
                </button>
              </div>
              {copyMessage && (
                <div className="mt-2 text-sm font-semibold text-[#5a7a4d]">{copyMessage}</div>
              )}
            </div>

            <div className="grid gap-2 text-sm text-[#3d2f1f]">
              <InviteSummaryRow label="Email" value={latestInvite.invitation.email} />
              <InviteSummaryRow label="Role" value={formatRoleLabel(latestInvite.invitation.role)} />
              <InviteSummaryRow
                label="Expires"
                value={new Date(latestInvite.invitation.expiresAt).toLocaleDateString()}
              />
            </div>
          </div>
        )}

        <OverviewSection
          title="Active Users"
          icon={<Users size={20} />}
          isLoading={isLoadingOverview}
          itemCount={users.length}
          emptyMessage="No active users found."
        >
          <div className="space-y-3">
            {activeUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
            {inactiveUsers.length > 0 && (
              <div className="rounded-2xl border border-[#ded2c0] bg-[#faf8f5] p-3">
                <div className="mb-2 text-xs font-bold uppercase text-[#8b7a6f]">Inactive</div>
                <div className="space-y-2">
                  {inactiveUsers.map((user) => (
                    <UserCard key={user.id} user={user} compact />
                  ))}
                </div>
              </div>
            )}
          </div>
        </OverviewSection>

        <OverviewSection
          title="Pending Invites"
          icon={<Clock size={20} />}
          isLoading={isLoadingOverview}
          itemCount={pendingInvites.length}
          emptyMessage="No pending invites."
        >
          <div className="space-y-3">
            {pendingInvites.map((invite) => (
              <InvitationCard key={invite.id} invitation={invite} />
            ))}
          </div>
        </OverviewSection>

        {inviteHistory.length > 0 && (
          <div className="bg-white border border-[#ded2c0] rounded-2xl shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <button
              type="button"
              onClick={() => setShowInviteHistory((current) => !current)}
              className="flex w-full items-center justify-between gap-3 p-4 text-left"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f7f4ed] text-[#8b7a6f]">
                  <History size={20} />
                </span>
                <span>
                  <span className="block font-bold text-[#3d2f1f]">Invite History</span>
                  <span className="block text-sm text-[#8b7a6f]">
                    {inviteHistory.length} accepted, revoked, or expired invite{inviteHistory.length === 1 ? '' : 's'}
                  </span>
                </span>
              </span>
              <span className="text-sm font-bold text-[#5a7a4d]">
                {showInviteHistory ? 'Hide' : 'Show'}
              </span>
            </button>
            {showInviteHistory && (
              <div className="space-y-3 border-t border-[#e8dfd1] p-4">
                {inviteHistory.map((invite) => (
                  <InvitationCard key={invite.id} invitation={invite} compact />
                ))}
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setShowInvitePanel((current) => !current);
            setInviteError(null);
            setCopyMessage(null);
          }}
          className="w-full bg-[#5a7a4d] text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 active:bg-[#4a6a3d] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
        >
          <Plus size={20} />
          Create Invite
        </button>

        {showInvitePanel && (
          <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 space-y-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <div>
              <h2 className="font-bold text-[#3d2f1f] mb-1">Create Invite</h2>
              <p className="text-sm text-[#8b7a6f]">
                This creates a pending invite code. You will need to share the code manually.
              </p>
            </div>

            {inviteError && (
              <div className="p-3 bg-[#fff4f0] border border-[#d8a59a] rounded-2xl text-sm text-[#8b3f2f]">
                {inviteError}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-[#3d2f1f] mb-2">Email</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 bg-white border border-[#ded2c0] rounded-2xl text-[#3d2f1f] placeholder:text-[#8b7a6f] focus:outline-none focus:ring-2 focus:ring-[#5a7a4d]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#3d2f1f] mb-2">Role</label>
              <select
                value={inviteRole}
                onChange={(event) => setInviteRole(event.target.value as UserProfileRole)}
                className="w-full px-4 py-3 bg-white border border-[#ded2c0] rounded-2xl text-[#3d2f1f] focus:outline-none focus:ring-2 focus:ring-[#5a7a4d]"
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {formatRoleLabel(role)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#3d2f1f] mb-2">Expires</label>
              <select
                value={expiresInDays}
                onChange={(event) => setExpiresInDays(Number(event.target.value))}
                className="w-full px-4 py-3 bg-white border border-[#ded2c0] rounded-2xl text-[#3d2f1f] focus:outline-none focus:ring-2 focus:ring-[#5a7a4d]"
              >
                {expirationOptions.map((days) => (
                  <option key={days} value={days}>
                    {days} days
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowInvitePanel(false);
                  setInviteError(null);
                }}
                className="bg-white border border-[#ded2c0] text-[#3d2f1f] py-3 rounded-2xl font-semibold active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateInvite}
                disabled={isCreatingInvite}
                className="bg-[#5a7a4d] text-white py-3 rounded-2xl font-semibold active:bg-[#4a6a3d] disabled:bg-[#c7bdb0] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
              >
                {isCreatingInvite ? 'Creating...' : 'Create Invite'}
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 p-3 bg-white border border-[#ded2c0] rounded-2xl text-xs text-[#8b7a6f] leading-relaxed shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <strong>Access:</strong> Create Invite requires an active admin or manager profile. Invite codes are shown only once when created and cannot be retrieved later.
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function OverviewSection({
  title,
  icon,
  isLoading,
  itemCount,
  emptyMessage,
  children,
}: {
  title: string;
  icon: ReactNode;
  isLoading: boolean;
  itemCount: number;
  emptyMessage: string;
  children: ReactNode;
}) {
  return (
    <section className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e9f0e5] text-[#5a7a4d]">
          {icon}
        </span>
        <h2 className="font-bold text-[#3d2f1f]">{title}</h2>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-[#ded2c0] bg-[#faf8f5] p-3 text-sm text-[#8b7a6f]">
          Loading...
        </div>
      ) : itemCount === 0 ? (
        <div className="rounded-2xl border border-[#ded2c0] bg-[#faf8f5] p-3 text-sm text-[#8b7a6f]">
          {emptyMessage}
        </div>
      ) : (
        children
      )}
    </section>
  );
}

function UserCard({ user, compact = false }: { user: OrganizationUser; compact?: boolean }) {
  return (
    <div className={`rounded-2xl border border-[#ded2c0] bg-white ${compact ? 'p-3' : 'p-4'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-bold text-[#3d2f1f] truncate">{user.displayName}</div>
          <div className="mt-1 text-sm text-[#8b7a6f]">Email not available</div>
        </div>
        <InviteChip label={user.isActive ? 'Active' : 'Inactive'} tone={user.isActive ? 'green' : 'neutral'} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <InviteChip label={formatRoleLabel(user.role)} tone="green" />
        <InviteChip label={`Joined ${formatDate(user.createdAt)}`} tone="neutral" />
      </div>
    </div>
  );
}

function InvitationCard({
  invitation,
  compact = false,
}: {
  invitation: OrganizationInvitation;
  compact?: boolean;
}) {
  const isPending = invitation.status === 'pending';

  return (
    <div className={`rounded-2xl border border-[#ded2c0] bg-white ${compact ? 'p-3' : 'p-4'}`}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#f7f4ed] text-[#5a7a4d]">
          <Mail size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-[#3d2f1f] truncate">{invitation.email}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <InviteChip label={formatRoleLabel(invitation.role)} tone="green" />
            <InviteChip label={formatStatusLabel(invitation.status)} tone={isPending ? 'amber' : 'neutral'} />
          </div>
        </div>
      </div>
      <div className="mt-3 grid gap-1 text-sm text-[#6f5f54]">
        <InviteSummaryRow label="Created" value={formatDate(invitation.createdAt)} />
        <InviteSummaryRow label="Expires" value={formatDate(invitation.expiresAt)} />
        {invitation.acceptedAt && <InviteSummaryRow label="Accepted" value={formatDate(invitation.acceptedAt)} />}
        {invitation.revokedAt && <InviteSummaryRow label="Revoked" value={formatDate(invitation.revokedAt)} />}
      </div>
    </div>
  );
}

function formatStatusLabel(status: OrganizationInvitation['status']): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function InviteChip({ label, tone }: { label: string; tone: 'green' | 'amber' | 'neutral' }) {
  const colorClass =
    tone === 'green'
      ? 'bg-[#e9f0e5] border-[#cbd8c4] text-[#5a7a4d]'
      : tone === 'amber'
        ? 'bg-[#fff4d8] border-[#d4a574] text-[#8b5a1f]'
        : 'bg-[#f7f4ed] border-[#ded2c0] text-[#8b7a6f]';

  return (
    <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${colorClass}`}>
      {label}
    </span>
  );
}

function InviteSummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[#8b7a6f] font-semibold">{label}</span>
      <span className="font-bold text-right break-all">{value}</span>
    </div>
  );
}

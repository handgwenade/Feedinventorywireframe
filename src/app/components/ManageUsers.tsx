import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Copy, Mail, Plus } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';
import { userManagementService, type CreateInviteResult } from '../services/userManagementService';
import { userProfileService, type CurrentUserProfile, type UserProfileRole } from '../services/userProfileService';

function formatRoleLabel(role: UserProfileRole): string {
  if (role === 'viewer') return 'View Only';
  return role.charAt(0).toUpperCase() + role.slice(1);
}

const allInviteRoles: UserProfileRole[] = ['admin', 'manager', 'operator', 'viewer'];
const managerInviteRoles: UserProfileRole[] = ['manager', 'operator', 'viewer'];
const expirationOptions = [7, 14, 30];

export default function ManageUsers() {
  const navigate = useNavigate();
  const [currentProfile, setCurrentProfile] = useState<CurrentUserProfile | null>(null);
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserProfileRole>('operator');
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [createdInvites, setCreatedInvites] = useState<CreateInviteResult[]>([]);
  const [latestInvite, setLatestInvite] = useState<CreateInviteResult | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadCurrentProfile() {
      try {
        const profile = await userProfileService.getCurrentProfile();
        if (isMounted) {
          setCurrentProfile(profile);
        }
      } catch (_error) {
        if (isMounted) {
          setCurrentProfile(null);
        }
      }
    }

    loadCurrentProfile();

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

  const handleCreateInvite = async () => {
    setInviteError(null);
    setCopyMessage(null);

    if (!inviteEmail.trim()) {
      setInviteError('Email is required.');
      return;
    }

    setIsCreatingInvite(true);

    try {
      const createdInvite = await userManagementService.createInvite({
        email: inviteEmail,
        role: inviteRole,
        expiresInDays,
      });

      setLatestInvite(createdInvite);
      setCreatedInvites((currentInvites) => [createdInvite, ...currentInvites]);
      setInviteEmail('');
      setInviteRole('operator');
      setExpiresInDays(7);
      setShowInvitePanel(false);
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
      <div className="bg-white border-b border-[#e8dfd1] p-4 flex items-center justify-between shadow-[0_1px_4px_rgba(61,47,31,0.06)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/profile-menu')}
            className="text-[#8b7a6f] active:text-[#3d2f1f]"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-[#3d2f1f]">Manage Users</h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        <div className="p-3 bg-white border border-[#ded2c0] rounded-2xl text-xs text-[#8b7a6f] leading-relaxed shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <strong>Beta:</strong> Invites create real pending invitation records. Account acceptance is not wired yet.
        </div>

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
                  onClick={() => handleCopyCode(latestInvite.inviteCode)}
                  className="h-12 w-12 rounded-2xl bg-[#5a7a4d] text-white flex items-center justify-center active:bg-[#4a6a3d] shrink-0 shadow-[0_2px_8px_rgba(61,47,31,0.12)]"
                  aria-label="Copy invite code"
                >
                  <Copy size={20} />
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

        <button
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
                onClick={() => {
                  setShowInvitePanel(false);
                  setInviteError(null);
                }}
                className="bg-white border border-[#ded2c0] text-[#3d2f1f] py-3 rounded-2xl font-semibold active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateInvite}
                disabled={isCreatingInvite}
                className="bg-[#5a7a4d] text-white py-3 rounded-2xl font-semibold active:bg-[#4a6a3d] disabled:bg-[#c7bdb0] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
              >
                {isCreatingInvite ? 'Creating...' : 'Create Invite'}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {createdInvites.length === 0 ? (
            <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 text-sm text-[#8b7a6f] leading-relaxed shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
              Created invite codes will appear here for this session. Invite emails are not sent yet.
            </div>
          ) : (
            createdInvites.map((invite) => (
              <InviteCard key={invite.invitation.id} invite={invite} onCopyCode={handleCopyCode} />
            ))
          )}
        </div>

        <div className="mt-6 p-3 bg-white border border-[#ded2c0] rounded-2xl text-xs text-[#8b7a6f] leading-relaxed shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <strong>Access:</strong> Create Invite requires an active admin or manager profile. Signup acceptance is still future work.
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function InviteCard({
  invite,
  onCopyCode,
}: {
  invite: CreateInviteResult;
  onCopyCode: (inviteCode: string) => void;
}) {
  return (
    <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#f7f4ed] text-[#5a7a4d] flex items-center justify-center shrink-0">
          <Mail size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-[#3d2f1f] truncate">{invite.invitation.email}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <InviteChip label={formatRoleLabel(invite.invitation.role)} tone="green" />
            <InviteChip label="Pending" tone="amber" />
            <InviteChip
              label={`Expires ${new Date(invite.invitation.expiresAt).toLocaleDateString()}`}
              tone="neutral"
            />
          </div>
        </div>
      </div>
      <button
        onClick={() => onCopyCode(invite.inviteCode)}
        className="mt-3 w-full bg-white border border-[#ded2c0] text-[#3d2f1f] py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
      >
        <Copy size={16} />
        Copy Invite Code
      </button>
    </div>
  );
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

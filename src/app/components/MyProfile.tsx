import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Edit, Key, LogOut, Trash2 } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';
import { supabase } from '../services/supabaseClient';
import { authService } from '../services/authService';
import { userProfileService } from '../services/userProfileService';
import type { CurrentUserProfile } from '../services/userProfileService';

export default function MyProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CurrentUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const liveProfile = await userProfileService.getCurrentProfile();

        if (isMounted) {
          setProfile(liveProfile);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Unable to load profile.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    setDeleteErrorMessage(null);

    try {
      await authService.deleteAccount();
      await supabase.auth.signOut();
      navigate('/login', {
        replace: true,
        state: { message: 'Your account has been deleted. You have been signed out.' },
      });
    } catch (error) {
      setDeleteErrorMessage(error instanceof Error ? error.message : 'Unable to delete account.');
      setIsDeletingAccount(false);
    }
  };

  const displayName = profile?.displayName ?? profile?.email ?? 'Current User';
  const roleLabel = profile ? userProfileService.formatRole(profile.role) : '—';

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
          <h1 className="text-xl font-bold text-[#3d2f1f]">My Profile</h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        {errorMessage && (
          <div className="bg-white border border-[#b7791f] rounded-2xl p-4 text-sm text-[#3d2f1f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            {errorMessage}
          </div>
        )}

        {/* Profile Info */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 space-y-3 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div>
            <div className="text-sm text-[#8b7a6f] mb-1">Name</div>
            <div className="font-medium text-[#3d2f1f]">{isLoading ? 'Loading...' : displayName}</div>
          </div>

          <div className="border-t border-[#e8dfd1] pt-3">
            <div className="text-sm text-[#8b7a6f] mb-1">Email</div>
            <div className="font-medium text-[#3d2f1f]">{isLoading ? 'Loading...' : profile?.email ?? '—'}</div>
          </div>

          <div className="border-t border-[#e8dfd1] pt-3">
            <div className="text-sm text-[#8b7a6f] mb-1">Business</div>
            <div className="font-medium text-[#3d2f1f]">{isLoading ? 'Loading...' : profile?.organizationName ?? '—'}</div>
          </div>

          <div className="border-t border-[#e8dfd1] pt-3">
            <div className="text-sm text-[#8b7a6f] mb-1">Current role</div>
            <div className="font-medium text-[#3d2f1f]">{isLoading ? 'Loading...' : roleLabel}</div>
          </div>

          <div className="border-t border-[#e8dfd1] pt-3">
            <div className="text-sm text-[#8b7a6f] mb-1">Profile status</div>
            <div className="font-medium text-[#3d2f1f]">{isLoading ? 'Loading...' : profile?.isActive ? 'Active' : 'Inactive'}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <ActionButton
            icon={<Edit size={20} />}
            label="Edit Profile (Not Ready)"
            onClick={() => {}}
            disabled
          />
          <ActionButton
            icon={<Key size={20} />}
            label="Change Password"
            onClick={() => navigate('/update-password')}
          />
          <ActionButton
            icon={<LogOut size={20} />}
            label="Sign Out"
            onClick={handleSignOut}
          />
        </div>

        {/* Delete Account */}
        <div className="bg-white border border-[#d8a59a] rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div className="p-4 border-b border-[#f0d4cd] bg-[#fff4f0]">
            <div className="flex items-center gap-2 text-[#8b3f2f]">
              <Trash2 size={20} />
              <h2 className="font-semibold">Delete Account</h2>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-sm leading-relaxed text-[#8b7a6f]">
              Delete your login and personal profile access from StockLog.
            </p>

            {deleteErrorMessage && (
              <div className="rounded-2xl border border-[#d8a59a] bg-[#fff4f0] p-3 text-sm text-[#8b3f2f]">
                {deleteErrorMessage}
              </div>
            )}

            {!showDeleteConfirmation ? (
              <button
                type="button"
                onClick={() => {
                  setDeleteErrorMessage(null);
                  setShowDeleteConfirmation(true);
                }}
                className="w-full border border-[#d8a59a] bg-white text-[#8b3f2f] py-3 rounded-2xl font-semibold active:bg-[#fff4f0] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
              >
                Delete Account
              </button>
            ) : (
              <div className="space-y-3">
                <div className="rounded-2xl border border-[#d8a59a] bg-[#fff4f0] p-3 text-sm text-[#3d2f1f] leading-relaxed">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={18} className="mt-0.5 shrink-0 text-[#8b3f2f]" />
                    <div className="space-y-2">
                      <p>
                        Deleting your account removes your StockLog login and personal profile access.
                      </p>
                      <p>
                        Shared ranch or business records, including inventory, invoices, transactions, products, payments, and accounts, may remain as organization records.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteConfirmation(false);
                      setDeleteErrorMessage(null);
                    }}
                    disabled={isDeletingAccount}
                    className="w-full bg-white border border-[#ded2c0] text-[#3d2f1f] py-3 rounded-2xl font-semibold active:bg-[#faf8f5] disabled:opacity-60 shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={isDeletingAccount}
                    className="w-full bg-[#8b3f2f] text-white py-3 rounded-2xl font-semibold active:bg-[#723426] disabled:bg-[#c7bdb0] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
                  >
                    {isDeletingAccount ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
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
      className={`w-full p-4 rounded-2xl flex items-center gap-3 font-semibold bg-white border border-[#ded2c0] text-[#3d2f1f] active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)] transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

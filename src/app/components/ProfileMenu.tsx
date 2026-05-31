import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Settings, Shield, HelpCircle, LogOut, Users, Lock, Building } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';
import { supabase } from '../services/supabaseClient';
import { userProfileService } from '../services/userProfileService';
import type { CurrentUserProfile } from '../services/userProfileService';

export default function ProfileMenu() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CurrentUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const displayName = profile?.displayName ?? profile?.email ?? 'Current User';
  const roleLabel = profile ? userProfileService.formatRole(profile.role) : '—';
  const businessName = profile?.organizationName ?? 'C&C Feed Inventory';
  const userRole = profile?.role;

  return (
    <div className="min-h-screen bg-[#f7f4ed] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-[#e8dfd1] p-4 flex items-center justify-between shadow-[0_1px_4px_rgba(61,47,31,0.06)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-[#8b7a6f] active:text-[#3d2f1f]"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-[#3d2f1f]">Profile</h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        {errorMessage && (
          <div className="bg-white border border-[#b7791f] rounded-2xl p-4 text-sm text-[#3d2f1f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            {errorMessage}
          </div>
        )}

        {/* Current User Info */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-16 h-16 bg-[#e9f0e5] rounded-full flex items-center justify-center border-2 border-[#cbd8c4] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
              <User size={32} className="text-[#5a7a4d]" />
            </div>
            <div>
              <div className="font-bold text-[#3d2f1f] text-lg">{isLoading ? 'Loading...' : displayName}</div>
              <div className="text-sm text-[#8b7a6f]">{isLoading ? '—' : roleLabel}</div>
              {!isLoading && profile?.email && (
                <div className="text-sm text-[#8b7a6f]">{profile.email}</div>
              )}
            </div>
          </div>
          <div className="border-t border-[#e8dfd1] pt-3">
            <div className="text-sm text-[#8b7a6f] mb-1">Business</div>
            <div className="font-semibold text-[#3d2f1f]">{isLoading ? 'Loading...' : businessName}</div>
          </div>
        </div>

        {/* Menu Options */}
        <div className="space-y-2">
          <MenuOption
            icon={<User size={20} />}
            label="My Profile"
            onClick={() => navigate('/my-profile')}
          />
          <MenuOption
            icon={<Settings size={20} />}
            label="Settings"
            onClick={() => navigate('/settings')}
          />
          <MenuOption
            icon={<Shield size={20} />}
            label="Current Role & Permissions"
            onClick={() => navigate('/role-permissions')}
          />
          <MenuOption
            icon={<HelpCircle size={20} />}
            label="Help / Support"
            onClick={() => {}}
          />

          {/* Admin-only options */}
          {userRole === 'admin' && (
            <>
              <div className="pt-4 pb-2">
                <div className="text-xs font-semibold text-[#8b7a6f] uppercase tracking-wide">Admin Tools</div>
              </div>
              <MenuOption
                icon={<Users size={20} />}
                label="Manage Users"
                onClick={() => navigate('/manage-users')}
              />
              <MenuOption
                icon={<Lock size={20} />}
                label="Manage Permissions (Coming Soon)"
                onClick={() => {}}
                disabled
              />
              <MenuOption
                icon={<Building size={20} />}
                label="Business Settings (Coming Soon)"
                onClick={() => {}}
                disabled
              />
            </>
          )}

          <div className="pt-4">
            <MenuOption
              icon={<LogOut size={20} />}
              label="Sign Out"
              onClick={handleSignOut}
              danger
            />
          </div>
        </div>

        {/* Annotations */}
        <div className="mt-6 space-y-3">
          <div className="p-3 bg-white border border-[#ded2c0] rounded-2xl text-xs text-[#8b7a6f] leading-relaxed shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <strong>Role-based menu:</strong> User/profile area is role-based. Admin sees management tools. Operators see personal settings and permissions only.
          </div>
          <div className="p-3 bg-white border border-[#ded2c0] rounded-2xl text-xs text-[#8b7a6f] leading-relaxed shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <strong>Cost visibility:</strong> Cost per unit visibility is permission-based and should only be available to Admin/Manager unless explicitly overridden.
          </div>
          <div className="p-3 bg-white border border-[#ded2c0] rounded-2xl text-xs text-[#8b7a6f] leading-relaxed shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            <strong>View Only users:</strong> View Only users can view allowed screens but cannot create, edit, record payments, or adjust inventory.
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function MenuOption({
  icon,
  label,
  onClick,
  danger = false,
  disabled = false
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`w-full p-4 rounded-2xl flex items-center gap-3 font-semibold shadow-[0_2px_8px_rgba(61,47,31,0.08)] transition-colors ${
        disabled
          ? 'bg-[#f7f4ed] border border-[#ded2c0] text-[#8b7a6f] cursor-not-allowed opacity-75'
          : danger
            ? 'bg-white border border-[#ded2c0] text-[#8b3f2f] active:bg-[#fff4f0]'
            : 'bg-white border border-[#ded2c0] text-[#3d2f1f] active:bg-[#faf8f5]'
      }`}
    >
      <div className={disabled ? 'text-[#8b7a6f]' : danger ? 'text-[#8b3f2f]' : 'text-[#5a7a4d]'}>{icon}</div>
      <span>{label}</span>
    </button>
  );
}

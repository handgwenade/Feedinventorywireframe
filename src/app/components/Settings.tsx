import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import UserIcon from './shared/UserIcon';

export default function Settings() {
  const navigate = useNavigate();
  const [showProductPhotos, setShowProductPhotos] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);

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
          <h1 className="text-xl font-bold text-[#3d2f1f]">Settings</h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        {/* App Preferences */}
        <div className="p-3 bg-white border border-[#ded2c0] rounded-2xl text-xs text-[#8b7a6f] leading-relaxed shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <strong>Wireframe settings:</strong> These controls are local placeholders and do not save to Supabase yet.
        </div>

        <div className="bg-white border border-[#ded2c0] rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div className="p-4 border-b border-[#e8dfd1] bg-[#f7f4ed]">
            <h2 className="font-semibold text-[#3d2f1f]">App Preferences</h2>
          </div>
          <div className="p-4 space-y-3">
            <SettingDropdown label="Default landing screen" value="Home" />
            <SettingDropdown label="Notification preferences" value="Enabled" />
            <SettingToggle
              label="Low-stock alerts"
              value={lowStockAlerts}
              onChange={setLowStockAlerts}
            />
          </div>
        </div>

        {/* Inventory Settings */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div className="p-4 border-b border-[#e8dfd1] bg-[#f7f4ed]">
            <h2 className="font-semibold text-[#3d2f1f]">Inventory Settings</h2>
          </div>
          <div className="p-4 space-y-3">
            <SettingToggle
              label="Show product photos"
              value={showProductPhotos}
              onChange={setShowProductPhotos}
            />
            <SettingDropdown label="Default product sort" value="Name (A-Z)" />
            <SettingDropdown label="Low-stock alert behavior" value="Notify immediately" />
          </div>
        </div>

        {/* Invoice Settings */}
        <div className="bg-white border border-[#ded2c0] rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <div className="p-4 border-b border-[#e8dfd1] bg-[#f7f4ed]">
            <h2 className="font-semibold text-[#3d2f1f]">Invoice Settings</h2>
          </div>
          <div className="p-4 space-y-3">
            <SettingDropdown label="Default due terms" value="Due on receipt" />
            <SettingDropdown label="Tax default" value="Off" />
            <SettingDropdown label="PDF/print preferences" value="Standard layout" />
          </div>
        </div>

        {/* Note */}
        <div className="p-3 bg-white border border-[#ded2c0] rounded-2xl text-xs text-[#8b7a6f] leading-relaxed shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
          <strong>Note:</strong> Some settings may be Admin/Manager only.
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function SettingDropdown({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm font-medium text-[#8b7a6f] mb-2">{label}</div>
      <button className="w-full bg-white border border-[#ded2c0] rounded-2xl p-3 flex items-center justify-between text-[#3d2f1f] active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
        <span className="font-semibold">{value}</span>
        <ChevronDown size={20} className="text-[#8b7a6f]" />
      </button>
    </div>
  );
}

function SettingToggle({
  label,
  value,
  onChange
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm font-medium text-[#3d2f1f]">{label}</div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          value ? 'bg-[#5a7a4d]' : 'bg-[#ded2c0]'
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
            value ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

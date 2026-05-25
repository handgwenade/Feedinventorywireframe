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
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/profile-menu')}
            className="text-gray-600 active:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        {/* App Preferences */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">App Preferences</h2>
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
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">Inventory Settings</h2>
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
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">Invoice Settings</h2>
          </div>
          <div className="p-4 space-y-3">
            <SettingDropdown label="Default due terms" value="Due on receipt" />
            <SettingDropdown label="Tax default" value="Off" />
            <SettingDropdown label="PDF/print preferences" value="Standard layout" />
          </div>
        </div>

        {/* Note */}
        <div className="p-3 bg-gray-50 border border-gray-300 rounded text-xs text-gray-600 leading-relaxed">
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
      <div className="text-sm text-gray-600 mb-2">{label}</div>
      <button className="w-full bg-white border border-gray-300 rounded-lg p-3 flex items-center justify-between text-gray-900 active:bg-gray-50">
        <span className="font-medium">{value}</span>
        <ChevronDown size={20} className="text-gray-500" />
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
      <div className="text-sm text-gray-700">{label}</div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          value ? 'bg-gray-900' : 'bg-gray-300'
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

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import UserIcon from './shared/UserIcon';
import BottomNav from './shared/BottomNav';
import { accountsService } from '../services/accountsService';
import type { Account } from '../types';

type AccountListType = 'customer' | 'k2';

interface AccountDetailRouteItem {
  id: string;
  name: string;
  type: AccountListType;
  balance: number;
  lastActivity: string;
  phone?: string;
  email?: string;
  source: Account;
}

export default function AddAccountPerson() {
  const navigate = useNavigate();

  // Customer fields
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigateToAccountDetail = (account: AccountDetailRouteItem) => {
    navigate('/account-detail', { state: { account } });
  };

  const handleSaveCustomer = async () => {
    setErrorMessage(null);

    if (!businessName.trim()) {
      setErrorMessage('Customer account name is required.');
      return;
    }

    try {
      setIsSaving(true);
      const account = await accountsService.createCustomerAccount({
        name: businessName,
        phone,
        email,
        billingAddress: address,
        notes,
      });

      navigateToAccountDetail({
        id: account.id,
        name: account.name,
        type: 'customer',
        balance: 0,
        lastActivity: new Date().toLocaleDateString(),
        phone: account.phone,
        email: account.email,
        source: account,
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to create customer account.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f4ed] pb-32">
      {/* Header */}
      <div className="bg-white border-b border-[#e8dfd1] p-4 flex items-center justify-between shadow-[0_1px_4px_rgba(61,47,31,0.06)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/accounts')}
            className="text-[#8b7a6f] active:text-[#3d2f1f]"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-[#3d2f1f]">Add Account</h1>
        </div>
        <UserIcon />
      </div>

      <div className="p-4 space-y-4">
        {errorMessage && (
          <div className="bg-white border border-[#b7791f] rounded-2xl p-4 text-sm text-[#3d2f1f] shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
            {errorMessage}
          </div>
        )}

        {/* Customer Form */}
        <>
          <FormField
            label="Name"
            value={businessName}
            onChange={setBusinessName}
            placeholder="Enter customer or business name..."
          />
          <FormField
            label="Phone"
            value={phone}
            onChange={setPhone}
            placeholder="(555) 123-4567"
            type="tel"
          />
          <FormField
            label="Email"
            value={email}
            onChange={setEmail}
            placeholder="email@example.com"
            type="email"
          />
          <FormField
            label="Billing address"
            value={address}
            onChange={setAddress}
            placeholder="Enter billing address..."
            multiline
          />
          <FormField
            label="Notes"
            value={notes}
            onChange={setNotes}
            placeholder="Add notes..."
            multiline
          />
        </>
      </div>

      {/* Fixed Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e8dfd1] p-4 max-w-md mx-auto space-y-2 shadow-[0_-4px_18px_rgba(61,47,31,0.14)]">
        <button
          onClick={handleSaveCustomer}
          disabled={isSaving}
          className="w-full bg-[#5a7a4d] text-white py-4 rounded-2xl font-semibold active:bg-[#4a6a3d] disabled:bg-[#c7bdb0] shadow-[0_3px_10px_rgba(61,47,31,0.18)]"
        >
          {isSaving ? 'Saving Account...' : 'Save Account'}
        </button>
        <button
          onClick={() => navigate('/accounts')}
          disabled={isSaving}
          className="w-full bg-white border border-[#ded2c0] text-[#3d2f1f] py-3 rounded-2xl font-semibold active:bg-[#faf8f5] shadow-[0_2px_8px_rgba(61,47,31,0.08)]"
        >
          Cancel
        </button>

        {/* Annotation */}
        <div className="mt-3 p-3 bg-[#f7f4ed] border border-[#ded2c0] rounded-2xl text-xs text-[#8b7a6f] leading-relaxed">
          <strong>Role-based access:</strong><br />
          Only Admin/Manager should add or merge customer accounts by default. Operators may request or add new records if allowed, but new records should be reviewed.
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  multiline = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  multiline?: boolean;
}) {
  return (
    <div className="bg-white border border-[#ded2c0] rounded-2xl p-4 shadow-[0_2px_8px_rgba(61,47,31,0.08)]">
      <label className="block text-sm font-semibold text-[#3d2f1f] mb-2">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full bg-white border border-[#ded2c0] rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-[#5a7a4d] text-[#3d2f1f] placeholder:text-[#8b7a6f]"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-white border border-[#ded2c0] rounded-2xl text-[#3d2f1f] placeholder:text-[#8b7a6f] focus:outline-none focus:ring-2 focus:ring-[#5a7a4d]"
        />
      )}
    </div>
  );
}
